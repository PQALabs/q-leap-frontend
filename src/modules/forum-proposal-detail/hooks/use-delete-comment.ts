'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnection, useSignMessage } from 'wagmi';
import { deleteForumCommentRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { buildDeleteCommentSignatureMessage } from '../comment-signatures';

type DeleteCommentInput = {
  commentId: string;
  isReply: boolean;
};

export function useDeleteComment(proposalId: string) {
  const queryClient = useQueryClient();
  const { isConnected } = useConnection();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async ({ commentId }: DeleteCommentInput) => {
      if (!isConnected) {
        throw new Error('Connect your wallet to delete a comment.');
      }

      const signatureTimestamp = Date.now();
      const message = buildDeleteCommentSignatureMessage({ proposalId, commentId, signatureTimestamp });
      const signature = await signMessageAsync({ message });

      return deleteForumCommentRequest({
        proposalId,
        commentId,
        payload: { signatureTimestamp },
        signature,
      });
    },
    onSuccess: (_, { isReply }) => {
      const toInvalidate = [queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments() })];

      if (isReply) {
        toInvalidate.push(queryClient.invalidateQueries({ queryKey: queryKeys.forum.commentReplies() }));
      }

      return Promise.all(toInvalidate);
    },
  });
}
