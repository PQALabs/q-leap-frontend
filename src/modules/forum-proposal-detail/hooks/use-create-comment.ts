'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { createForumCommentRequest, createForumReplyRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { buildCreateCommentSignatureMessage } from '../comment-signatures';

type CreateCommentInput = {
  content: string;
  parentCommentId?: string;
};

export function useCreateComment(proposalId: string) {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  const token = useForumAuthStore((s) => s.token);
  const requireSignature = useForumAuthStore((s) => s.user?.requireSignature ?? false);

  return useMutation({
    mutationFn: async ({ content, parentCommentId }: CreateCommentInput) => {
      if (!token) {
        throw new Error('Please sign in to the forum to comment.');
      }

      const contentMarkdown = content.trim();
      let signature: string | undefined;
      let signatureTimestamp: number | undefined;

      if (requireSignature) {
        signatureTimestamp = Date.now();
        const message = buildCreateCommentSignatureMessage({
          proposalId,
          parentCommentId,
          contentMarkdown,
          signatureTimestamp,
        });
        signature = await signMessageAsync({ message });
      }

      const payload = {
        contentMarkdown,
        contentHtml: contentMarkdown,
        ...(signatureTimestamp !== undefined && { signatureTimestamp }),
      };

      if (parentCommentId) {
        return createForumReplyRequest({ proposalId, commentId: parentCommentId, payload, signature });
      }

      return createForumCommentRequest({ proposalId, payload, signature });
    },
    onSuccess: async (_, { parentCommentId }) => {
      const refreshStats = [
        queryClient.invalidateQueries({ queryKey: queryKeys.forum.proposal() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.forum.proposals() }),
      ];

      if (parentCommentId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments() }),
          queryClient.invalidateQueries({ queryKey: queryKeys.forum.commentReplies() }),
          ...refreshStats,
        ]);
        return;
      }

      await Promise.all([queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments() }), ...refreshStats]);
    },
  });
}
