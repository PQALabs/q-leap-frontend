'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveCommentReportRequest } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';

export function useResolveCommentReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: number) => resolveCommentReportRequest(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.commentReports() });
    },
  });
}
