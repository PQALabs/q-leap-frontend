'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useWriteLendingPoolSetUserUseReserveAsCollateral } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type CollateralToggleStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

interface UseCollateralToggleOptions {
  /** Callback after successful toggle */
  onSuccess?: () => void;
}

/**
 * Hook to toggle an asset's usage as collateral.
 * Calls `LendingPool.setUserUseReserveAsCollateral(asset, useAsCollateral)`.
 * No approval needed — single tx.
 */
export function useCollateralToggle({ onSuccess }: UseCollateralToggleOptions = {}) {
  const t = useTranslations('modules.market.Toasts');
  const [status, setStatus] = useState<CollateralToggleStatus>('idle');
  const [togglingAsset, setTogglingAsset] = useState<string | null>(null);
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;

  const handledTx = useRef<string | null>(null);

  const {
    mutate: writeSetCollateral,
    data: txHash,
    isPending: isSigningPending,
    reset: resetWrite,
  } = useWriteLendingPoolSetUserUseReserveAsCollateral();

  const {
    isSuccess: isConfirmed,
    isLoading: isConfirming,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // ── Confirmation effects ──
  useEffect(() => {
    if (isConfirmed && txHash && handledTx.current !== txHash) {
      handledTx.current = txHash;
      setStatus('success');
      setTogglingAsset(null);
      toast.dismiss('collateral-toggle');
      toast.success(t('collateralUpdated'));
      onSuccess?.();
    }
  }, [isConfirmed, txHash, onSuccess]);

  useEffect(() => {
    if (isConfirming) {
      toast.loading(t('confirmingOnChain'), { id: 'collateral-toggle' });
    }
  }, [isConfirming]);

  useEffect(() => {
    if (isReceiptError && txHash) {
      setStatus('error');
      setTogglingAsset(null);
      toast.dismiss('collateral-toggle');
      toast.error(t('collateralTransactionReverted'), {
        description: receiptError?.message?.split('\n')[0] || t('failedUpdateCollateral'),
      });
    }
  }, [isReceiptError, txHash, receiptError]);

  // ── Action ──
  const toggle = (assetAddress: `0x${string}`, useAsCollateral: boolean) => {
    setStatus('pending');
    setTogglingAsset(assetAddress.toLowerCase());
    resetWrite();
    toast.loading(useAsCollateral ? t('enablingCollateral') : t('disablingCollateral'), {
      id: 'collateral-toggle',
    });

    writeSetCollateral(
      {
        address: lendingPoolAddress,
        args: [assetAddress, useAsCollateral],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          setTogglingAsset(null);
          toast.dismiss('collateral-toggle');
          toast.error(t('failedToggleCollateral'), {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const reset = () => {
    setStatus('idle');
    setTogglingAsset(null);
    resetWrite();
  };

  const derivedStatus: CollateralToggleStatus = isSigningPending ? 'pending' : isConfirming ? 'confirming' : status;

  return {
    status: derivedStatus,
    toggle,
    reset,
    isBusy: isSigningPending || isConfirming,
    /** Lowercase address of the asset currently being toggled, null if idle */
    togglingAsset,
    txHash,
  };
}
