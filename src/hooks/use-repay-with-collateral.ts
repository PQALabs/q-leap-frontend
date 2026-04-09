'use client';

/**
 * useRepayWithCollateral
 *
 * Manages the full "Repay With Collateral" flow using UniswapV3RepayAdapter.
 *
 * Flow:
 *  1. Quote  — simulateContract(getAmountsIn) to get exact collateral needed for debt amount
 *  2. Approve — ensure aToken allowance to adapter is sufficient (MAX_UINT256)
 *  3. Execute — either swapAndRepay (direct) or lendingPool.flashLoan (flash loan mode)
 *
 * Flash loan is triggered when removing collateral first would drop HF to <= 1.01,
 * which matches the Aave V2 UI guide logic (Section 7.3).
 *
 * IMPORTANT: getAmountsIn is NON-VIEW on V3 (calls QuoterV2 internally).
 * We use wagmi's simulateContract to call it as a static simulation (callStatic equivalent).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { encodeAbiParameters, formatUnits, parseAbiParameters, parseUnits, zeroHash } from 'viem';
import { usePublicClient, useWaitForTransactionReceipt, useWalletClient } from 'wagmi';
import { erc20Abi, lendingPoolAbi } from '@/abi/generated';
import { uniswapV3RepayAdapterAbi } from '@/abi/uniswap-v3-repay-adapter-abi';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RepayWithCollateralStatus =
  | 'idle'
  | 'quoting'
  | 'approving'
  | 'confirming-approve'
  | 'executing'
  | 'confirming-exec'
  | 'error';

export interface UseRepayWithCollateralOptions {
  /** Collateral token underlying asset address */
  collateralAsset: `0x${string}` | undefined;
  /** Collateral token decimals */
  collateralDecimals: number;
  /** The aToken address that corresponds to the collateral asset */
  collateralATokenAddress: `0x${string}` | undefined;
  /** Debt token underlying asset address */
  debtAsset: `0x${string}` | undefined;
  /** Debt token decimals */
  debtDecimals: number;
  /** User wallet address */
  userAddress: `0x${string}` | undefined;
  /** Human-readable amount of DEBT to repay */
  debtAmountHuman: string;
  /** Whether to repay maximum debt (uses current on-chain balance) */
  isMaxDebt?: boolean;
  /** Debt rate mode: 1 = stable, 2 = variable (default) */
  rateMode?: bigint;
  /** Slippage in basis points, e.g. 200 = 2% (default) */
  slippageBps?: number;
  /** HF before collateral is pulled — used to decide flash loan */
  hfBeforeCollateralEffect?: number;
  /** Callback after successful execution */
  onSuccess?: () => void;
}

// ─── Approval buffer: 1% on top of maxCollateral to cover minor price drift ──
// between the time of quote and the time execute() is called.
const APPROVAL_BUFFER_BPS = 100; // 1%

// ─── Empty permit (no EIP-2612 permit supported in first version) ─────────────

