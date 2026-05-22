'use client';

import { useQuery } from '@tanstack/react-query';
import { getModeratorsRequest } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';

export function useModerators() {
  return useQuery({
    queryKey: queryKeys.moderation.moderators(),
    queryFn: getModeratorsRequest,
  });
}
