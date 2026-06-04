import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { getUserProfileRequest } from './requests';
import type { IUserProfile } from './types';

export const useUserProfile = (opts?: { enabled?: boolean }) => {
  const token = useForumAuthStore((s) => s.token);
  return useQuery<IUserProfile, Error>({
    queryKey: queryKeys.user.profile(token ?? undefined),
    queryFn: getUserProfileRequest,
    ...opts,
  });
};
