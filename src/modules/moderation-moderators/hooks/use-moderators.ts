'use client';

import { useQuery } from '@tanstack/react-query';
import { getModeratorsRequest, type IModerationListParams } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';

export function useModerators(params: IModerationListParams = {}) {
  return useQuery({
    queryKey: queryKeys.moderation.moderators(params),
    queryFn: () => getModeratorsRequest(params),
  });
}
