'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { parseEther } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWriteWethGatewayRepayEth } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type RepayNativeTxStatus = 'idle' | 'repaying' | 'confirming' | 'success' | 'error';

interface UseRepayNativeOptions {
  /** The user's wallet address */
  userAddress: `0x${string}` | undefined;
  /** Human-readable amount of native QDAY to repay */
  amount: string;
  /** The user's current WQDAY variable debt (human-readable), used for buffer calc on repay-all */
  debtBalance: string;
  /** Whether this is a "repay all" action */
  isMax?: boolean;
  /** Callback after successful repay */
  onSuccess?: () => void;
}

/**
 * Hook for native QDAY repay flow via WETHGateway.repayETH().
 *
 * Single-step — no approve needed. Send native QDAY as msg.value.
 * For "repay all": sends debt × 1.001 (0.1% buffer for accrued interest).
 * The gateway automatically refunds any overpayment.
 */
export function useRepayNative({ userAddress, amount, isMax, onSuccess }: UseRepayNativeOptions) {
  const t = useTranslations('modules.market.Toasts');
  const [status, setStatus] = useState<RepayNativeTxStatus>('idle');
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;
  const wethGatewayAddress = currentMarketData.addresses.WETH_GATEWAY as `0x${string}`;

  const handledTx = useRef<string | null>(null);

  // ── repayETH write ──
  const {
    mutate: repayEthWrite,
    data: txHash,
    isPending: isSigningPending,
    reset: resetWrite,
  } = useWriteWethGatewayRepayEth();

  const {
    isSuccess: isConfirmed,
    isLoading: isConfirming,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // ── Confirmation effects ──
  useEffect(() => {
    if (isConfirmed && txHash && handledTx.current !== txHash) {
      handledTx.current = txHash;
      setStatus('success');
      toast.dismiss('repay-native');
      toast.success(t('repayConfirmed'), { description: t('repayConfirmedDesc', { amount, symbol: 'QDAY' }) });
      onSuccess?.();
    }
  }, [isConfirmed, txHash, onSuccess, amount]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading(t('confirmingRepay'), { id: 'repay-native' });
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isReceiptError && txHash) {
      setStatus('error');
      toast.dismiss('repay-native');
      toast.error(t('repayReverted'), {
        description: receiptError?.message?.split('\n')[0] || t('txFailed'),
      });
    }
  }, [isReceiptError, txHash, receiptError]);

  // ── Action ──
  const repay = () => {
    if (!userAddress || !amount || Number(amount) <= 0 || !wethGatewayAddress) return;
    setStatus('repaying');
    resetWrite();
    toast.loading(t('waitingRepaySignature'), { id: 'repay-native' });

    // For repay-all: the amount param tells the contract the debt to repay,
    // and msg.value should be slightly higher to cover interest accrued during tx.
    // Gateway refunds any excess.
    const repayAmountWei = parseEther(amount);
    const msgValue = isMax
      ? (repayAmountWei * BigInt(1001)) / BigInt(1000) // +0.1% buffer
      : repayAmountWei;

    repayEthWrite(
      {
        address: wethGatewayAddress,
        args: [
          lendingPoolAddress, // lendingPool
          repayAmountWei, // amount of debt to repay
          BigInt(2), // rateMode (2 = variable)
          userAddress, // onBehalfOf
        ],
        value: msgValue,
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('repay-native');
          toast.error(t('repayFailed'), {
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

  const derivedStatus: RepayNativeTxStatus = isSigningPending ? 'repaying' : isConfirming ? 'confirming' : status;

  return {
    status: derivedStatus,
    repay,
    reset,
    isBusy: isSigningPending || isConfirming,
    txHash,
  };
}
