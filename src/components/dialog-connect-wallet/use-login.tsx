import { toast } from 'sonner';
import { useDisconnect, useSignMessage } from 'wagmi';
import { getCurrentUserRequest } from '@/apis/auth';
import { useCreateNonceMutation, useLoginMutation } from '@/apis/auth/mutations';
import { useAuth } from '@/hooks/use-auth';
import { getEvmMessage } from '@/lib/connect-wallet-msg';
import { createSignatureMessage } from '@/lib/utils';

export const useLogin = () => {
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const { mutateAsync: createNonce, isPending: isGettingNonce } = useCreateNonceMutation();
  const { mutateAsync: login, isPending: isLoggingIn } = useLoginMutation();
  const { mutateAsync: disConnectEvm } = useDisconnect();
  const { setUser } = useAuth();

  const loginByWallet = async (address: string) => {
    try {
      const { data: nonceData } = await createNonce({ address });

      const signature = await signMessageAsync({
        message: createSignatureMessage(nonceData.nonce, address),
        account: address as `0x${string}`,
      });

      await login({
        address,
        signature,
        nonce: nonceData.nonce,
      });

      const userRes = await getCurrentUserRequest();

      setUser(userRes.data);
    } catch (error: any) {
      toast.error(getEvmMessage(error));
      disConnectEvm();
    }
  };

  return {
    loginByWallet,
    isGettingNonce,
    isLoggingIn,
  };
};
