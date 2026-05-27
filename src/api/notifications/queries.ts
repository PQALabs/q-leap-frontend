'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import {
  getNotificationsRequest,
  getUnreadCountRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from './requests';
import type { INotificationsParams } from './types';

const POLL_INTERVAL = 30_000;

export function useInfiniteNotifications(params: Omit<INotificationsParams, 'page'> = {}) {
  const token = useForumAuthStore((s) => s.token);

  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: ({ pageParam }) => getNotificationsRequest({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!token,
    refetchInterval: POLL_INTERVAL,
    staleTime: 0,
  });
}

export function useUnreadNotificationCount() {
  const token = useForumAuthStore((s) => s.token);

  return useQuery<number>({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadCountRequest,
    enabled: !!token,
    refetchInterval: POLL_INTERVAL,
    staleTime: 0,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationReadRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
    },
  });
}
