'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { parseEther } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWriteWethGatewayDepositEth } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type SupplyNativeTxStatus = 'idle' | 'supplying' | 'confirming' | 'success' | 'error';

interface UseSupplyNativeOptions {
  /** The user's wallet address */
  userAddress: `0x${string}` | undefined;
  /** Human-readable amount of native QDAY to supply */
  amount: string;
  /** Callback after successful supply */
  onSuccess?: () => void;
}

/**
 * Hook for native QDAY supply flow via WETHGateway.depositETH.
 * No approval needed — native QDAY is sent as msg.value.
 */
export function useSupplyNative({ userAddress, amount, onSuccess }: UseSupplyNativeOptions) {
  const [status, setStatus] = useState<SupplyNativeTxStatus>('idle');
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;
  const wethGatewayAddress = currentMarketData.addresses.WETH_GATEWAY as `0x${string}`;

  // ── depositETH hook ──
  const {
    mutate: depositEthWrite,
    data: txHash,
    isPending: isSigningPending,
    reset: resetWrite,
  } = useWriteWethGatewayDepositEth();

  const {
    isSuccess: isConfirmed,
    isLoading: isConfirming,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Track which tx hash we've already shown toast for
  const handledTx = useRef<string | null>(null);

  // ── On-chain confirmation ──
  useEffect(() => {
    if (isConfirmed && txHash && handledTx.current !== txHash) {
      handledTx.current = txHash;
      setStatus('success');
      toast.dismiss('supply-native');
      toast.success('Supply confirmed', { description: `Successfully supplied ${amount} QDAY.` });
      onSuccess?.();
    }
  }, [isConfirmed, txHash, onSuccess, amount]);

  // Update loading toast when confirming
  useEffect(() => {
    if (isConfirming) {
      toast.loading('Confirming supply on-chain...', { id: 'supply-native' });
    }
  }, [isConfirming]);

  // Handle on-chain revert
  useEffect(() => {
    if (isReceiptError && txHash) {
      setStatus('error');
      toast.dismiss('supply-native');
      toast.error('Supply transaction reverted', {
        description: receiptError?.message?.split('\n')[0] || 'Transaction failed',
      });
    }
  }, [isReceiptError, txHash, receiptError]);

  // ── Action (use mutate callback for error handling) ──
  const supply = () => {
    if (!userAddress || !amount || Number(amount) <= 0 || !wethGatewayAddress) return;
    setStatus('supplying');
    resetWrite();
    toast.loading('Waiting for supply signature...', { id: 'supply-native' });

    depositEthWrite(
      {
        address: wethGatewayAddress,
        args: [
          lendingPoolAddress, // lendingPool
          userAddress, // onBehalfOf
          0, // referralCode
        ],
        value: parseEther(amount),
        account: userAddress,
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('supply-native');
          toast.error('Supply failed', {
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
  const derivedStatus: SupplyNativeTxStatus = isSigningPending ? 'supplying' : isConfirming ? 'confirming' : status;

  return {
    status: derivedStatus,
    supply,
    reset,
    isBusy: isSigningPending || isConfirming,
    txHash,
  };
}
