export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  liquidation: {
    positions: (...params: any[]) => ['liquidation-positions', ...params],
    position: (...params: any[]) => ['liquidation-position', ...params],
  },
  forum: {
    proposals: (...params: any[]) => ['forum-proposals', ...params],
    proposal: (...params: any[]) => ['forum-proposal', ...params],
    comments: (...params: any[]) => ['forum-comments', ...params],
    commentReplies: (...params: any[]) => ['forum-comment-replies', ...params],
  },
  moderation: {
    moderators: () => ['moderation', 'moderators'] as const,
    bannedAddresses: () => ['moderation', 'banned-addresses'] as const,
    addressBanStatus: (address: string) => ['moderation', 'ban-status', address] as const,
    commentReports: (...params: any[]) => ['moderation', 'comment-reports', ...params],
  },
};
