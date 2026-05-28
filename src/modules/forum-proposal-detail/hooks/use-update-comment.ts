'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import type { IForumComment, IForumCommentsResponse } from '@/api/forum';
import { updateForumCommentRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { buildEditCommentSignatureMessage } from '../utils/signatures';

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
  const { mutateAsync: signMessageAsync } = useSignMessage();

  const token = useForumAuthStore((s) => s.token);
  const requireSignature = useForumAuthStore((s) => s.user?.requireSignature ?? false);

  return useMutation({
    mutationFn: async ({ commentId, content }: UpdateCommentInput) => {
      if (!token) {
        throw new Error('Please sign in to the forum to edit a comment.');
      }

      const contentMarkdown = content.trim();
      let signature: string | undefined;
      let signatureTimestamp: number | undefined;

      if (requireSignature) {
        signatureTimestamp = Date.now();
        const message = buildEditCommentSignatureMessage({
          proposalId,
          commentId,
          contentMarkdown,
          signatureTimestamp,
        });
        signature = await signMessageAsync({ message });
      }

      return updateForumCommentRequest({
        proposalId,
        commentId,
        payload: {
          contentMarkdown,
          contentHtml: contentMarkdown,
          ...(signatureTimestamp !== undefined && { signatureTimestamp }),
        },
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
