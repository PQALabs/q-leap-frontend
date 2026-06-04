'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { removeModeratorRequest } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';
import { buildRemoveModeratorMessage } from '@/modules/moderation/utils/moderation-signatures';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';

export function useRemoveModerator() {
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
      const message = buildRemoveModeratorMessage({ address, signatureTimestamp });
      const signature = await signMessageAsync({ message });

      return removeModeratorRequest({ address, body: { signatureTimestamp }, signature });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.moderation.moderators() }),
  });
}
