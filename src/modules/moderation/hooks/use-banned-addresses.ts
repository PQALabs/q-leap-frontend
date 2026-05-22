'use client';

import { useQuery } from '@tanstack/react-query';
import { getBannedAddressesRequest } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';

export function useBannedAddresses() {
  return useQuery({
    queryKey: queryKeys.moderation.bannedAddresses(),
    queryFn: getBannedAddressesRequest,
  });
}
