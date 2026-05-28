'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { deleteForumCommentRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { buildDeleteCommentSignatureMessage } from '../comment-signatures';

type DeleteCommentInput = {
  commentId: string;
  isReply: boolean;
};

export function useDeleteComment(proposalId: string) {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  const token = useForumAuthStore((s) => s.token);
  const requireSignature = useForumAuthStore((s) => s.user?.requireSignature ?? false);

  return useMutation({
    mutationFn: async ({ commentId }: DeleteCommentInput) => {
      if (!token) {
        throw new Error('Please sign in to the forum to delete a comment.');
      }

      let signature: string | undefined;
      let payload: { signatureTimestamp: number } | undefined;

      if (requireSignature) {
        const signatureTimestamp = Date.now();
        const message = buildDeleteCommentSignatureMessage({ proposalId, commentId, signatureTimestamp });
        signature = await signMessageAsync({ message });
        payload = { signatureTimestamp };
      }

      return deleteForumCommentRequest({ proposalId, commentId, payload, signature });
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
