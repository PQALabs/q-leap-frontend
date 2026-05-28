'use client';

import { useIntersection } from '@mantine/hooks';
import { MessageSquare } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useConnection } from 'wagmi';
import type { IForumComment } from '@/api/forum';
import { useForumCommentAnchor, useForumComments } from '@/api/forum';
import { useAddressBanStatus } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { AddCommentForm } from './components/AddCommentForm';
import { ConfirmDeleteCommentDialog, type PendingDeleteComment } from './components/ConfirmDeleteCommentDialog';
import { DialogUserBanned } from './components/DialogUserBanned';
import { ForumProposalDetailError } from './components/ForumProposalDetailError';
import { ForumProposalDetailSkeleton } from './components/ForumProposalDetailSkeleton';
import { ProposalArticleCard } from './components/ProposalArticleCard';
import { ProposalDetailActions } from './components/ProposalDetailActions';
import { ReplyCard } from './components/ReplyCard';
import { useCreateComment } from './hooks/use-create-comment';
import { useDeleteComment } from './hooks/use-delete-comment';
import { useForumProposalDetail } from './hooks/use-forum-proposal-detail';
import { usePinComment } from './hooks/use-pin-comment';
import { useUpdateComment } from './hooks/use-update-comment';
import { useUpvoteComment } from './hooks/use-upvote-comment';
import { getForumCommentMutationErrorMessage } from './utils/error';

type ForumProposalDetailProps = {
  proposalId: string;
};

const COMMENTS_ANCHOR_PARAMS = {
  limit: 10,
  sortBy: 'upvotes,createdAt' as const,
  order: 'DESC,DESC' as const,
};
const COMMENTS_POLL_INTERVAL = 5_000;

function getRootCommentId(replyTarget: IForumComment): string {
  // level-0 target → its own id; level-1 target → its parent is the root
  return replyTarget.parentCommentId ?? replyTarget.id;
}

