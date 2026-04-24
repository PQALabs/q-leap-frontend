'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits, maxUint256, parseEther } from 'viem';
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { DebtTokenAbi } from '@/abi/debt-token-abi';
import { useWriteWethGatewayBorrowEth } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type BorrowNativeTxStatus =
  | 'idle'
  | 'approving-delegation'
  | 'confirming-delegation'
  | 'borrowing'
  | 'confirming'
  | 'success'
  | 'error';

export interface BorrowNativeToastLabels {
  delegationConfirmed?: string;
  delegationConfirmedDesc?: string;
  delegationFailed?: string;
  delegationReverted?: string;
  waitingDelegationSignature?: string;
  confirmingDelegation?: string;
  borrowConfirmed?: string;
  borrowConfirmedDesc?: string;
  borrowFailed?: string;
  borrowReverted?: string;
  waitingBorrowSignature?: string;
  confirmingBorrow?: string;
  txFailed?: string;
}

interface UseBorrowNativeOptions {
  /** Variable debt token address for the wrapped native asset (WQDAY) */
  variableDebtTokenAddress: `0x${string}`;
  /** The user's wallet address */
  userAddress: `0x${string}` | undefined;
  /** Human-readable amount of native QDAY to borrow */
  amount: string;
  /** Callback after successful borrow */
  onSuccess?: () => void;
  /** Internationalized toast labels */
  toastLabels?: BorrowNativeToastLabels;
}

/**
 * Hook for native QDAY borrow flow via WETHGateway.borrowETH().
 *
 * Two-step flow:
 * 1. approveDelegation on variable debt token → WETHGateway (if needed)
 * 2. gateway.borrowETH(pool, amount, 2, 0)
 */
