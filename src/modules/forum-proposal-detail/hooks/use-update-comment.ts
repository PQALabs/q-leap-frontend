'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnection, useSignMessage } from 'wagmi';
import type { IForumComment, IForumCommentsResponse } from '@/api/forum';
import { updateForumCommentRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { buildEditCommentSignatureMessage } from '../comment-signatures';

type UpdateCommentInput = {
  commentId: string;
  content: string;
  isReply: boolean;
};

type InfiniteData = {
  pages: IForumCommentsResponse[];
  pageParams: unknown[];
};

function patchCommentInPages(pages: IForumCommentsResponse[], updated: IForumComment): IForumCommentsResponse[] {
  return pages.map((page) => ({
    ...page,
    data: page.data.map((c) => (c.id === updated.id ? updated : c)),
  }));
}

export function useUpdateComment(proposalId: string) {
  const queryClient = useQueryClient();
  const { isConnected } = useConnection();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  return useMutation({
    mutationFn: async ({ commentId, content }: UpdateCommentInput) => {
      if (!isConnected) {
        throw new Error('Connect your wallet to edit a comment.');
      }

      const signatureTimestamp = Date.now();
      const contentMarkdown = content.trim();
      const message = buildEditCommentSignatureMessage({
        proposalId,
        commentId,
        contentMarkdown,
        signatureTimestamp,
      });
      const signature = await signMessageAsync({ message });

      return updateForumCommentRequest({
        proposalId,
        commentId,
        payload: { contentMarkdown, contentHtml: contentMarkdown, signatureTimestamp },
        signature,
      });
    },
    onSuccess: (updated, { isReply }) => {
      const targetKey = isReply ? queryKeys.forum.commentReplies() : queryKeys.forum.comments();

      queryClient.setQueriesData<InfiniteData>({ queryKey: targetKey }, (old) => {
        if (!old) return old;
        return { ...old, pages: patchCommentInPages(old.pages, updated) };
      });

      queryClient.invalidateQueries({ queryKey: targetKey });
    },
  });
}
