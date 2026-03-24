'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { parseUnits } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWriteLendingPoolBorrow } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type BorrowTxStatus = 'idle' | 'borrowing' | 'confirming' | 'success' | 'error';

interface UseBorrowOptions {
  /** The ERC20 token address (reserve.underlyingAsset) */
  tokenAddress: `0x${string}`;
  /** Token decimals */
  decimals: number;
  /** The user's wallet address */
  userAddress: `0x${string}` | undefined;
  /** Human-readable amount to borrow */
  amount: string;
  /** Callback after successful borrow */
  onSuccess?: () => void;
}

/**
 * Hook for ERC20 borrow flow via LendingPool.borrow().
 * No approval is needed — the protocol mints debt tokens to the user directly.
 * Uses variable rate mode (2) by default.
 */
export function useBorrow({ tokenAddress, decimals, userAddress, amount, onSuccess }: UseBorrowOptions) {
  const [status, setStatus] = useState<BorrowTxStatus>('idle');
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;

  // Track which tx hash we've already shown toast for
  const handledTx = useRef<string | null>(null);

  // ── Borrow ──
  const {
    mutate: borrowWrite,
    data: txHash,
    isPending: isSigningPending,
    reset: resetWrite,
  } = useWriteLendingPoolBorrow();

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
      toast.dismiss('borrow-erc20');
      toast.success('Borrow confirmed', { description: `Successfully borrowed ${amount} tokens.` });
      onSuccess?.();
    }
  }, [isConfirmed, txHash, onSuccess, amount]);

  // Update loading toast when confirming
  useEffect(() => {
    if (isConfirming) {
      toast.loading('Confirming borrow on-chain...', { id: 'borrow-erc20' });
    }
  }, [isConfirming]);

  // Handle on-chain revert
  useEffect(() => {
    if (isReceiptError && txHash) {
      setStatus('error');
      toast.dismiss('borrow-erc20');
      toast.error('Borrow transaction reverted', {
        description: receiptError?.message?.split('\n')[0] || 'Transaction failed',
      });
    }
  }, [isReceiptError, txHash, receiptError]);

  // ── Action ──
  const borrow = () => {
    if (!userAddress || !amount || Number(amount) <= 0) return;
    setStatus('borrowing');
    resetWrite();
    toast.loading('Waiting for borrow signature...', { id: 'borrow-erc20' });

    borrowWrite(
      {
        address: lendingPoolAddress,
        args: [
          tokenAddress, // asset
          parseUnits(amount, decimals), // amount
          BigInt(2), // interestRateMode (2 = variable)
          0, // referralCode
          userAddress, // onBehalfOf
        ],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('borrow-erc20');
          toast.error('Borrow failed', {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const reset = () => {
    setStatus('idle');
    resetWrite();
  };

  // Derive combined status
  const derivedStatus: BorrowTxStatus = isSigningPending ? 'borrowing' : isConfirming ? 'confirming' : status;

  return {
    status: derivedStatus,
    borrow,
    reset,
    isBusy: isSigningPending || isConfirming,
    txHash,
  };
}
