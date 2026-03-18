import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Erc20Abi } from '@/abi';
import { getEvmMessage } from '@/lib/get-evm-message';

type ERC20FunctionName = 'approve' | 'transfer' | 'transferFrom';

interface UseWriteERC20Props {
  functionName: ERC20FunctionName;
  onSuccess?: () => void;
  successMessage?: string;
  waitingMessage?: string;
}

export const useWriteERC20 = ({
  functionName,
  onSuccess,
  successMessage = 'Transaction successful!',
  waitingMessage = 'Transaction confirming...',
}: UseWriteERC20Props) => {
  const { mutateAsync: executeTransaction, data: hash, isPending: isExecuting } = useWriteContract();
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: transactionError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const writeERC20 = useCallback(
    async (address: `0x${string}`, args: any[]) => {
      try {
        const hash = await executeTransaction({
          address,
          abi: Erc20Abi,
          functionName: functionName as any,
          args: args as any,
        });
        return hash;
      } catch (error) {
        console.error('Failed to execute ERC20 transaction:', error);
        toast.error('Approval failed', {
          description: getEvmMessage(error),
        });
        throw error;
      }
    },
    [executeTransaction]
  );

  useEffect(() => {
    if (isConfirmed) {
      if (loadingToastId) toast.dismiss(loadingToastId);
      toast.success(successMessage);
      onSuccess?.();
    }
  }, [successMessage, isConfirmed, loadingToastId]);

  useEffect(() => {
    if (isConfirming) {
      const id = toast.loading(waitingMessage);
      setLoadingToastId(id);
    }
  }, [isConfirming, waitingMessage]);

  useEffect(() => {
    if (transactionError) {
      if (loadingToastId) toast.dismiss(loadingToastId);
      toast.error('Approval failed', {
        description: getEvmMessage(transactionError),
      });
    }
  }, [transactionError, loadingToastId]);

  return {
    writeERC20,
    isExecuting: isExecuting || isConfirming,
    isConfirmed,
    hash,
  };
};
