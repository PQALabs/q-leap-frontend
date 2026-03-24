'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits, maxUint256, parseUnits } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWriteLendingPoolWithdraw } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type WithdrawTxStatus = 'idle' | 'withdrawing' | 'confirming' | 'success' | 'error';

interface UseWithdrawOptions {
  /** The underlying ERC20 token address (reserve.underlyingAsset) */
  tokenAddress: `0x${string}`;
  /** Token decimals */
  decimals: number;
  /** The user's wallet address */
  userAddress: `0x${string}` | undefined;
  /** Human-readable amount to withdraw */
  amount: string;
  /** If true, withdraw entire balance (principal + interest) using MAX_UINT256 */
  isMax?: boolean;
  /** Callback after successful withdrawal */
  onSuccess?: () => void;
}

/**
 * Hook for ERC20 withdraw flow: pool.withdraw(asset, amount, to).
 *
 * No approval needed — LendingPool burns aTokens from msg.sender directly.
 * Pass isMax=true to withdraw entire balance (principal + interest).
 */
export function useWithdraw({ tokenAddress, decimals, userAddress, amount, isMax, onSuccess }: UseWithdrawOptions) {
  const [status, setStatus] = useState<WithdrawTxStatus>('idle');
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;

  // Track which tx hash we've already shown toast for
  const handledTx = useRef<string | null>(null);

  // ── Withdraw hook ──
  const {
    mutate: withdrawWrite,
    data: txHash,
    isPending: isSigningPending,
    reset: resetWrite,
  } = useWriteLendingPoolWithdraw();

  const {
    isSuccess: isConfirmed,
    isLoading: isConfirming,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // ── On-chain confirmation ──
  useEffect(() => {
    if (isConfirmed && txHash && handledTx.current !== txHash) {
      handledTx.current = txHash;
      setStatus('success');
      toast.dismiss('withdraw');
      toast.success('Withdrawal confirmed', {
        description: `Successfully withdrew ${isMax ? 'all' : amount} tokens.`,
      });
      onSuccess?.();
    }
  }, [isConfirmed, txHash, onSuccess, amount, isMax]);

  // Update loading toast when confirming
  useEffect(() => {
    if (isConfirming) {
      toast.loading('Confirming withdrawal on-chain...', { id: 'withdraw' });
    }
  }, [isConfirming]);

  // Handle on-chain revert
  useEffect(() => {
    if (isReceiptError && txHash) {
      setStatus('error');
      toast.dismiss('withdraw');
      toast.error('Withdrawal transaction reverted', {
        description: receiptError?.message?.split('\n')[0] || 'Transaction failed',
      });
    }
  }, [isReceiptError, txHash, receiptError]);

  // ── Action ──
  const withdraw = () => {
    if (!userAddress || !amount || Number(amount) <= 0) return;
    setStatus('withdrawing');
    resetWrite();
    toast.loading('Waiting for withdrawal signature...', { id: 'withdraw' });

    // Use MAX_UINT256 for max withdraw (principal + interest)
    const withdrawAmount = isMax ? maxUint256 : parseUnits(amount, decimals);

    withdrawWrite(
      {
        address: lendingPoolAddress,
        args: [tokenAddress, withdrawAmount, userAddress],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('withdraw');
          toast.error('Withdrawal failed', { description: getEvmMessage(error) });
        },
      }
    );
  };

  const reset = () => {
    setStatus('idle');
    resetWrite();
  };

  // Derive combined status
  const derivedStatus: WithdrawTxStatus = isSigningPending ? 'withdrawing' : isConfirming ? 'confirming' : status;

  return {
    status: derivedStatus,
    withdraw,
    reset,
    isBusy: isSigningPending || isConfirming,
    txHash,
  };
}
