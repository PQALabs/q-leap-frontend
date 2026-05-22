'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { getCommentReportsRequest } from './requests';
import type { ICommentReportListParams } from './types';

export function useCommentReports(params: ICommentReportListParams = {}) {
  return useQuery({
    queryKey: queryKeys.moderation.commentReports(params),
    queryFn: () => getCommentReportsRequest(params),
    staleTime: 30 * 1000,
  });
}
