'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnection, useSignMessage } from 'wagmi';
import { createForumProposalRequest, type ForumProposalType } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { FORUM_PROPOSAL_SIGNATURE_PREFIX } from './constants';

type CreateProposalInput = {
  title: string;
  content: string;
  category: ForumProposalType;
};

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { isConnected } = useConnection();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async ({ title, content, category }: CreateProposalInput) => {
      if (!isConnected) {
        throw new Error('Connect your wallet before creating a topic.');
      }

      const signatureTimestamp = Date.now();
      const message = `${FORUM_PROPOSAL_SIGNATURE_PREFIX}:${signatureTimestamp}`;
      const signature = await signMessageAsync({ message });

      return createForumProposalRequest({
        payload: {
          title: title.trim(),
          description: content.trim(),
          proposalType: category,
          signatureTimestamp,
        },
        signature,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.forum.proposals() });
    },
  });
}
