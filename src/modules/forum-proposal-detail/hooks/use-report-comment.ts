'use client';

import { useMutation } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { reportForumCommentRequest } from '@/api/forum';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { buildReportCommentSignatureMessage } from '../utils/signatures';

type ReportCommentInput = {
  proposalId: string;
  commentId: string;
  reason: string;
};

export function useReportComment() {
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const token = useForumAuthStore((s) => s.token);
  const requireSignature = useForumAuthStore((s) => s.user?.requireSignature ?? false);

  return useMutation({
    mutationFn: async ({ proposalId, commentId, reason }: ReportCommentInput) => {
      if (!token) {
        throw new Error('Please sign in to the forum to report a comment.');
      }

      let signature: string | undefined;
      let signatureTimestamp: number | undefined;

      if (requireSignature) {
        signatureTimestamp = Date.now();
        const message = buildReportCommentSignatureMessage({
          proposalId,
          commentId,
          reason,
          signatureTimestamp,
        });
        signature = await signMessageAsync({ message });
      }

      return reportForumCommentRequest({
        proposalId,
        commentId,
        payload: { reason, ...(signatureTimestamp !== undefined && { signatureTimestamp }) },
        signature,
      });
    },
  });
}
