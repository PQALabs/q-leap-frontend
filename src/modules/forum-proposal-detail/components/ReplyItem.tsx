'use client';

import { ChevronDown, ChevronUp, Reply as ReplyIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { IForumComment, IForumCommentAnchor } from '@/api/forum';
import { useForumCommentReplies } from '@/api/forum';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { BanAddressDialog } from '@/modules/moderation-banned/components/BanAddressDialog';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { useCommentAnchorScroll } from '../hooks/use-comment-anchor-scroll';
import { COMMENT_REPLIES_POLL_INTERVAL, copyCommentLink, isWithinEditWindow } from '../utils/comment';
import { formatProposalDate, formatProposalDateFull } from '../utils/proposal';
import { CommentActionsMenu } from './CommentActionsMenu';
import { CommentAuthorAddress } from './CommentAuthorAddress';
import { AuthorRoleBadge, CurrentUserBadge, DeletedCommentPlaceholder } from './CommentBadges';
import { CommentMarkdownPreview } from './CommentMarkdownPreview';
import { DialogReportComment } from './DialogReportComment';
import { EditCommentForm } from './EditCommentForm';
import { UserAvatar } from './UserAvatar';

type ReplyItemProps = {
  reply: IForumComment;
  depth: number;
  proposalId: string;
  connectedAddress?: string;
  anchor?: IForumCommentAnchor;
  highlightedCommentId?: string | null;
  upvotingCommentId?: string | null;
  onReply: (comment: IForumComment) => void;
  onUpvote: (commentId: string) => void;
  onUpdate: (commentId: string, content: string, isReply: boolean) => Promise<void>;
  onDelete: (commentId: string, isReply: boolean, byModerator: boolean) => void;
  onAnchorResolved?: (commentId: string) => void;
};

export function ReplyItem({
  reply,
  depth,
  proposalId,
  connectedAddress,
  anchor,
  highlightedCommentId,
  upvotingCommentId,
  onReply,
  onUpvote,
  onUpdate,
  onDelete,
  onAnchorResolved,
}: ReplyItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const isAnchorAncestor = anchor?.ancestorCommentIds.includes(reply.id) ?? false;
  const isAnchorTarget = anchor?.targetCommentId === reply.id;
  const highlighted = highlightedCommentId === reply.id;
  const replyPageToLoad = anchor?.replyPages[reply.id];
  const anchorRef = useCommentAnchorScroll({
    commentId: reply.id,
    isTarget: isAnchorTarget,
    onAnchorResolved,
  });

  const isMod = useForumAuthStore((s) => s.user?.role === 'admin' || s.user?.role === 'moderator');
  const viewerRole = useForumAuthStore((s) => s.user?.role);
  const isLoggedIn = useForumAuthStore((s) => !!s.token);

  const repliesQuery = useForumCommentReplies({
    variables: { proposalId, commentId: reply.id },
    enabled: expanded && reply.replyCount > 0,
    refetchInterval: COMMENT_REPLIES_POLL_INTERVAL,
  });

  const subReplies = repliesQuery.data?.pages.flatMap((p) => p.data) ?? [];
  const loadedReplyPages = repliesQuery.data?.pages.length ?? 0;
  const isDeleted = !!reply.deletedAt;
  const canReply = depth < 2;
  const isOwner = !!connectedAddress && connectedAddress.toLowerCase() === reply.authorAddress.toLowerCase();
  const canEdit = isOwner && isWithinEditWindow(reply.createdAt);

  const handleEditOpen = () => {
    if (!canEdit) {
      toast.error('Replies can only be edited within 24 hours.');
      return;
    }

    setIsEditOpen(true);
  };

  const handleEditSubmit = async (content: string) => {
    if (!canEdit) {
      throw new Error('Replies can only be edited within 24 hours.');
    }

    await onUpdate(reply.id, content, true);
  };

  useEffect(() => {
    if (isAnchorAncestor) {
      setExpanded(true);
    }
  }, [isAnchorAncestor]);

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

  return (
    <div
      ref={anchorRef}
      data-comment-id={reply.id}
      className={cn(
        'flex gap-5 rounded-lg py-2 transition-colors duration-500',
        highlighted && 'bg-primary/10 ring-1 ring-primary/30'
      )}
    >
      <div className='mt-1 shrink-0'>
        <UserAvatar address={reply.authorAddress} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col gap-y-1 text-sm'>
            <CommentAuthorAddress
              address={reply.authorAddress}
              copyButtonClassName='text-muted-foreground/70'
              copyIconClassName='size-4'
            >
              <AuthorRoleBadge role={reply.authorRole} />
              <span className='size-1 rounded-full bg-muted-foreground/30' />
              {isOwner && <CurrentUserBadge />}
            </CommentAuthorAddress>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='cursor-default text-muted-foreground'>{formatProposalDate(reply.createdAt)}</span>
                </TooltipTrigger>
                <TooltipContent>{formatProposalDateFull(reply.createdAt)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {reply.editedCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className='cursor-default text-muted-foreground text-xs'>(edited)</span>
                  </TooltipTrigger>
                  <TooltipContent>Last edited {formatProposalDateFull(reply.updatedAt)}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            <CommentActionsMenu
              isOwner={!isDeleted && isOwner}
              isMod={!isDeleted && isMod}
              canEdit={!isDeleted && canEdit}
              isLoggedIn={!isDeleted && isLoggedIn}
              viewerRole={viewerRole}
              authorRole={reply.authorRole}
              authorAddress={reply.authorAddress}
              onEdit={handleEditOpen}
              onDelete={(byModerator) => onDelete(reply.id, true, byModerator)}
              onBan={setBanTarget}
              onReport={() => setIsReportOpen(true)}
              onCopyLink={() => copyCommentLink(reply.id)}
            />
          </div>
        </div>

        {isDeleted ? (
          <DeletedCommentPlaceholder className='mt-1 text-base leading-6' />
        ) : (
          <CommentMarkdownPreview source={reply.contentMarkdown} className='mt-1 text-xl leading-8' />
        )}

        {!isDeleted && (
          <div className='mt-5 flex items-center gap-5 text-muted-foreground'>
            {canReply && (
              <Button
                variant='ghost'
                size='sm'
                className='h-8 gap-2 rounded-full px-0 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground'
                onClick={() => onReply(reply)}
              >
                <ReplyIcon className='size-5' />
                Reply
              </Button>
            )}
          </div>
        )}

        <div className='mt-3 flex items-center gap-4'>
          {reply.replyCount > 0 && (
            <>
              <span className='h-px w-14 shrink-0 bg-border' />
              <Button
                variant='ghost'
                size='sm'
                className='h-8 gap-2 rounded-full px-0 text-muted-foreground hover:bg-transparent hover:text-foreground'
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
                {expanded
                  ? `${subReplies.length} ${subReplies.length === 1 ? 'reply' : 'replies'}`
                  : `${reply.replyCount} ${reply.replyCount === 1 ? 'reply' : 'replies'}`}
              </Button>
            </>
          )}
        </div>

        {expanded && (
          <div className='mt-4 space-y-6 border-border/70 border-l pl-5'>
            {repliesQuery.isLoading && <p className='py-3 text-muted-foreground text-xs'>Loading replies…</p>}
            {subReplies.map((subReply) => (
              <ReplyItem
                key={subReply.id}
                reply={subReply}
                depth={depth + 1}
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
          </div>
        )}
      </div>

      <EditCommentForm
        open={isEditOpen}
        initialContent={reply.contentMarkdown}
        onOpenChange={setIsEditOpen}
        onSubmit={handleEditSubmit}
      />
      <BanAddressDialog open={!!banTarget} targetAddress={banTarget} onClose={() => setBanTarget(null)} />
      <DialogReportComment
        open={isReportOpen}
        proposalId={proposalId}
        commentId={reply.id}
        onOpenChange={setIsReportOpen}
      />
    </div>
  );
}
