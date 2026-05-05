'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits, maxUint256, parseUnits } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useReadErc20Allowance, useWriteErc20Approve, useWriteLendingPoolLiquidationCall } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type LiquidationTxStatus =
  | 'idle'
  | 'approving'
  | 'confirming-approve'
  | 'liquidating'
  | 'confirming-liquidation'
  | 'success'
  | 'error';

interface UseLiquidationOptions {
  collateralAssetAddress: `0x${string}`;
  debtAssetAddress: `0x${string}`;
  debtDecimals: number;
  borrowerAddress: `0x${string}`;
  liquidatorAddress: `0x${string}` | undefined;
  amountToCover: string;
  receiveAToken: boolean;
  isMax?: boolean;
  onSuccess?: () => void;
}

export function useLiquidation({
  collateralAssetAddress,
  debtAssetAddress,
  debtDecimals,
  borrowerAddress,
  liquidatorAddress,
  amountToCover,
  receiveAToken,
  isMax,
  onSuccess,
}: UseLiquidationOptions) {
  const [status, setStatus] = useState<LiquidationTxStatus>('idle');
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;

  const handledApproveTx = useRef<string | null>(null);
  const handledLiquidationTx = useRef<string | null>(null);

  // ── Read current allowance of debt asset ──
  const { data: allowanceRaw, refetch: refetchAllowance } = useReadErc20Allowance({
    address: debtAssetAddress,
    args: liquidatorAddress ? [liquidatorAddress, lendingPoolAddress] : undefined,
    query: { enabled: !!liquidatorAddress, refetchInterval: 5000 },
  });

  const allowance = useMemo(() => {
    if (allowanceRaw == null) return '0';
    return formatUnits(allowanceRaw, debtDecimals);
  }, [allowanceRaw, debtDecimals]);

  const needsApproval = useMemo(() => {
    if (!amountToCover || Number(amountToCover) <= 0) return false;
    return Number(allowance) < Number(amountToCover);
  }, [amountToCover, allowance]);

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
  } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // ── Liquidation write ──
  const {
    mutate: liquidationWrite,
    data: liquidationTxHash,
    isPending: isLiquidationPending,
    reset: resetLiquidation,
  } = useWriteLendingPoolLiquidationCall();

  const {
    isSuccess: isLiquidationConfirmed,
    isLoading: isLiquidationConfirming,
    isError: isLiquidationReceiptError,
    error: liquidationReceiptError,
  } = useWaitForTransactionReceipt({ hash: liquidationTxHash });

  // ── Effects ──
  useEffect(() => {
    if (isApproveConfirmed && approveTxHash && handledApproveTx.current !== approveTxHash) {
      handledApproveTx.current = approveTxHash;
      refetchAllowance();
      setStatus('idle');
      toast.dismiss('liquidation-approve');
      toast.success('Approval confirmed', { description: 'You can now liquidate the position.' });
    }
  }, [isApproveConfirmed, approveTxHash, refetchAllowance]);

  useEffect(() => {
    if (isApproveConfirming) {
      toast.loading('Confirming approval on-chain...', { id: 'liquidation-approve' });
    }
  }, [isApproveConfirming]);

  useEffect(() => {
    if (isApproveReceiptError && approveTxHash) {
      setStatus('error');
      toast.dismiss('liquidation-approve');
      toast.error('Approval reverted', {
        description: approveReceiptError?.message?.split('\n')[0] || 'Transaction failed',
      });
    }
  }, [isApproveReceiptError, approveTxHash, approveReceiptError]);

  useEffect(() => {
    if (isLiquidationConfirmed && liquidationTxHash && handledLiquidationTx.current !== liquidationTxHash) {
      handledLiquidationTx.current = liquidationTxHash;
      setStatus('success');
      toast.dismiss('liquidation-exec');
      toast.success('Liquidation confirmed', { description: `Successfully liquidated ${amountToCover} debt.` });
      onSuccess?.();
    }
  }, [isLiquidationConfirmed, liquidationTxHash, onSuccess, amountToCover]);

  useEffect(() => {
    if (isLiquidationConfirming) {
      toast.loading('Confirming liquidation on-chain...', { id: 'liquidation-exec' });
    }
  }, [isLiquidationConfirming]);

  useEffect(() => {
    if (isLiquidationReceiptError && liquidationTxHash) {
      setStatus('error');
      toast.dismiss('liquidation-exec');
      toast.error('Liquidation transaction reverted', {
        description: liquidationReceiptError?.message?.split('\n')[0] || 'Transaction failed',
      });
    }
  }, [isLiquidationReceiptError, liquidationTxHash, liquidationReceiptError]);

  const approve = () => {
    if (!liquidatorAddress || !amountToCover || Number(amountToCover) <= 0) return;
    setStatus('approving');
    resetApprove();
    toast.loading('Waiting for approval signature...', { id: 'liquidation-approve' });

    const baseAmount = parseUnits(amountToCover, debtDecimals);
    const approveAmount = isMax ? maxUint256 : baseAmount;

    approveWrite(
      {
        address: debtAssetAddress,
        args: [lendingPoolAddress, approveAmount],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('liquidation-approve');
          toast.error('Approval failed', {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const liquidate = () => {
    if (!liquidatorAddress || !amountToCover || Number(amountToCover) <= 0) return;
    setStatus('liquidating');
    resetLiquidation();
    toast.loading('Waiting for liquidation signature...', { id: 'liquidation-exec' });

    // Always pass the exact UI-selected amount to avoid over-liquidating when the form's max
    // already represents the protocol's 50% liquidation cap.
    const debtToCover = parseUnits(amountToCover, debtDecimals);

    liquidationWrite(
      {
        address: lendingPoolAddress,
        args: [collateralAssetAddress, debtAssetAddress, borrowerAddress, debtToCover, receiveAToken],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('liquidation-exec');
          toast.error('Liquidation failed', {
            description: getEvmMessage(error),
          });
        },
      }
    );
  };

  const reset = () => {
    setStatus('idle');
    resetApprove();
    resetLiquidation();
  };

  const derivedStatus: LiquidationTxStatus = isApprovePending
    ? 'approving'
    : isApproveConfirming
      ? 'confirming-approve'
      : isLiquidationPending
        ? 'liquidating'
        : isLiquidationConfirming
          ? 'confirming-liquidation'
          : status;

  return {
    status: derivedStatus,
    allowance,
    needsApproval,
    approve,
    liquidate,
    reset,
    isBusy: isApprovePending || isApproveConfirming || isLiquidationPending || isLiquidationConfirming,
    approveTxHash,
    liquidationTxHash,
  };
}
