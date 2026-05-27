'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { getAuthMeRequest } from './requests';

export function useAuthMe() {
  const token = useForumAuthStore((s) => {
    return s.token;
  });
  const hasHydrated = useForumAuthStore((s) => s.hasHydrated);
  const setUser = useForumAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const data = await getAuthMeRequest();
      setUser(data.user);
      return data;
    },
    enabled: hasHydrated && !!token,
    staleTime: 5 * 60 * 1000,
  });
}
