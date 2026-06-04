'use client';

import { Heart, Reply as ReplyIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { IForumComment, IForumCommentAnchor } from '@/api/forum';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { BanAddressDialog } from '@/modules/moderation-banned/components/BanAddressDialog';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { useCommentAnchorScroll } from '../hooks/use-comment-anchor-scroll';
import { copyCommentLink, isWithinEditWindow } from '../utils/comment';
import { formatProposalDate, formatProposalDateFull } from '../utils/proposal';
import { CommentActionsMenu } from './CommentActionsMenu';
import { CommentAuthorAddress } from './CommentAuthorAddress';
import { AuthorRoleBadge, CurrentUserBadge, DeletedCommentPlaceholder, PinCommentButton } from './CommentBadges';
import { CommentMarkdownPreview } from './CommentMarkdownPreview';
import { CommentRepliesSection } from './CommentRepliesSection';
import { DialogReportComment } from './DialogReportComment';
import { EditCommentForm } from './EditCommentForm';
import { UserAvatar } from './UserAvatar';

type ReplyCardProps = {
  comment: IForumComment;
  proposalId: string;
  connectedAddress?: string;
  autoExpandReplies?: boolean;
  anchor?: IForumCommentAnchor;
  highlightedCommentId?: string | null;
  upvotingCommentId?: string | null;
  pinningCommentId?: string | null;
  onReply: (comment: IForumComment) => void;
  onUpvote: (commentId: string) => void;
  onUpdate: (commentId: string, content: string, isReply: boolean) => Promise<void>;
  onDelete: (commentId: string, isReply: boolean, byModerator: boolean) => void;
  onPinToggle: (comment: IForumComment) => void;
  onAnchorResolved?: (commentId: string) => void;
};

export function ReplyCard({
  comment,
  proposalId,
  connectedAddress,
  autoExpandReplies,
  anchor,
  highlightedCommentId,
  upvotingCommentId,
  pinningCommentId,
  onReply,
  onUpvote,
  onUpdate,
  onDelete,
  onPinToggle,
  onAnchorResolved,
}: ReplyCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const isAnchorTarget = anchor?.targetCommentId === comment.id;
  const highlighted = highlightedCommentId === comment.id;
  const anchorRef = useCommentAnchorScroll({
    commentId: comment.id,
    isTarget: isAnchorTarget,
    onAnchorResolved,
  });

  const isMod = useForumAuthStore((s) => s.user?.role === 'admin' || s.user?.role === 'moderator');
  const viewerRole = useForumAuthStore((s) => s.user?.role);
  const isLoggedIn = useForumAuthStore((s) => !!s.token);

  const isDeleted = !!comment.deletedAt;
  const isUpvoting = (id: string) => upvotingCommentId === id;
  const isOwner = !!connectedAddress && connectedAddress.toLowerCase() === comment.authorAddress.toLowerCase();
  const canEdit = isOwner && isWithinEditWindow(comment.createdAt);

  const handleEditOpen = () => {
    if (!canEdit) {
      toast.error('Comments can only be edited within 24 hours.');
      return;
    }

    setIsEditOpen(true);
  };

  const handleEditSubmit = async (content: string) => {
    if (!canEdit) {
      throw new Error('Comments can only be edited within 24 hours.');
    }

    await onUpdate(comment.id, content, false);
  };

  return (
    <>
      <div ref={anchorRef} data-comment-id={comment.id}>
        <Card
          className={cn(
            'rounded-none border-border bg-card py-0 text-card-foreground shadow-none transition-colors duration-500',
            highlighted && 'bg-primary/10 ring-1 ring-primary/30'
          )}
        >
          <CardContent className='p-4 md:p-6'>
            <div className='flex w-full items-start gap-5'>
              <UserAvatar address={comment.authorAddress} />
              <div className='flex min-w-0 flex-1 items-start justify-between gap-2'>
                <div className='flex flex-col gap-1 text-sm'>
                  <CommentAuthorAddress address={comment.authorAddress} copyButtonClassName='text-muted-foreground/70'>
                    <AuthorRoleBadge role={comment.authorRole} />
                    {isOwner && (
                      <>
                        <span className='size-1.5 rounded-full bg-muted-foreground/30' />
                        <CurrentUserBadge />
                      </>
                    )}
                  </CommentAuthorAddress>

                  <div className='flex items-center gap-1 text-xs'>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className='cursor-default text-muted-foreground'>
                            {formatProposalDate(comment.createdAt)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side='left'>{formatProposalDateFull(comment.createdAt)}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {comment.editedCount > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className='cursor-default text-muted-foreground text-xs'>(edited)</span>
                          </TooltipTrigger>
                          <TooltipContent side='right'>
                            Last edited {formatProposalDateFull(comment.updatedAt)}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                <div className='flex shrink-0 items-center gap-1'>
                  {!isDeleted && isMod && (
                    <PinCommentButton
                      pinned={comment.pinned}
                      isPinning={pinningCommentId === comment.id}
                      onClick={() => onPinToggle(comment)}
                    />
                  )}
                  <CommentActionsMenu
                    isOwner={!isDeleted && isOwner}
                    isMod={!isDeleted && isMod}
                    canEdit={!isDeleted && canEdit}
                    isLoggedIn={!isDeleted && isLoggedIn}
                    viewerRole={viewerRole}
                    authorRole={comment.authorRole}
                    authorAddress={comment.authorAddress}
                    onEdit={handleEditOpen}
                    onDelete={(byModerator) => onDelete(comment.id, false, byModerator)}
                    onBan={setBanTarget}
                    onReport={() => setIsReportOpen(true)}
                    onCopyLink={() => copyCommentLink(comment.id)}
                  />
                </div>
              </div>
            </div>

            {isDeleted ? (
              <DeletedCommentPlaceholder className='mt-2 ml-[60px] text-base leading-7' />
            ) : (
              <CommentMarkdownPreview source={comment.contentMarkdown} className='mt-2 ml-[60px] text-xl leading-8' />
            )}

            {!isDeleted && (
              <div className='mt-4 flex items-center gap-2 border-border border-t pt-4'>
                <Button variant='ghost' size='sm' onClick={() => onReply(comment)}>
                  <ReplyIcon className='size-5' />
                  Reply
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={isUpvoting(comment.id)}
                  onClick={() => onUpvote(comment.id)}
                >
                  <Heart className='size-4' />
                  {comment.upvotes}
                </Button>
              </div>
            )}

            <CommentRepliesSection
              comment={comment}
              proposalId={proposalId}
              connectedAddress={connectedAddress}
              autoExpand={autoExpandReplies}
              anchor={anchor}
              highlightedCommentId={highlightedCommentId}
              upvotingCommentId={upvotingCommentId}
              onReply={onReply}
              onUpvote={onUpvote}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAnchorResolved={onAnchorResolved}
            />
          </CardContent>
        </Card>
      </div>

      <EditCommentForm
        open={isEditOpen}
        initialContent={comment.contentMarkdown}
        onOpenChange={setIsEditOpen}
        onSubmit={handleEditSubmit}
      />
      <BanAddressDialog open={!!banTarget} targetAddress={banTarget} onClose={() => setBanTarget(null)} />
      <DialogReportComment
        open={isReportOpen}
        proposalId={proposalId}
        commentId={comment.id}
        onOpenChange={setIsReportOpen}
      />
    </>
  );
}
