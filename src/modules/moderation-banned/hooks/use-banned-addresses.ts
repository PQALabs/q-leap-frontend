'use client';

import { useQuery } from '@tanstack/react-query';
import { getBannedAddressesRequest, type IModerationListParams } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';

export function useBannedAddresses(params: IModerationListParams = {}) {
  return useQuery({
    queryKey: queryKeys.moderation.bannedAddresses(params),
    queryFn: () => getBannedAddressesRequest(params),
  });
}