export function ForumProposalDetail({ proposalId }: ForumProposalDetailProps) {
  const searchParams = useSearchParams();
  const commentIdParam = searchParams.get('commentId')?.trim() ?? '';
  const { proposal, isLoading, isError, refetch, isRefetching } = useForumProposalDetail(proposalId);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [isBannedDialogOpen, setIsBannedDialogOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<IForumComment | null>(null);
  const [expandedRepliesCommentId, setExpandedRepliesCommentId] = useState<string | null>(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteComment | null>(null);
  const completedAnchorCommentIdRef = useRef<string | null>(null);
  const anchorErrorCommentIdRef = useRef<string | null>(null);
  const commentsQuery = useForumComments({
    variables: { proposalId, ...COMMENTS_ANCHOR_PARAMS },
    enabled: Boolean(proposalId),
    refetchInterval: COMMENTS_POLL_INTERVAL,
  });
  const anchorQuery = useForumCommentAnchor({
    variables: { proposalId, commentId: commentIdParam, ...COMMENTS_ANCHOR_PARAMS },
    enabled: Boolean(proposalId && commentIdParam),
  });

  const comments = commentsQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const anchor = anchorQuery.data;
  const loadedRootCommentPages = commentsQuery.data?.pages.length ?? 0;

  const { address } = useConnection();
  const { data: banRecord } = useAddressBanStatus(address);
  const createComment = useCreateComment(proposalId);
  const upvoteComment = useUpvoteComment(proposalId);
  const pinComment = usePinComment(proposalId);
  const updateComment = useUpdateComment(proposalId);
  const deleteComment = useDeleteComment(proposalId);

  const handleOpenCommentDialog = (target: IForumComment | null) => {
    if (banRecord) {
      setIsBannedDialogOpen(true);
      return;
    }
    setReplyTarget(target);
    setIsCommentDialogOpen(true);
  };

  const { ref: intersectionRef, entry } = useIntersection({ threshold: 0.1 });

  useEffect(() => {
    if (entry?.isIntersecting && commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
      commentsQuery.fetchNextPage();
    }
  }, [entry?.isIntersecting, commentsQuery.hasNextPage, commentsQuery.isFetchingNextPage]);

  useEffect(() => {
    completedAnchorCommentIdRef.current = null;
    anchorErrorCommentIdRef.current = null;
    setHighlightedCommentId(null);
  }, [commentIdParam]);

  useEffect(() => {
    if (!commentIdParam || !anchorQuery.isError || anchorErrorCommentIdRef.current === commentIdParam) {
      return;
    }

    anchorErrorCommentIdRef.current = commentIdParam;
    toast.error('Comment not found');
  }, [anchorQuery.isError, commentIdParam]);

  useEffect(() => {
    if (
      !anchor ||
      loadedRootCommentPages >= anchor.rootPage ||
      !commentsQuery.hasNextPage ||
      commentsQuery.isFetchingNextPage
    ) {
      return;
    }

    commentsQuery.fetchNextPage();
  }, [anchor?.rootPage, commentsQuery.hasNextPage, commentsQuery.isFetchingNextPage, loadedRootCommentPages]);

  useEffect(() => {
    if (
      !anchor ||
      loadedRootCommentPages < anchor.rootPage ||
      completedAnchorCommentIdRef.current === anchor.targetCommentId
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (completedAnchorCommentIdRef.current !== anchor.targetCommentId) {
        completedAnchorCommentIdRef.current = anchor.targetCommentId;
        toast.error('Comment not found');
      }
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [anchor, loadedRootCommentPages]);

  const handleAnchorResolved = useCallback((targetCommentId: string) => {
    if (completedAnchorCommentIdRef.current === targetCommentId) {
      return;
    }

    completedAnchorCommentIdRef.current = targetCommentId;
    setHighlightedCommentId(targetCommentId);

    window.setTimeout(() => {
      setHighlightedCommentId((current) => (current === targetCommentId ? null : current));
    }, 2400);
  }, []);

  const handleCommentSubmit = async (content: string) => {
    const commentIdToExpand = replyTarget ? getRootCommentId(replyTarget) : null;

    await createComment.mutateAsync({
      content,
      parentCommentId: replyTarget?.id,
    });

    if (commentIdToExpand) {
      setExpandedRepliesCommentId(commentIdToExpand);
    }
  };

  const handleUpvote = async (commentId: string) => {
    if (banRecord) {
      setIsBannedDialogOpen(true);
      return;
    }
    try {
      await upvoteComment.mutateAsync(commentId);
    } catch (error) {
      toast.error(getForumCommentMutationErrorMessage(error, 'Failed to upvote.'));
    }
  };

  const handleUpdate = async (commentId: string, content: string, isReply: boolean) => {
    await updateComment.mutateAsync({ commentId, content, isReply });
  };

  const handlePinToggle = async (comment: IForumComment) => {
    if (comment.parentCommentId) {
      toast.error('Only root comments can be pinned.');
      return;
    }

    const toastId = toast.loading(comment.pinned ? 'Unpinning comment…' : 'Pinning comment…', {
      description: 'Confirm the signature in your wallet.',
    });

    try {
      await pinComment.mutateAsync({ commentId: comment.id, pinned: comment.pinned });
      toast.success(comment.pinned ? 'Comment unpinned' : 'Comment pinned', { id: toastId });
    } catch (error) {
      toast.error(
        getForumCommentMutationErrorMessage(
          error,
          comment.pinned ? 'Failed to unpin comment.' : 'Failed to pin comment.'
        ),
        { id: toastId }
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    try {
      await deleteComment.mutateAsync(pendingDelete);
      toast.success('Comment deleted');
      setPendingDelete(null);
    } catch (error) {
      toast.error(getForumCommentMutationErrorMessage(error, 'Failed to delete comment.'));
    }
  };

  if (isLoading) {
    return <ForumProposalDetailSkeleton />;
  }

  if (isError || !proposal) {
    return <ForumProposalDetailError onRetry={() => refetch()} isRetrying={isRefetching} />;
  }

  return (
    <main className='min-h-screen bg-background px-4 pt-24 pb-16 md:px-10'>
      <div className='mx-auto flex max-w-[1200px] items-start gap-8'>
        <ProposalDetailActions onCommentClick={() => handleOpenCommentDialog(null)} />

        <div className='flex min-w-0 flex-1 flex-col gap-6'>
          {/* <SnapshotSummaryCard proposal={proposal} /> */}
          <ProposalArticleCard proposal={proposal} />
          <AddCommentForm
            open={isCommentDialogOpen}
            proposalTitle={proposal.title}
            replyTo={replyTarget}
            onOpenChange={(open) => {
              setIsCommentDialogOpen(open);
              if (!open) setReplyTarget(null);
            }}
            onSubmit={handleCommentSubmit}
          />
          <DialogUserBanned
            open={isBannedDialogOpen}
            onOpenChange={setIsBannedDialogOpen}
            expiresAt={banRecord?.expiresAt ?? null}
            reason={banRecord?.reason}
          />

          {comments.map((comment) => (
            <ReplyCard
              key={comment.id}
              comment={comment}
              proposalId={proposalId}
              connectedAddress={address}
              autoExpandReplies={expandedRepliesCommentId === comment.id}
              anchor={anchor}
              highlightedCommentId={highlightedCommentId}
              upvotingCommentId={upvoteComment.isPending ? upvoteComment.variables : null}
              pinningCommentId={pinComment.isPending ? pinComment.variables?.commentId : null}
              onReply={(comment) => handleOpenCommentDialog(comment)}
              onUpvote={handleUpvote}
              onUpdate={handleUpdate}
              onDelete={(commentId, isReply, byModerator) => setPendingDelete({ commentId, isReply, byModerator })}
              onPinToggle={handlePinToggle}
              onAnchorResolved={handleAnchorResolved}
            />
          ))}

          {commentsQuery.isFetchingNextPage && (
            <div className='flex justify-center py-4'>
              <span className='text-muted-foreground text-sm'>Loading more comments…</span>
            </div>
          )}

          {commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage && (
            <div ref={intersectionRef}>
              <Button variant='outline' className='w-full' onClick={() => commentsQuery.fetchNextPage()}>
                Load more comments
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteCommentDialog
        target={pendingDelete}
        isPending={deleteComment.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      <button
        type='button'
        aria-label='Add Comment'
        className='fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90 lg:hidden'
        onClick={() => handleOpenCommentDialog(null)}
      >
        <MessageSquare className='size-5' />
      </button>
    </main>
  );
}
