export type NotificationType =
  | 'comment_replied'
  | 'proposal_commented'
  | 'comment_upvoted'
  | 'comment_deleted'
  | 'user_banned';

export type NotificationPayload =
  | {
      replyId: string;
      replyAuthorAddress: string;
      commentId: string;
      proposalId: string;
      proposalTitle?: string | null;
    }
  | { commentId: string; commenterAddress: string; proposalId: string; proposalTitle?: string | null }
  | {
      commentId: string;
      proposalId: string;
      voterAddress: string;
      currentUpvotes: number;
      proposalTitle?: string | null;
    }
  | {
      commentId: string;
      proposalId: string;
      deletedByAddress: string;
      deletedByRole: string;
      proposalTitle?: string | null;
    }
  | { moderatorAddress: string; reason: string | null; expiresAt: string | null };

export interface INotification {
  id: string;
  recipientAddress: string;
  type: NotificationType;
  payload: NotificationPayload;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface INotificationMeta {
  currentPage: number;
  itemsPerPage: number;
  itemCount: number;
  totalItems: number;
  totalPages: number;
}

export interface INotificationsResponse {
  data: INotification[];
  meta: INotificationMeta;
}

export interface INotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface IUnreadCountResponse {
  meta: { code: number; message: string };
  data: { count: number };
}
