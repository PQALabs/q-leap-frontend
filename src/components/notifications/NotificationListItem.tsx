'use client';

import type { INotification, NotificationType } from '@/api/notifications/types';
import { cn } from '@/lib/utils';
import { truncateAddress } from '@/lib/wallet';

type NotificationContent = {
  title: string;
  message: string;
};

type NotificationListItemProps = {
  notification: INotification;
  onRead: (id: string, href: string | null) => void;
};

function quoteProposalTitle(title?: string | null): string | null {
  const trimmed = title?.trim();
  return trimmed ? `“${trimmed}”` : null;
}

function getNotificationContent(notification: INotification): NotificationContent {
  const p = notification.payload as any;
  const proposalTitle = quoteProposalTitle(p.proposalTitle);

  switch (notification.type) {
    case 'comment_replied':
      return {
        title: 'New reply to your comment',
        message: proposalTitle
          ? `${truncateAddress(p.replyAuthorAddress)} replied to your comment on ${proposalTitle}.`
          : `${truncateAddress(p.replyAuthorAddress)} replied to your comment.`,
      };
    case 'proposal_commented':
      return {
        title: 'New comment on your proposal',
        message: proposalTitle
          ? `${truncateAddress(p.commenterAddress)} commented on ${proposalTitle}.`
          : `${truncateAddress(p.commenterAddress)} commented on your proposal.`,
      };
    case 'comment_upvoted':
      return {
        title: 'Your comment was upvoted',
        message: proposalTitle
          ? `${truncateAddress(p.voterAddress)} upvoted your comment on ${proposalTitle}. Total upvotes: ${p.currentUpvotes}.`
          : `${truncateAddress(p.voterAddress)} upvoted your comment.`,
      };
    case 'comment_deleted':
      return {
        title: 'Your comment was removed',
        message: proposalTitle
          ? `A ${p.deletedByRole ?? 'moderator'} removed your comment on ${proposalTitle}.`
          : 'A moderator removed your comment.',
      };
    case 'user_banned':
      return {
        title: 'Your forum access was restricted',
        message: p.reason
          ? `You can still view discussions, but commenting is disabled. Reason: ${p.reason}.`
          : 'You can still view discussions, but commenting is disabled.',
      };
  }
}

function getNotificationHref(type: NotificationType, payload: any): string | null {
  switch (type) {
    case 'comment_replied':
      return `/forum/${payload.proposalId}?commentId=${payload.replyId}`;
    case 'proposal_commented':
    case 'comment_upvoted':
    case 'comment_deleted':
      return `/forum/${payload.proposalId}?commentId=${payload.commentId}`;
    case 'user_banned':
      return null;
  }
}

export function NotificationListItem({ notification, onRead }: NotificationListItemProps) {
  const href = getNotificationHref(notification.type, notification.payload as any);
  const { title, message } = getNotificationContent(notification);
  const time = new Date(notification.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <button
      type='button'
      onClick={() => onRead(notification.id, href)}
      className={cn(
        'w-full rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent',
        !notification.isRead && 'bg-muted/60'
      )}
    >
      <div className='flex items-start gap-2'>
        {!notification.isRead && <span className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500' />}
        <div className={cn('flex-1 space-y-0.5', notification.isRead && 'pl-4')}>
          <p className='font-medium text-sm leading-snug'>{title}</p>
          <p className='text-muted-foreground text-xs leading-snug'>{message}</p>
          <p className='text-muted-foreground text-xs'>{time}</p>
        </div>
      </div>
    </button>
  );
}
