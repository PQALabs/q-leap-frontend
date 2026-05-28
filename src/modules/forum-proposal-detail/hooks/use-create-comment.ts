'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnection, useSignMessage } from 'wagmi';
import { createForumCommentRequest, createForumReplyRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { buildCreateCommentSignatureMessage } from '../comment-signatures';

type CreateCommentInput = {
  content: string;
  parentCommentId?: string;
};

export function useCreateComment(proposalId: string) {
  const queryClient = useQueryClient();
  const { isConnected } = useConnection();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async ({ content, parentCommentId }: CreateCommentInput) => {
      if (!isConnected) {
        throw new Error('Connect your wallet to comment.');
      }

      const signatureTimestamp = Date.now();
      const contentMarkdown = content.trim();
      const message = buildCreateCommentSignatureMessage({
        proposalId,
        parentCommentId,
        contentMarkdown,
        signatureTimestamp,
      });
      const signature = await signMessageAsync({ message });

      const payload = {
        contentMarkdown,
        contentHtml: contentMarkdown,
        signatureTimestamp,
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
