'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { unbanAddressRequest } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { buildUnbanAddressMessage } from '../moderation-signatures';

export function useUnbanAddress() {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const token = useForumAuthStore((s) => s.token);

  return useMutation({
    mutationFn: async (targetAddress: string) => {
      if (!token) {
        throw new Error('Please sign in to perform this action.');
      }

      const address = targetAddress.toLowerCase();
      const signatureTimestamp = Date.now();
      const message = buildUnbanAddressMessage({ address, signatureTimestamp });
      const signature = await signMessageAsync({ message });

      return unbanAddressRequest({ address, body: { signatureTimestamp }, signature });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.moderation.bannedAddresses() }),
  });
}
