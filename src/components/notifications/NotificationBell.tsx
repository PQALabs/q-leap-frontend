'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';
import {
  useInfiniteNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useUnreadNotificationCount,
} from '@/api/notifications/queries';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useRouter } from '@/i18n/navigation';
import { NotificationListItem } from './NotificationListItem';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { data: unreadData } = useUnreadNotificationCount();
  const {
    data: notificationsData,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteNotifications({ limit: 20 });
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const unreadCount = unreadData ?? 0;
  const notifications = notificationsData?.pages.flatMap((p) => p.data) ?? [];

  const handleRead = (id: string, href: string | null) => {
    markRead(id);
    if (href) {
      router.push(href);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label='Notifications'
          className='relative flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent'
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className='-right-0.5 -top-0.5 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 font-semibold text-[10px] text-white leading-none'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-80 p-0'>
        <div className='flex items-center justify-between px-4 py-3'>
          <h3 className='font-semibold text-sm'>Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-7 px-2 text-xs'
              disabled={isMarkingAll}
              onClick={() => markAllRead()}
            >
              Mark all read
            </Button>
          )}
        </div>

        <Separator />

        <div className='max-h-[400px] overflow-y-auto'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8 text-muted-foreground text-sm'>Loading...</div>
          ) : notifications.length === 0 ? (
            <div className='flex items-center justify-center py-8 text-muted-foreground text-sm'>
              No notifications yet
            </div>
          ) : (
            <div className='flex flex-col gap-0.5 p-2'>
              {notifications.map((n) => (
                <NotificationListItem key={n.id} notification={n} onRead={handleRead} />
              ))}
              {hasNextPage && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='mt-1 w-full text-xs'
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
