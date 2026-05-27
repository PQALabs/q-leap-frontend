'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { deleteForumCommentRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { buildDeleteCommentSignatureMessage } from '@/modules/forum-proposal-detail/comment-signatures';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';

type DeleteCommentInput = {
  proposalId: string;
  commentId: string;
};

export function useModeratorDeleteComment() {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const requireSignature = useForumAuthStore((s) => s.user?.requireSignature ?? false);

  return useMutation({
    mutationFn: async ({ proposalId, commentId }: DeleteCommentInput) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.commentReports() });
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.commentReplies() });
    },
  });
}
