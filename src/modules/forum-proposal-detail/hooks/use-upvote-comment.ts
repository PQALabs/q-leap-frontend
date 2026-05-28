'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnection, useSignMessage } from 'wagmi';
import { upvoteForumCommentRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { buildUpvoteCommentSignatureMessage } from '../comment-signatures';

export function useUpvoteComment(proposalId: string) {
  const queryClient = useQueryClient();
  const { isConnected } = useConnection();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!isConnected) {
        throw new Error('Connect your wallet to upvote.');
      }

      const signatureTimestamp = Date.now();
      const message = buildUpvoteCommentSignatureMessage({ proposalId, commentId, signatureTimestamp });
      const signature = await signMessageAsync({ message });

      return upvoteForumCommentRequest({
        proposalId,
        commentId,
        payload: { signatureTimestamp },
        signature,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments() });
    },
  });
}