export function useBorrowNative({
  variableDebtTokenAddress,
  userAddress,
  amount,
  onSuccess,
  toastLabels: l,
}: UseBorrowNativeOptions) {
  const [status, setStatus] = useState<BorrowNativeTxStatus>('idle');
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;
  const wethGatewayAddress = currentMarketData.addresses.WETH_GATEWAY as `0x${string}`;

  // Track handled tx hashes
  const handledDelegationTx = useRef<string | null>(null);
  const handledBorrowTx = useRef<string | null>(null);

  // ── Read delegation allowance ──
  const { data: delegationRaw, refetch: refetchDelegation } = useReadContract({
    address: variableDebtTokenAddress,
    abi: DebtTokenAbi,
    functionName: 'borrowAllowance',
    args: userAddress && wethGatewayAddress ? [userAddress, wethGatewayAddress] : undefined,
    query: { enabled: !!userAddress && !!wethGatewayAddress, refetchInterval: 5000 },
  });

  const delegationAllowance = useMemo(() => {
    if (delegationRaw == null) return '0';
    return formatUnits(delegationRaw, 18); // WQDAY is 18 decimals
  }, [delegationRaw]);

  const needsDelegation = useMemo(() => {
    if (!amount || Number(amount) <= 0) return false;
    return Number(delegationAllowance) < Number(amount);
  }, [amount, delegationAllowance]);

  // ── approveDelegation write ──
  const {
    mutate: delegationWrite,
    data: delegationTxHash,
    isPending: isDelegationPending,
    reset: resetDelegation,
  } = useWriteContract();

  const {
    isSuccess: isDelegationConfirmed,
    isLoading: isDelegationConfirming,
    isError: isDelegationReceiptError,
    error: delegationReceiptError,
  } = useWaitForTransactionReceipt({
    hash: delegationTxHash,
  });

  // ── borrowETH write ──
  const {
    mutate: borrowEthWrite,
    data: borrowTxHash,
    isPending: isBorrowPending,
    reset: resetBorrow,
  } = useWriteWethGatewayBorrowEth();

  const {
    isSuccess: isBorrowConfirmed,
    isLoading: isBorrowConfirming,
    isError: isBorrowReceiptError,
    error: borrowReceiptError,
  } = useWaitForTransactionReceipt({
    hash: borrowTxHash,
  });

  // ── Delegation confirmation effects ──
  useEffect(() => {
    if (isDelegationConfirmed && delegationTxHash && handledDelegationTx.current !== delegationTxHash) {
      handledDelegationTx.current = delegationTxHash;
      refetchDelegation();
      setStatus('idle');
      toast.dismiss('borrow-delegation');
      toast.success(l?.delegationConfirmed ?? 'Delegation approved', {
        description: l?.delegationConfirmedDesc ?? 'Debt delegation approved. You can now borrow.',
      });
    }
  }, [isDelegationConfirmed, delegationTxHash, refetchDelegation]);

  useEffect(() => {
    if (isDelegationConfirming) {
      toast.loading(l?.confirmingDelegation ?? 'Confirming delegation on-chain...', { id: 'borrow-delegation' });
    }
  }, [isDelegationConfirming]);

  useEffect(() => {
    if (isDelegationReceiptError && delegationTxHash) {
      setStatus('error');
      toast.dismiss('borrow-delegation');
      toast.error(l?.delegationReverted ?? 'Delegation reverted', {
        description: delegationReceiptError?.message?.split('\n')[0] || l?.txFailed || 'Transaction failed',
      });
    }
  }, [isDelegationReceiptError, delegationTxHash, delegationReceiptError]);

  // ── Borrow confirmation effects ──
  useEffect(() => {
    if (isBorrowConfirmed && borrowTxHash && handledBorrowTx.current !== borrowTxHash) {
      handledBorrowTx.current = borrowTxHash;
      setStatus('success');
      toast.dismiss('borrow-native');
      toast.success(l?.borrowConfirmed ?? 'Borrow confirmed', {
        description: l?.borrowConfirmedDesc ?? `Successfully borrowed ${amount} QDAY.`,
      });
      onSuccess?.();
    }
  }, [isBorrowConfirmed, borrowTxHash, onSuccess, amount]);

  useEffect(() => {
    if (isBorrowConfirming) {
      toast.loading(l?.confirmingBorrow ?? 'Confirming borrow on-chain...', { id: 'borrow-native' });
    }
  }, [isBorrowConfirming]);

  useEffect(() => {
    if (isBorrowReceiptError && borrowTxHash) {
      setStatus('error');
      toast.dismiss('borrow-native');
      toast.error(l?.borrowReverted ?? 'Borrow transaction reverted', {
        description: borrowReceiptError?.message?.split('\n')[0] || l?.txFailed || 'Transaction failed',
      });
    }
  }, [isBorrowReceiptError, borrowTxHash, borrowReceiptError]);

  // ── Actions ──
  const approveDelegation = () => {
    if (!userAddress || !wethGatewayAddress) return;
    setStatus('approving-delegation');
    resetDelegation();
    toast.loading(l?.waitingDelegationSignature ?? 'Waiting for delegation signature...', { id: 'borrow-delegation' });

    delegationWrite(
      {
        address: variableDebtTokenAddress,
        abi: DebtTokenAbi,
        functionName: 'approveDelegation',
        args: [wethGatewayAddress, maxUint256],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('borrow-delegation');
          toast.error(l?.delegationFailed ?? 'Delegation failed', {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const borrow = () => {
    if (!userAddress || !amount || Number(amount) <= 0 || !wethGatewayAddress) return;
    setStatus('borrowing');
    resetBorrow();
    toast.loading(l?.waitingBorrowSignature ?? 'Waiting for borrow signature...', { id: 'borrow-native' });

    borrowEthWrite(
      {
        address: wethGatewayAddress,
        args: [
          lendingPoolAddress, // lendingPool
          parseEther(amount), // amount
          BigInt(2), // interestRateMode (variable)
          0, // referralCode
        ],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('borrow-native');
          toast.error(l?.borrowFailed ?? 'Borrow failed', {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const reset = () => {
    setStatus('idle');
    resetDelegation();
    resetBorrow();
  };

  // Derive combined status
  const derivedStatus: BorrowNativeTxStatus = isDelegationPending
    ? 'approving-delegation'
    : isDelegationConfirming
      ? 'confirming-delegation'
      : isBorrowPending
        ? 'borrowing'
        : isBorrowConfirming
          ? 'confirming'
          : status;

  return {
    status: derivedStatus,
    delegationAllowance,
    needsDelegation,
    approveDelegation,
    borrow,
    reset,
    isBusy: isDelegationPending || isDelegationConfirming || isBorrowPending || isBorrowConfirming,
    delegationTxHash,
    borrowTxHash,
  };
}
