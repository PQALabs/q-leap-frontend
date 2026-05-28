'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { IForumComment, IForumCommentAnchor } from '@/api/forum';
import { useForumCommentReplies } from '@/api/forum';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COMMENT_REPLIES_POLL_INTERVAL } from '../utils/comment';
import { ReplyItem } from './ReplyItem';

type CommentRepliesSectionProps = {
  comment: IForumComment;
  proposalId: string;
  connectedAddress?: string;
  autoExpand?: boolean;
  anchor?: IForumCommentAnchor;
  highlightedCommentId?: string | null;
  upvotingCommentId?: string | null;
  onReply: (comment: IForumComment) => void;
  onUpvote: (commentId: string) => void;
  onUpdate: (commentId: string, content: string, isReply: boolean) => Promise<void>;
  onDelete: (commentId: string, isReply: boolean, byModerator: boolean) => void;
  onAnchorResolved?: (commentId: string) => void;
};

export function CommentRepliesSection({
  comment,
  proposalId,
  connectedAddress,
  autoExpand,
  anchor,
  highlightedCommentId,
  upvotingCommentId,
  onReply,
  onUpvote,
  onUpdate,
  onDelete,
  onAnchorResolved,
}: CommentRepliesSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const isAnchorAncestor = anchor?.ancestorCommentIds.includes(comment.id) ?? false;
  const replyPageToLoad = anchor?.replyPages[comment.id];

  const repliesQuery = useForumCommentReplies({
    variables: { proposalId, commentId: comment.id },
    enabled: expanded,
    refetchInterval: COMMENT_REPLIES_POLL_INTERVAL,
  });

  const replies = repliesQuery.data?.pages.flatMap((p) => p.data) ?? [];
  const loadedReplyPages = repliesQuery.data?.pages.length ?? 0;

  useEffect(() => {
    if (autoExpand || isAnchorAncestor) {
      setExpanded(true);
    }
  }, [autoExpand, isAnchorAncestor]);

  useEffect(() => {
    if (
      !expanded ||
      !replyPageToLoad ||
      loadedReplyPages >= replyPageToLoad ||
      !repliesQuery.hasNextPage ||
      repliesQuery.isFetchingNextPage
    ) {
      return;
    }

    repliesQuery.fetchNextPage();
  }, [
    expanded,
    loadedReplyPages,
    replyPageToLoad,
    repliesQuery.hasNextPage,
    repliesQuery.isFetchingNextPage,
    repliesQuery.fetchNextPage,
  ]);

  if (comment.replyCount === 0) {
    return null;
  }

  return (
    <div className='mt-1'>
      <div className='flex items-center gap-4'>
        <span className='h-px w-14 shrink-0 bg-border' />
        <Button
          variant='ghost'
          size='sm'
          className='h-9 gap-2 rounded-full px-2 font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? <ChevronUp className='size-5' /> : <ChevronDown className='size-5' />}
          {expanded
            ? `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
            : `${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
        </Button>
      </div>

      {expanded && (
        <div className='mt-4 space-y-6'>
          {repliesQuery.isLoading && <p className='py-3 text-muted-foreground text-sm'>Loading replies…</p>}
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              depth={1}
              proposalId={proposalId}
              connectedAddress={connectedAddress}
              anchor={anchor}
              highlightedCommentId={highlightedCommentId}
              upvotingCommentId={upvotingCommentId}
              onReply={onReply}
              onUpvote={onUpvote}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAnchorResolved={onAnchorResolved}
            />
          ))}
          {repliesQuery.hasNextPage && !repliesQuery.isFetchingNextPage && (
            <Button
              variant='ghost'
              size='sm'
              className={cn('mt-1 h-8 rounded-full px-3 text-muted-foreground text-sm hover:text-foreground')}
              onClick={() => repliesQuery.fetchNextPage()}
            >
              Load more replies
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
