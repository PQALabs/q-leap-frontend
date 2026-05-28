export const queryKeys = {
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
};
