'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { addModeratorRequest } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { buildAddModeratorMessage } from '../moderation-signatures';

export function useAddModerator() {
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
      const message = buildAddModeratorMessage({ address, signatureTimestamp });
      const signature = await signMessageAsync({ message });

      return addModeratorRequest({ address, body: { signatureTimestamp }, signature });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.moderation.moderators() }),
  });
}
