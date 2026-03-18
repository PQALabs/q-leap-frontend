'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits, parseUnits } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useReadErc20Allowance, useWriteErc20Approve, useWriteLendingPoolDeposit } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type SupplyTxStatus =
  | 'idle'
  | 'approving'
  | 'confirming-approve'
  | 'supplying'
  | 'confirming-supply'
  | 'success'
  | 'error';

interface UseSupplyOptions {
  /** The ERC20 token address (reserve.underlyingAsset) */
  tokenAddress: `0x${string}`;
  /** Token decimals */
  decimals: number;
  /** The user's wallet address */
  userAddress: `0x${string}` | undefined;
  /** Human-readable amount to supply */
  amount: string;
  /** Callback after successful deposit */
  onSuccess?: () => void;
}

/**
 * Hook for ERC20 supply flow: check allowance → approve → deposit.
 */
export function useSupply({ tokenAddress, decimals, userAddress, amount, onSuccess }: UseSupplyOptions) {
  const [status, setStatus] = useState<SupplyTxStatus>('idle');
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;

  // Track which tx hashes we've already shown toasts for
  const handledApproveTx = useRef<string | null>(null);
  const handledDepositTx = useRef<string | null>(null);

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

  // ── Approve ──
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

  // ── Deposit ──
  const {
    mutate: depositWrite,
    data: depositTxHash,
    isPending: isDepositPending,
    reset: resetDeposit,
  } = useWriteLendingPoolDeposit();

  const {
    isSuccess: isDepositConfirmed,
    isLoading: isDepositConfirming,
    isError: isDepositReceiptError,
    error: depositReceiptError,
  } = useWaitForTransactionReceipt({
    hash: depositTxHash,
  });

  // ── On-chain confirmation effects ──
  useEffect(() => {
    if (isApproveConfirmed && approveTxHash && handledApproveTx.current !== approveTxHash) {
      handledApproveTx.current = approveTxHash;
      refetchAllowance();
      setStatus('idle');
      toast.dismiss('supply-approve');
      toast.success('Approval confirmed', { description: 'Token spending approved. You can now supply.' });
    }
  }, [isApproveConfirmed, approveTxHash, refetchAllowance]);

  useEffect(() => {
    if (isDepositConfirmed && depositTxHash && handledDepositTx.current !== depositTxHash) {
      handledDepositTx.current = depositTxHash;
      setStatus('success');
      toast.dismiss('supply-deposit');
      toast.success('Supply confirmed', { description: `Successfully supplied ${amount} tokens.` });
      refetchAllowance();
      onSuccess?.();
    }
  }, [isDepositConfirmed, depositTxHash, onSuccess, amount]);

  // Update loading toasts when confirming on-chain
  useEffect(() => {
    if (isApproveConfirming) {
      toast.loading('Confirming approval on-chain...', { id: 'supply-approve' });
    }
  }, [isApproveConfirming]);

  useEffect(() => {
    if (isDepositConfirming) {
      toast.loading('Confirming supply on-chain...', { id: 'supply-deposit' });
    }
  }, [isDepositConfirming]);

  // Handle on-chain reverts
  useEffect(() => {
    if (isApproveReceiptError && approveTxHash) {
      setStatus('error');
      toast.dismiss('supply-approve');
      toast.error('Approval transaction reverted', {
        description: approveReceiptError?.message?.split('\n')[0] || 'Transaction failed',
      });
    }
  }, [isApproveReceiptError, approveTxHash, approveReceiptError]);

  useEffect(() => {
    if (isDepositReceiptError && depositTxHash) {
      setStatus('error');
      toast.dismiss('supply-deposit');
      toast.error('Supply transaction reverted', {
        description: depositReceiptError?.message?.split('\n')[0] || 'Transaction failed',
      });
    }
  }, [isDepositReceiptError, depositTxHash, depositReceiptError]);

  // ── Actions (use mutate callbacks for error handling) ──
  const approve = () => {
    if (!userAddress) return;
    setStatus('approving');
    resetApprove();
    toast.loading('Waiting for approval signature...', { id: 'supply-approve' });
    approveWrite(
      {
        address: tokenAddress,
        args: [lendingPoolAddress, parseUnits(amount, decimals)],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('supply-approve');
          toast.error('Approval failed', {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const supply = () => {
    if (!userAddress || !amount || Number(amount) <= 0) return;
    setStatus('supplying');
    resetDeposit();
    toast.loading('Waiting for supply signature...', { id: 'supply-deposit' });
    depositWrite(
      {
        address: lendingPoolAddress,
        args: [tokenAddress, parseUnits(amount, decimals), userAddress, 0],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('supply-deposit');
          toast.error('Supply failed', {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const reset = () => {
    setStatus('idle');
    resetApprove();
    resetDeposit();
  };

  // Derive combined status
  const derivedStatus: SupplyTxStatus = isApprovePending
    ? 'approving'
    : isApproveConfirming
      ? 'confirming-approve'
      : isDepositPending
        ? 'supplying'
        : isDepositConfirming
          ? 'confirming-supply'
          : status;

  return {
    status: derivedStatus,
    allowance,
    needsApproval,
    approve,
    supply,
    reset,
    refetchAllowance,
    isBusy: isApprovePending || isApproveConfirming || isDepositPending || isDepositConfirming,
    approveTxHash,
    depositTxHash,
  };
}
