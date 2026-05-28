'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { createForumProposalRequest, type ForumProposalType } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { FORUM_PROPOSAL_SIGNATURE_PREFIX } from '../constants';

type CreateProposalInput = {
  title: string;
  content: string;
  category: ForumProposalType;
};

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  const token = useForumAuthStore((s) => s.token);
  const requireSignature = useForumAuthStore((s) => s.user?.requireSignature ?? false);

  return useMutation({
    mutationFn: async ({ title, content, category }: CreateProposalInput) => {
      if (!token) {
        throw new Error('Please sign in to the forum before creating a topic.');
      }

      let signature: string | undefined;
      let signatureTimestamp: number | undefined;

      if (requireSignature) {
        signatureTimestamp = Date.now();
        const message = `${FORUM_PROPOSAL_SIGNATURE_PREFIX}:${signatureTimestamp}`;
        signature = await signMessageAsync({ message });
      }

      return createForumProposalRequest({
        payload: {
          title: title.trim(),
          description: content.trim(),
          proposalType: category,
          ...(signatureTimestamp !== undefined && { signatureTimestamp }),
        },
        signature,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.forum.proposals() });
    },
  });
}
