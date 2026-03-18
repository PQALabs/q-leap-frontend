'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits, maxUint256, parseEther } from 'viem';
import { useWaitForTransactionReceipt } from 'wagmi';
import { useReadErc20Allowance, useWriteErc20Approve, useWriteWethGatewayWithdrawEth } from '@/abi/generated';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useProtocolDataContext } from '@/providers/protocol-data-provider';

export type WithdrawNativeTxStatus =
  | 'idle'
  | 'approving'
  | 'confirming-approve'
  | 'withdrawing'
  | 'confirming'
  | 'success'
  | 'error';

interface UseWithdrawNativeOptions {
  /** aToken address for the wrapped native asset (aWQDAY) */
  aTokenAddress: `0x${string}`;
  /** The user's wallet address */
  userAddress: `0x${string}` | undefined;
  /** Human-readable amount of native QDAY to withdraw */
  amount: string;
  /** If true, withdraw entire balance using MAX_UINT256 */
  isMax?: boolean;
  /** Callback after successful withdrawal */
  onSuccess?: () => void;
}

/**
 * Hook for native QDAY withdraw flow via WETHGateway.
 *
 * Flow: approve aToken (aWQDAY) to WETHGateway → gateway.withdrawETH(pool, amount, to)
 * Approval IS required because the gateway needs to transferFrom the aTokens.
 */
export function useWithdrawNative({ aTokenAddress, userAddress, amount, isMax, onSuccess }: UseWithdrawNativeOptions) {
  const [status, setStatus] = useState<WithdrawNativeTxStatus>('idle');
  const { currentMarketData } = useProtocolDataContext();
  const lendingPoolAddress = currentMarketData.addresses.LENDING_POOL as `0x${string}`;
  const wethGatewayAddress = currentMarketData.addresses.WETH_GATEWAY as `0x${string}`;

  // Track which tx hashes we've already shown toasts for
  const handledApproveTx = useRef<string | null>(null);
  const handledWithdrawTx = useRef<string | null>(null);

  // ── Read aToken allowance for WETHGateway ──
  const { data: allowanceRaw, refetch: refetchAllowance } = useReadErc20Allowance({
    address: aTokenAddress,
    args: userAddress ? [userAddress, wethGatewayAddress] : undefined,
    query: { enabled: !!userAddress && !!wethGatewayAddress, refetchInterval: 5000 },
  });

  const needsApproval = useMemo(() => {
    if (!amount || Number(amount) <= 0 || allowanceRaw == null) return true;
    const required = parseEther(amount);
    return allowanceRaw < required;
  }, [amount, allowanceRaw]);

  // ── Approve aToken to WETHGateway ──
  const {
    mutate: approveWrite,
    data: approveTxHash,
    isPending: isApprovePending,
    reset: resetApprove,
  } = useWriteErc20Approve();

  const { isSuccess: isApproveConfirmed, isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveTxHash,
  });

  // ── Withdraw via WETHGateway ──
  const {
    mutate: withdrawWrite,
    data: withdrawTxHash,
    isPending: isWithdrawPending,
    reset: resetWithdraw,
  } = useWriteWethGatewayWithdrawEth();

  const {
    isSuccess: isWithdrawConfirmed,
    isLoading: isWithdrawConfirming,
    isError: isWithdrawReceiptError,
    error: withdrawReceiptError,
  } = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
  });

  // ── On-chain confirmation effects ──
  useEffect(() => {
    if (isApproveConfirmed && approveTxHash && handledApproveTx.current !== approveTxHash) {
      handledApproveTx.current = approveTxHash;
      refetchAllowance();
      setStatus('idle');
      toast.dismiss('withdraw-native-approve');
      toast.success('Approval confirmed', {
        description: 'aToken spending approved for WETHGateway. You can now withdraw.',
      });
    }
  }, [isApproveConfirmed, approveTxHash, refetchAllowance]);

  useEffect(() => {
    if (isWithdrawConfirmed && withdrawTxHash && handledWithdrawTx.current !== withdrawTxHash) {
      handledWithdrawTx.current = withdrawTxHash;
      setStatus('success');
      toast.dismiss('withdraw-native');
      toast.success('Withdrawal confirmed', {
        description: `Successfully withdrew ${isMax ? 'all' : amount} QDAY.`,
      });
      refetchAllowance();
      onSuccess?.();
    }
  }, [isWithdrawConfirmed, withdrawTxHash, onSuccess, amount, isMax]);

  // Loading toasts
  useEffect(() => {
    if (isApproveConfirming) {
      toast.loading('Confirming approval on-chain...', { id: 'withdraw-native-approve' });
    }
  }, [isApproveConfirming]);

  useEffect(() => {
    if (isWithdrawConfirming) {
      toast.loading('Confirming withdrawal on-chain...', { id: 'withdraw-native' });
    }
  }, [isWithdrawConfirming]);

  // Handle on-chain revert (tx sent but reverted)
  useEffect(() => {
    if (isWithdrawReceiptError && withdrawTxHash) {
      setStatus('error');
      toast.dismiss('withdraw-native');
      toast.error('Withdrawal transaction reverted on-chain', {
        description: withdrawReceiptError?.message?.split('\n')[0] || 'Transaction failed',
      });
    }
  }, [isWithdrawReceiptError, withdrawTxHash, withdrawReceiptError]);

  // ── Actions ──
  const approve = () => {
    if (!userAddress || !wethGatewayAddress) return;
    setStatus('approving');
    resetApprove();
    toast.loading('Waiting for approval signature...', { id: 'withdraw-native-approve' });

    // Approve exact amount (not unlimited)
    const approveAmount = isMax ? maxUint256 : parseEther(amount);
    approveWrite(
      {
        address: aTokenAddress,
        args: [wethGatewayAddress, approveAmount],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('withdraw-native-approve');
          toast.error('Approval failed', { description: getEvmMessage(error) });
        },
      }
    );
  };

  const withdraw = () => {
    if (!userAddress || !amount || Number(amount) <= 0 || !wethGatewayAddress) return;
    setStatus('withdrawing');
    resetWithdraw();
    toast.loading('Waiting for withdrawal signature...', { id: 'withdraw-native' });

    const withdrawAmount = isMax ? maxUint256 : parseEther(amount);

    withdrawWrite(
      {
        address: wethGatewayAddress,
        args: [lendingPoolAddress, withdrawAmount, userAddress],
      },
      {
        onError: (error: any) => {
          setStatus('error');
          toast.dismiss('withdraw-native');
          toast.error('Withdrawal failed', { description: getEvmMessage(error) });
        },
      }
    );
  };

  const reset = () => {
    setStatus('idle');
    resetApprove();
    resetWithdraw();
  };

  // Derive combined status
  const derivedStatus: WithdrawNativeTxStatus = isApprovePending
    ? 'approving'
    : isApproveConfirming
      ? 'confirming-approve'
      : isWithdrawPending
        ? 'withdrawing'
        : isWithdrawConfirming
          ? 'confirming'
          : status;

  return {
    status: derivedStatus,
    needsApproval,
    allowance: allowanceRaw != null ? formatUnits(allowanceRaw, 18) : '0',
    approve,
    withdraw,
    reset,
    isBusy: isApprovePending || isApproveConfirming || isWithdrawPending || isWithdrawConfirming,
    approveTxHash,
    withdrawTxHash,
  };
}
