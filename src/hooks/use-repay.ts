'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits, maxUint256, parseUnits } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useReadErc20Allowance, useWriteErc20Approve, useWriteLendingPoolRepay } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type RepayTxStatus =
  | 'idle'
  | 'approving'
  | 'confirming-approve'
  | 'repaying'
  | 'confirming-repay'
  | 'success'
  | 'error';

interface UseRepayOptions {
  /** The ERC20 token address (reserve.underlyingAsset) */
  tokenAddress: `0x${string}`;
  /** Token decimals */
  decimals: number;
  /** The user's wallet address */
  userAddress: `0x${string}` | undefined;
  /** Human-readable amount to repay (or "max" for full repay) */
  amount: string;
  /** Whether this is a "repay all" action */
  isMax?: boolean;
  /** Callback after successful repay */
  onSuccess?: () => void;
}

/**
 * Hook for ERC20 repay flow: check allowance → approve → repay.
 *
 * For "repay all": pass isMax=true. The hook sends MAX_UINT256 to the contract,
 * which only takes the exact outstanding debt (no excess is deducted).
 */
export function useRepay({ tokenAddress, decimals, userAddress, amount, isMax, onSuccess }: UseRepayOptions) {
  const t = useTranslations('modules.market.Toasts');
  const [status, setStatus] = useState<RepayTxStatus>('idle');
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;

  // Track which tx hashes we've already shown toasts for
  const handledApproveTx = useRef<string | null>(null);
  const handledRepayTx = useRef<string | null>(null);

  // ── Read current allowance ──
  const { data: allowanceRaw, refetch: refetchAllowance } = useReadErc20Allowance({
    address: tokenAddress,
    args: userAddress ? [userAddress, lendingPoolAddress] : undefined,
    query: { enabled: !!userAddress, refetchInterval: 5000 },
  });

  const allowance = useMemo(() => {
    if (allowanceRaw == null) return '0';
    return formatUnits(allowanceRaw, decimals);
  }, [allowanceRaw, decimals]);

  const needsApproval = useMemo(() => {
    if (!amount || Number(amount) <= 0) return false;
    return Number(allowance) < Number(amount);
  }, [amount, allowance]);

  // ── Approve write ──
  const {
    mutate: approveWrite,
    data: approveTxHash,
    isPending: isApprovePending,
    reset: resetApprove,
  } = useWriteErc20Approve();

  const {
    isSuccess: isApproveConfirmed,
    isLoading: isApproveConfirming,
    isError: isApproveReceiptError,
    error: approveReceiptError,
  } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // ── Repay write ──
  const {
    mutate: repayWrite,
    data: repayTxHash,
    isPending: isRepayPending,
    reset: resetRepay,
  } = useWriteLendingPoolRepay();

  const {
    isSuccess: isRepayConfirmed,
    isLoading: isRepayConfirming,
    isError: isRepayReceiptError,
    error: repayReceiptError,
  } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  });

  // ── Approve confirmation effects ──
  useEffect(() => {
    if (isApproveConfirmed && approveTxHash && handledApproveTx.current !== approveTxHash) {
      handledApproveTx.current = approveTxHash;
      refetchAllowance();
      setStatus('idle');
      toast.dismiss('repay-approve');
      toast.success(t('approvalConfirmed'), { description: t('approvalConfirmedRepayDesc') });
    }
  }, [isApproveConfirmed, approveTxHash, refetchAllowance]);

  useEffect(() => {
    if (isApproveConfirming) {
      toast.loading(t('confirmingApproval'), { id: 'repay-approve' });
    }
  }, [isApproveConfirming]);

  useEffect(() => {
    if (isApproveReceiptError && approveTxHash) {
      setStatus('error');
      toast.dismiss('repay-approve');
      toast.error(t('approvalReverted'), {
        description: approveReceiptError?.message?.split('\n')[0] || t('txFailed'),
      });
    }
  }, [isApproveReceiptError, approveTxHash, approveReceiptError]);

  // ── Repay confirmation effects ──
  useEffect(() => {
    if (isRepayConfirmed && repayTxHash && handledRepayTx.current !== repayTxHash) {
      handledRepayTx.current = repayTxHash;
      setStatus('success');
      toast.dismiss('repay-erc20');
      toast.success(t('repayConfirmed'), { description: t('repayConfirmedDesc', { amount, symbol: 'tokens' }) });
      onSuccess?.();
    }
  }, [isRepayConfirmed, repayTxHash, onSuccess, amount]);

  useEffect(() => {
    if (isRepayConfirming) {
      toast.loading(t('confirmingRepay'), { id: 'repay-erc20' });
    }
  }, [isRepayConfirming]);

  useEffect(() => {
    if (isRepayReceiptError && repayTxHash) {
      setStatus('error');
      toast.dismiss('repay-erc20');
      toast.error(t('repayReverted'), {
        description: repayReceiptError?.message?.split('\n')[0] || t('txFailed'),
      });
    }
  }, [isRepayReceiptError, repayTxHash, repayReceiptError]);

  // ── Actions ──
  const approve = () => {
    if (!userAddress || !amount || Number(amount) <= 0) return;
    setStatus('approving');
    resetApprove();
    toast.loading(t('waitingApprovalSignature'), { id: 'repay-approve' });

    const baseAmount = parseUnits(amount, decimals);
    const approveAmount = isMax ? (baseAmount * BigInt(101)) / BigInt(100) : baseAmount;

    approveWrite(
      {
        address: tokenAddress,
        args: [lendingPoolAddress, approveAmount],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('repay-approve');
          toast.error(t('approvalFailed'), {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const repay = () => {
    if (!userAddress || !amount || Number(amount) <= 0) return;
    setStatus('repaying');
    resetRepay();
    toast.loading(t('waitingRepaySignature'), { id: 'repay-erc20' });

    // For "repay all", use MAX_UINT256. The contract only takes the exact debt owed.
    const repayAmount = isMax ? maxUint256 : parseUnits(amount, decimals);

    repayWrite(
      {
        address: lendingPoolAddress,
        args: [
          tokenAddress, // asset
          repayAmount, // amount (MAX_UINT256 = repay all)
          BigInt(2), // interestRateMode (2 = variable)
          userAddress, // onBehalfOf
        ],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('repay-erc20');
          toast.error(t('repayFailed'), {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const reset = () => {
    setStatus('idle');
    resetApprove();
    resetRepay();
  };

  // Derive combined status
  const derivedStatus: RepayTxStatus = isApprovePending
    ? 'approving'
    : isApproveConfirming
      ? 'confirming-approve'
      : isRepayPending
        ? 'repaying'
        : isRepayConfirming
          ? 'confirming-repay'
          : status;

  return {
    status: derivedStatus,
    allowance,
    needsApproval,
    approve,
    repay,
    reset,
    isBusy: isApprovePending || isApproveConfirming || isRepayPending || isRepayConfirming,
    approveTxHash,
    repayTxHash,
  };
}
