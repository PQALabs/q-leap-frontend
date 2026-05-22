'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { getAddressBanStatusRequest } from './requests';

export function useAddressBanStatus(address: string | undefined) {
  return useQuery({
    queryKey: queryKeys.moderation.addressBanStatus(address ?? ''),
    queryFn: () => getAddressBanStatusRequest(address!),
    enabled: !!address,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}