const EMPTY_PERMIT = {
  amount: BigInt(0),
  deadline: BigInt(0),
  v: 0,
  r: zeroHash,
  s: zeroHash,
} as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRepayWithCollateral({
  collateralAsset,
  collateralDecimals,
  collateralATokenAddress,
  debtAsset,
  debtDecimals,
  userAddress,
  debtAmountHuman,
  isMaxDebt = false,
  rateMode = BigInt(2),
  slippageBps = 200,
  hfBeforeCollateralEffect,
  onSuccess,
}: UseRepayWithCollateralOptions) {
  const { currentMarketData } = useProtocolDataContext();
  const adapterAddress = currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER as `0x${string}` | undefined;
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // ─── State ──────────────────────────────────────────────────────────────────
  const [status, setStatus] = useState<RepayWithCollateralStatus>('idle');
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [collateralNeededRaw, setCollateralNeededRaw] = useState<bigint | null>(null);
  const [isMultiHopPath, setIsMultiHopPath] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [execTxHash, setExecTxHash] = useState<`0x${string}` | undefined>();

  // Track which tx hashes we've already handled
  const handledApproveTx = useRef<string | null>(null);
  const handledExecTx = useRef<string | null>(null);
  // Debounce timer ref
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Polling interval ref
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Derived values ──────────────────────────────────────────────────────────

  /** Raw debt amount in token units */
  const debtAmountRaw = useMemo(() => {
    if (!debtAmountHuman || Number(debtAmountHuman) <= 0) return BigInt(0);
    try {
      return parseUnits(debtAmountHuman, debtDecimals);
    } catch {
      return BigInt(0);
    }
  }, [debtAmountHuman, debtDecimals]);

  /** Max collateral = quote + slippage buffer */
  const maxCollateralRaw = useMemo(() => {
    if (!collateralNeededRaw) return null;
    return (collateralNeededRaw * BigInt(10000 + slippageBps)) / BigInt(10000);
  }, [collateralNeededRaw, slippageBps]);

  /** Human-readable collateral needed (exact quote) */
  const collateralNeeded = useMemo(() => {
    if (!collateralNeededRaw) return null;
    return formatUnits(collateralNeededRaw, collateralDecimals);
  }, [collateralNeededRaw, collateralDecimals]);

  /** Human-readable max collateral (with slippage) */
  const maxCollateral = useMemo(() => {
    if (!maxCollateralRaw) return null;
    return formatUnits(maxCollateralRaw, collateralDecimals);
  }, [maxCollateralRaw, collateralDecimals]);

  /**
   * useEthPath — true when the path is multi-hop (length > 2).
   * Derived from the actual V3 quote path returned by the adapter.
   * This matches the same heuristic used in the Aave V2 UI guide (Section 4.7).
   */
  const useEthPath = isMultiHopPath;

  /**
   * Flash loan decision:
   * If withdrawing collateral BEFORE repaying would drop HF to <= 1.01,
   * we must use flash loan to do repay + pull atomically.
   * Formula from guide Section 7.3:
   *   needFlashLoan = user.HF - hfInitialEffectOfFromAmount <= 1.01
   */
  const needsFlashLoan = useMemo(() => {
    if (hfBeforeCollateralEffect == null) return false;
    return hfBeforeCollateralEffect <= 1.01;
  }, [hfBeforeCollateralEffect]);

  // ─── aToken Allowance ────────────────────────────────────────────────────────

  const [aTokenAllowance, setATokenAllowance] = useState<bigint>(BigInt(0));

  const fetchAllowance = useCallback(async () => {
    if (!publicClient || !collateralATokenAddress || !userAddress || !adapterAddress) return;
    try {
      const allowance = await publicClient.readContract({
        address: collateralATokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [userAddress, adapterAddress],
      });
      setATokenAllowance(allowance as bigint);
    } catch {
      // ignore
    }
  }, [publicClient, collateralATokenAddress, userAddress, adapterAddress]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  const needsApproval = useMemo(() => {
    if (!maxCollateralRaw) return false;
    return aTokenAllowance < maxCollateralRaw;
  }, [aTokenAllowance, maxCollateralRaw]);

  // ─── Quote ───────────────────────────────────────────────────────────────────

  const runQuote = useCallback(async () => {
    if (!publicClient || !adapterAddress || !collateralAsset || !debtAsset || debtAmountRaw === BigInt(0)) {
      setCollateralNeededRaw(null);
      setQuoteError(null);
      return;
    }

    setStatus('quoting');
    setQuoteError(null);

    try {
      // getAmountsIn is non-view — we simulate it (callStatic equivalent)
      const result = await publicClient.simulateContract({
        address: adapterAddress,
        abi: uniswapV3RepayAdapterAbi,
        functionName: 'getAmountsIn',
        args: [debtAmountRaw, collateralAsset, debtAsset],
      });

      // result.result = [amountIn, relPrice, inUsd, outUsd, path]
      const [amountIn, , , , path] = result.result as [bigint, bigint, bigint, bigint, `0x${string}`[]];

      if (amountIn === BigInt(0)) {
        setCollateralNeededRaw(null);
        setQuoteError('No Uniswap V3 pool found or insufficient liquidity');
        setStatus('idle');
        return;
      }

      setCollateralNeededRaw(amountIn);
      setIsMultiHopPath(Array.isArray(path) && path.length > 2);
      setStatus('idle');
      setQuoteError(null);
    } catch (e: any) {
      setCollateralNeededRaw(null);
      setQuoteError(e?.shortMessage || e?.message?.slice(0, 120) || 'Quote failed');
      setStatus('idle');
    }
  }, [publicClient, adapterAddress, collateralAsset, debtAsset, debtAmountRaw]);

  // Debounce + trigger quote on amount/asset change
  useEffect(() => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(() => {
      runQuote();
    }, 400);
    return () => {
      if (quoteTimer.current) clearTimeout(quoteTimer.current);
    };
  }, [runQuote]);

  // Polling every 10 seconds to refresh quote (price might drift)
  useEffect(() => {
    pollTimer.current = setInterval(() => {
      runQuote();
    }, 10_000);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [runQuote]);

  // ─── Wait for Approve Tx ─────────────────────────────────────────────────────

  const {
    isSuccess: isApproveConfirmed,
    isLoading: isApproveConfirming,
    isError: isApproveError,
  } = useWaitForTransactionReceipt({ hash: approveTxHash });

  useEffect(() => {
    if (isApproveConfirming) {
      toast.loading('Confirming aToken approval on-chain...', { id: 'rwc-approve' });
    }
  }, [isApproveConfirming]);

  useEffect(() => {
    if (isApproveConfirmed && approveTxHash && handledApproveTx.current !== approveTxHash) {
      handledApproveTx.current = approveTxHash;
      setStatus('idle');
      fetchAllowance();
      toast.dismiss('rwc-approve');
      toast.success('aToken approved', { description: 'You can now repay with collateral.' });
    }
  }, [isApproveConfirmed, approveTxHash, fetchAllowance]);

  useEffect(() => {
    if (isApproveError && approveTxHash) {
      setStatus('error');
      toast.dismiss('rwc-approve');
      toast.error('Approval failed on-chain');
    }
  }, [isApproveError, approveTxHash]);

  // ─── Wait for Exec Tx ────────────────────────────────────────────────────────

  const {
    isSuccess: isExecConfirmed,
    isLoading: isExecConfirming,
    isError: isExecError,
    error: execError,
  } = useWaitForTransactionReceipt({ hash: execTxHash });

  useEffect(() => {
    if (isExecConfirming) {
      toast.loading('Confirming repay with collateral...', { id: 'rwc-exec' });
    }
  }, [isExecConfirming]);

  const reset = useCallback(() => {
    setStatus('idle');
    setQuoteError(null);
    setCollateralNeededRaw(null);
    setApproveTxHash(undefined);
    setExecTxHash(undefined);
    handledApproveTx.current = null;
    handledExecTx.current = null;
  }, []);

  useEffect(() => {
    if (isExecConfirmed && execTxHash && handledExecTx.current !== execTxHash) {
      handledExecTx.current = execTxHash;
      toast.dismiss('rwc-exec');
      toast.success('Repay with collateral confirmed!', {
        description: `Repaid ${debtAmountHuman} using your deposited collateral.`,
      });
      onSuccess?.();
      // Reset all stale state so user can immediately start another repay cycle
      reset();
    }
  }, [isExecConfirmed, execTxHash, onSuccess, debtAmountHuman, reset]);

  useEffect(() => {
    if (isExecError && execTxHash) {
      setStatus('error');
      toast.dismiss('rwc-exec');
      toast.error('Repay transaction reverted', {
        description: execError?.message?.split('\n')[0] || 'Transaction failed',
      });
    }
  }, [isExecError, execTxHash, execError]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Approve aToken to the adapter.
   *
   * We approve maxCollateralRaw + 1% buffer instead of MAX_UINT256.
   * maxCollateralRaw already includes the slippage buffer (default 2%),
   * so the extra 1% only covers minor price drift between quote and execute.
   * The contract will spend at most maxCollateralRaw — the rest stays as allowance.
   */
  const approvalAmount = useMemo(() => {
    if (!maxCollateralRaw) return null;
    return (maxCollateralRaw * BigInt(10000 + APPROVAL_BUFFER_BPS)) / BigInt(10000);
  }, [maxCollateralRaw]);

  const approve = useCallback(async () => {
    if (!walletClient || !collateralATokenAddress || !adapterAddress || !approvalAmount) return;

    setStatus('approving');
    toast.loading('Waiting for aToken approval signature...', { id: 'rwc-approve' });

    try {
      const hash = await walletClient.writeContract({
        address: collateralATokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [adapterAddress, approvalAmount],
      });
      setApproveTxHash(hash);
      setStatus('confirming-approve');
    } catch (e: any) {
      setStatus('error');
      toast.dismiss('rwc-approve');
      toast.error('Approval rejected', { description: getEvmMessage(e) });
    }
  }, [walletClient, collateralATokenAddress, adapterAddress, approvalAmount]);

  /**
   * Execute the repay-with-collateral flow.
   *
   * Chooses between:
   *   - Direct: adapter.swapAndRepay(...)
   *   - Flash loan: lendingPool.flashLoan(adapter, [debtAsset], [debtAmount], [0], user, params, 0)
   *
   * Flash loan params encoding matches _decodeParams in UniswapV3RepayAdapter.sol:
   *   abi.decode(params, (address, uint256, uint256, uint256, uint256, uint8, bytes32, bytes32, bool))
   *   → (collateralAsset, collateralAmount, rateMode, permitAmount, deadline, v, r, s, useEthPath)
   */
  const execute = useCallback(async () => {
    if (
      !walletClient ||
      !publicClient ||
      !adapterAddress ||
      !collateralAsset ||
      !debtAsset ||
      !userAddress ||
      debtAmountRaw === BigInt(0)
    )
      return;

    if (!maxCollateralRaw) return;

    // ── On-chain balance guard ───────────────────────────────────────────────
    // Read the LIVE aToken balance immediately before submitting.
    // This prevents "SafeMath: subtraction overflow" on consecutive repays
    // where the UI's polling-based balance is stale (5s interval).
    try {
      const liveBalance = (await publicClient.readContract({
        address: collateralATokenAddress!,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress],
      })) as bigint;

      if (liveBalance < maxCollateralRaw) {
        toast.error('Insufficient collateral balance', {
          description:
            'Your aToken balance is lower than needed. Please reduce the repay amount or wait for balance to update.',
        });
        return;
      }
    } catch {
      // If the check fails (RPC error), proceed anyway — contract will revert with a clear message
    }

    setStatus('executing');
    toast.loading('Waiting for transaction signature...', { id: 'rwc-exec' });

    try {
      let hash: `0x${string}`;

      if (needsFlashLoan) {
        // ── Flash Loan Mode ──────────────────────────────────────────────────
        // Encode params exactly as _decodeParams expects:
        // (address collateralAsset, uint256 collateralAmount, uint256 rateMode,
        //  uint256 permitAmount, uint256 deadline, uint8 v, bytes32 r, bytes32 s, bool useEthPath)
        const encodedParams = encodeAbiParameters(
          parseAbiParameters('address, uint256, uint256, uint256, uint256, uint8, bytes32, bytes32, bool'),
          [
            collateralAsset,
            maxCollateralRaw,
            rateMode,
            BigInt(0), // permitAmount
            BigInt(0), // deadline
            0, // v
            zeroHash, // r
            zeroHash, // s
            useEthPath,
          ]
        );

        hash = await walletClient.writeContract({
          address: lendingPoolAddress,
          abi: lendingPoolAbi,
          functionName: 'flashLoan',
          args: [
            adapterAddress, // receiverAddress
            [debtAsset], // assets
            [debtAmountRaw], // amounts
            [BigInt(0)], // modes (0 = no debt, repay in same tx)
            userAddress, // onBehalfOf
            encodedParams, // params
            0, // referralCode
          ],
        });
      } else {
        // ── Direct Mode ─────────────────────────────────────────────────────
        hash = await walletClient.writeContract({
          address: adapterAddress,
          abi: uniswapV3RepayAdapterAbi,
          functionName: 'swapAndRepay',
          args: [
            collateralAsset, // collateralAsset
            debtAsset, // debtAsset
            maxCollateralRaw, // collateralAmount
            debtAmountRaw, // debtRepayAmount
            rateMode, // debtRateMode
            EMPTY_PERMIT, // permitSignature (empty — no EIP-2612)
            useEthPath, // useEthPath
          ],
        });
      }

      setExecTxHash(hash);
      setStatus('confirming-exec');
    } catch (e: any) {
      setStatus('error');
      toast.dismiss('rwc-exec');
      toast.error('Transaction failed', { description: getEvmMessage(e) });
    }
  }, [
    walletClient,
    publicClient,
    adapterAddress,
    collateralAsset,
    collateralATokenAddress,
    debtAsset,
    userAddress,
    debtAmountRaw,
    maxCollateralRaw,
    rateMode,
    useEthPath,
    needsFlashLoan,
    lendingPoolAddress,
  ]);

  // ─── Derived combined status ─────────────────────────────────────────────────

  const isQuoting = status === 'quoting';
  const isBusy =
    status === 'approving' ||
    status === 'confirming-approve' ||
    status === 'executing' ||
    status === 'confirming-exec' ||
    isApproveConfirming ||
    isExecConfirming;

  /**
   * isRefreshing — true when a quote is in-flight AND we already have a prior
   * result (collateralNeededRaw != null). The UI should keep showing the stale
   * value instead of flashing a spinner on every 10-second poll.
   */
  const isRefreshing = isQuoting && collateralNeededRaw !== null;

  return {
    status,
    quoteError,
    collateralNeeded, // exact quote (human-readable)
    maxCollateral, // quote + slippage (human-readable)
    needsApproval,
    needsFlashLoan,
    useEthPath,
    isQuoting,
    isRefreshing,
    isBusy,
    approve,
    execute,
    reset,
    approveTxHash,
    execTxHash,
    aTokenAllowance, // raw bigint allowance for display
  };
}
