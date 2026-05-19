'use client';

import { useIntersection } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useConnection } from 'wagmi';
import type { IForumComment } from '@/api/forum';
import { useForumComments } from '@/api/forum';
import { Button } from '@/components/ui/button';
import { AddCommentForm } from './components/AddCommentForm';
import { ForumProposalDetailError } from './components/ForumProposalDetailError';
import { ForumProposalDetailSkeleton } from './components/ForumProposalDetailSkeleton';
import { ProposalArticleCard } from './components/ProposalArticleCard';
import { ProposalDetailActions } from './components/ProposalDetailActions';
import { ReplyCard } from './components/ReplyCard';
import { useCreateComment } from './hooks/use-create-comment';
import { useDeleteComment } from './hooks/use-delete-comment';
import { useForumProposalDetail } from './hooks/use-forum-proposal-detail';
import { useUpdateComment } from './hooks/use-update-comment';
import { useUpvoteComment } from './hooks/use-upvote-comment';
import { getForumCommentMutationErrorMessage } from './utils';

type ForumProposalDetailProps = {
  proposalId: string;
};

function getRootCommentId(replyTarget: IForumComment): string {
  // level-0 target → its own id; level-1 target → its parent is the root
  return replyTarget.parentCommentId ?? replyTarget.id;
}

export function ForumProposalDetail({ proposalId }: ForumProposalDetailProps) {
  const { proposal, isLoading, isError, refetch, isRefetching } = useForumProposalDetail(proposalId);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState<IForumComment | null>(null);
  const [expandedRepliesCommentId, setExpandedRepliesCommentId] = useState<string | null>(null);
  const commentsQuery = useForumComments({
    variables: { proposalId },
    enabled: Boolean(proposalId),
  });

  const comments = commentsQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const { address } = useConnection();
  const createComment = useCreateComment(proposalId);
  const upvoteComment = useUpvoteComment(proposalId);
  const updateComment = useUpdateComment(proposalId);
  const deleteComment = useDeleteComment(proposalId);

  const { ref: intersectionRef, entry } = useIntersection({ threshold: 0.1 });

  useEffect(() => {
    if (entry?.isIntersecting && commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
      commentsQuery.fetchNextPage();
    }
  }, [entry?.isIntersecting, commentsQuery]);

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
    try {
      await upvoteComment.mutateAsync(commentId);
    } catch (error) {
      toast.error(getForumCommentMutationErrorMessage(error, 'Failed to upvote.'));
    }
  };

  const handleUpdate = async (commentId: string, content: string, isReply: boolean) => {
    await updateComment.mutateAsync({ commentId, content, isReply });
  };

  const handleDelete = async (commentId: string, isReply: boolean) => {
    try {
      await deleteComment.mutateAsync({ commentId, isReply });
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
        <ProposalDetailActions
          onCommentClick={() => {
            setReplyTarget(null);
            setIsCommentDialogOpen(true);
          }}
        />

        <div className='flex min-w-0 flex-1 flex-col gap-8'>
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

          {comments.map((comment) => (
            <ReplyCard
              key={comment.id}
              comment={comment}
              proposalId={proposalId}
              connectedAddress={address}
              autoExpandReplies={expandedRepliesCommentId === comment.id}
              upvotingCommentId={upvoteComment.isPending ? upvoteComment.variables : null}
              onReply={(comment) => {
                setReplyTarget(comment);
                setIsCommentDialogOpen(true);
              }}
              onUpvote={handleUpvote}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
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
    </main>
  );
}
