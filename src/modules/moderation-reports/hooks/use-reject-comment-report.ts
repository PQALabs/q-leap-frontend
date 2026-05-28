'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectCommentReportRequest } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';

export function useRejectCommentReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: number) => rejectCommentReportRequest(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.commentReports() });
    },
  });
}
