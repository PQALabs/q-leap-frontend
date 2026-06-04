'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import type { IForumComment, IForumCommentsResponse } from '@/api/forum';
import { pinForumCommentRequest, unpinForumCommentRequest } from '@/api/forum';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { buildPinCommentSignatureMessage, buildUnpinCommentSignatureMessage } from '../utils/signatures';

type PinCommentInput = {
  commentId: string;
  pinned: boolean;
};

type InfiniteData = {
  pages: IForumCommentsResponse[];
  pageParams: unknown[];
};

function patchCommentInPages(pages: IForumCommentsResponse[], updated: IForumComment): IForumCommentsResponse[] {
  return pages.map((page) => ({
    ...page,
    data: page.data
      .map((comment) => (comment.id === updated.id ? updated : comment))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned)),
  }));
}

export function usePinComment(proposalId: string) {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  const token = useForumAuthStore((s) => s.token);
  const role = useForumAuthStore((s) => s.user?.role);

  return useMutation({
    mutationFn: async ({ commentId, pinned }: PinCommentInput) => {
      if (!token) {
        throw new Error('Please sign in to the forum to pin comments.');
      }

      if (role !== 'moderator' && role !== 'admin') {
        throw new Error('Only moderators and admins can pin comments.');
      }

      const signatureTimestamp = Date.now();
      const message = pinned
        ? buildUnpinCommentSignatureMessage({ proposalId, commentId, signatureTimestamp })
        : buildPinCommentSignatureMessage({ proposalId, commentId, signatureTimestamp });
      const signature = await signMessageAsync({ message });
      const payload = { signatureTimestamp };

      if (pinned) {
        return unpinForumCommentRequest({ proposalId, commentId, payload, signature });
      }

      return pinForumCommentRequest({ proposalId, commentId, payload, signature });
    },
    onSuccess: (updated) => {
      for (const queryKey of [queryKeys.forum.comments(), queryKeys.forum.commentReplies()]) {
        queryClient.setQueriesData<InfiniteData>({ queryKey }, (old) => {
          if (!old) return old;
          return { ...old, pages: patchCommentInPages(old.pages, updated) };
        });
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.commentReplies() });
    },
  });
}
