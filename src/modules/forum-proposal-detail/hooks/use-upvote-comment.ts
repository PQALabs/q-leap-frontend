'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { upvoteForumCommentRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { buildUpvoteCommentSignatureMessage } from '../comment-signatures';

export function useUpvoteComment(proposalId: string) {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  const token = useForumAuthStore((s) => s.token);
  const requireSignature = useForumAuthStore((s) => s.user?.requireSignature ?? false);

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!token) {
        throw new Error('Please sign in to the forum to upvote.');
      }

      let signature: string | undefined;
      let payload: { signatureTimestamp: number } | undefined;

      if (requireSignature) {
        const signatureTimestamp = Date.now();
        const message = buildUpvoteCommentSignatureMessage({ proposalId, commentId, signatureTimestamp });
        signature = await signMessageAsync({ message });
        payload = { signatureTimestamp };
      }

      return upvoteForumCommentRequest({
        proposalId,
        commentId,
        payload,
        signature,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments() });
    },
  });
}
