'use client';

import MarkdownPreview from '@uiw/react-markdown-preview';
import {
  Ban,
  ChevronDown,
  ChevronUp,
  Flag,
  Link2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Shield,
  ShieldCheck,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { IForumComment, IForumCommentAnchor } from '@/api/forum';
import { useForumCommentReplies } from '@/api/forum';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, formatAddress } from '@/lib/utils';
import { DialogBanAddress } from '@/modules/moderation/components/DialogBanAddress';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { formatProposalDate, formatProposalDateFull } from '../utils';
import { DialogReportComment } from './DialogReportComment';
import { EditCommentForm } from './EditCommentForm';
import { UserAvatar } from './UserAvatar';

function DeletedCommentPlaceholder({ className }: { className?: string }) {
  return <p className={`text-muted-foreground/60 italic ${className ?? ''}`}>Comment deleted</p>;
}

function AuthorRoleBadge({ role }: { role?: 'user' | 'moderator' | 'admin' }) {
  if (role === 'admin') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <ShieldCheck className='inline-block size-3.5 shrink-0 text-primary' aria-label='Admin' />
          </TooltipTrigger>
          <TooltipContent>Admin</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (role === 'moderator') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Shield className='inline-block size-3.5 shrink-0 text-muted-foreground' aria-label='Moderator' />
          </TooltipTrigger>
          <TooltipContent>Moderator</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return null;
}

function PinnedCommentBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className='inline-flex cursor-default items-center gap-1 border border-primary/30 px-1.5 py-0.5 text-primary text-xs'>
            <Pin className='size-3' />
            Pinned
          </span>
        </TooltipTrigger>
        <TooltipContent>Pinned comment</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type PinCommentButtonProps = {
  pinned: boolean;
  isPinning?: boolean;
  onClick: () => void;
};

function PinCommentButton({ pinned, isPinning, onClick }: PinCommentButtonProps) {
  const label = pinned ? 'Unpin comment' : 'Pin comment';

  return (
    <button
      type='button'
      aria-label={isPinning ? 'Updating pin state' : label}
      title={isPinning ? 'Updating...' : label}
      className='inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-xs text-muted-foreground outline-none transition-all hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-default disabled:opacity-50'
      disabled={isPinning}
      onClick={onClick}
    >
      {pinned ? <PinOff className='size-4' /> : <Pin className='size-4' />}
    </button>
  );
}

const commentMarkdownPreviewClassName =
  '[&_.wmde-markdown]:!bg-transparent [&_.wmde-markdown]:!text-foreground [&_.wmde-markdown]:font-sans [&_.wmde-markdown_a]:!text-primary [&_.wmde-markdown_blockquote]:!border-border [&_.wmde-markdown_code]:!bg-muted [&_.wmde-markdown_h1]:!border-0 [&_.wmde-markdown_h1]:text-xl [&_.wmde-markdown_h2]:!border-0 [&_.wmde-markdown_h2]:text-lg [&_.wmde-markdown_h3]:text-base [&_.wmde-markdown_li]:my-1 [&_.wmde-markdown_p]:my-2 [&_.wmde-markdown_ul]:my-2';

const ANCHOR_SCROLL_OFFSET = 96;
const COMMENT_REPLIES_POLL_INTERVAL = 5_000;

function scrollToCommentElement(element: HTMLElement) {
  const top = element.getBoundingClientRect().top + window.scrollY - ANCHOR_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
}

function useCommentAnchorScroll({
  commentId,
  isTarget,
  onAnchorResolved,
}: {
  commentId: string;
  isTarget: boolean;
  onAnchorResolved?: (commentId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTarget) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (!ref.current) {
        return;
      }

      scrollToCommentElement(ref.current);
      onAnchorResolved?.(commentId);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [commentId, isTarget, onAnchorResolved]);

  return ref;
}

async function copyCommentLink(commentId: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('commentId', commentId);

  try {
    await navigator.clipboard.writeText(url.toString());
    toast.success('Comment link copied');
  } catch {
    toast.error('Failed to copy comment link');
  }
}

type CommentMarkdownPreviewProps = {
  source: string;
  className?: string;
};

function CommentMarkdownPreview({ source, className }: CommentMarkdownPreviewProps) {
  return (
    <div className={`${commentMarkdownPreviewClassName} ${className ?? ''}`} data-color-mode='dark'>
      <MarkdownPreview source={source} />
    </div>
  );
}

// ─── 3-dot actions menu ───────────────────────────────────────────────────────

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

function isWithinEditWindow(createdAt: string | Date): boolean {
  return Date.now() - new Date(createdAt).getTime() < EDIT_WINDOW_MS;
}

type CommentActionsMenuProps = {
  isOwner: boolean;
  isMod: boolean;
  canEdit: boolean;
  isLoggedIn: boolean;
  viewerRole?: 'user' | 'moderator' | 'admin';
  authorRole?: 'user' | 'moderator' | 'admin';
  authorAddress: string;
  connectedAddress?: string;
  onEdit: () => void;
  onDelete: (byModerator: boolean) => void;
  onBan: (address: string) => void;
  onReport: () => void;
  onCopyLink: () => void;
};

function canViewerBan(
  viewerRole: 'user' | 'moderator' | 'admin' | undefined,
  authorRole: 'user' | 'moderator' | 'admin' | undefined
): boolean {
  if (viewerRole === 'admin') return authorRole !== 'admin';
  if (viewerRole === 'moderator') return authorRole === 'user' || authorRole === undefined;
  return false;
}

function CommentActionsMenu({
  isOwner,
  isMod,
  canEdit,
  isLoggedIn,
  viewerRole,
  authorRole,
  authorAddress,
  onEdit,
  onDelete,
  onBan,
  onReport,
  onCopyLink,
}: CommentActionsMenuProps) {
  const canBan = isMod && !isOwner && canViewerBan(viewerRole, authorRole);
  const canReport = isLoggedIn && !isOwner;
  const hasProtectedActions = (isOwner && canEdit) || isOwner || isMod || canBan || canReport;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-7 shrink-0 text-muted-foreground hover:text-foreground'>
          <MoreHorizontal className='size-4' />
          <span className='sr-only'>More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onCopyLink}>
          <Link2 className='size-4' />
          Copy link
        </DropdownMenuItem>
        {hasProtectedActions && <DropdownMenuSeparator />}
        {isOwner && canEdit && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className='size-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {(isOwner || isMod) && (
          <DropdownMenuItem className='text-destructive focus:text-destructive' onClick={() => onDelete(!isOwner)}>
            <Trash2 className='size-4 text-destructive' />
            Delete
          </DropdownMenuItem>
        )}
        {canBan && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive focus:text-destructive' onClick={() => onBan(authorAddress)}>
              <Ban className='size-4 text-destructive' />
              Ban Address
            </DropdownMenuItem>
          </>
        )}
        {canReport && (
          <>
            {(isOwner || isMod) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={onReport}>
              <Flag className='size-4' />
              Report
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Nested reply row ─────────────────────────────────────────────────────────

type ReplyItemProps = {
  reply: IForumComment;
  depth: number;
  proposalId: string;
  connectedAddress?: string;
  anchor?: IForumCommentAnchor;
  highlightedCommentId?: string | null;
  onReply: (comment: IForumComment) => void;
  onUpdate: (commentId: string, content: string, isReply: boolean) => Promise<void>;
  onDelete: (commentId: string, isReply: boolean, byModerator: boolean) => void;
  onAnchorResolved?: (commentId: string) => void;
};

function ReplyItem({
  reply,
  depth,
  proposalId,
  connectedAddress,
  anchor,
  highlightedCommentId,
  onReply,
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
  }, [expanded, loadedReplyPages, replyPageToLoad, repliesQuery]);

  return (
    <div
      ref={anchorRef}
      data-comment-id={reply.id}
      className={cn(
        'flex gap-3 py-4 transition-colors duration-500',
        highlighted && 'bg-primary/10 ring-1 ring-primary/30'
      )}
    >
      <div className='mt-0.5 shrink-0'>
        <UserAvatar address={reply.authorAddress} className='size-7' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col flex-wrap gap-1 font-medium text-sm'>
            <span className='flex items-center gap-1.5 text-foreground'>
              {formatAddress(reply.authorAddress)}
              <AuthorRoleBadge role={reply.authorRole} />
            </span>
            <div className='flex flex-wrap items-center gap-2'>
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
                      <span className='cursor-default text-muted-foreground text-xs'>
                        (edited · {formatProposalDate(reply.updatedAt)})
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Last edited {formatProposalDateFull(reply.updatedAt)}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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
              connectedAddress={connectedAddress}
              onEdit={() => setIsEditOpen(true)}
              onDelete={(byModerator) => onDelete(reply.id, true, byModerator)}
              onBan={setBanTarget}
              onReport={() => setIsReportOpen(true)}
              onCopyLink={() => copyCommentLink(reply.id)}
            />
          </div>
        </div>

        {isDeleted ? (
          <DeletedCommentPlaceholder className='mt-2 text-sm leading-6' />
        ) : (
          <CommentMarkdownPreview source={reply.contentMarkdown} className='mt-2 text-sm leading-6' />
        )}

        <div className='mt-3 flex items-center gap-1'>
          {canReply && (
            <Button variant='ghost' size='sm' className='h-7 px-2 text-xs' onClick={() => onReply(reply)}>
              <MessageSquare className='size-3.5' />
              Reply
            </Button>
          )}

          {reply.replyCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-7 gap-1 px-2 text-muted-foreground text-xs hover:text-foreground'
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded ? <ChevronUp className='size-3.5' /> : <ChevronDown className='size-3.5' />}
              {expanded
                ? `${subReplies.length} ${subReplies.length === 1 ? 'reply' : 'replies'}`
                : `View ${reply.replyCount} ${reply.replyCount === 1 ? 'reply' : 'replies'}`}
            </Button>
          )}
        </div>

        {expanded && (
          <div className='mt-3 divide-y divide-border/60 border-border/70 border-l pl-4'>
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
                onReply={onReply}
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
        onSubmit={(content) => onUpdate(reply.id, content, true)}
      />
      <DialogBanAddress open={!!banTarget} targetAddress={banTarget} onClose={() => setBanTarget(null)} />
      <DialogReportComment
        open={isReportOpen}
        proposalId={proposalId}
        commentId={reply.id}
        onOpenChange={setIsReportOpen}
      />
    </div>
  );
}

// ─── Expandable replies section ───────────────────────────────────────────────

type CommentRepliesSectionProps = {
  comment: IForumComment;
  proposalId: string;
  connectedAddress?: string;
  autoExpand?: boolean;
  anchor?: IForumCommentAnchor;
  highlightedCommentId?: string | null;
  onReply: (comment: IForumComment) => void;
  onUpdate: (commentId: string, content: string, isReply: boolean) => Promise<void>;
  onDelete: (commentId: string, isReply: boolean, byModerator: boolean) => void;
  onAnchorResolved?: (commentId: string) => void;
};

function CommentRepliesSection({
  comment,
  proposalId,
  connectedAddress,
  autoExpand,
  anchor,
  highlightedCommentId,
  onReply,
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
  }, [expanded, loadedReplyPages, replyPageToLoad, repliesQuery]);

  if (comment.replyCount === 0) {
    return null;
  }

  return (
    <div className='mt-4 border-border border-t pt-3'>
      <Button
        variant='ghost'
        size='sm'
        className='h-7 gap-1 px-2 text-muted-foreground text-xs hover:text-foreground'
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? <ChevronUp className='size-3.5' /> : <ChevronDown className='size-3.5' />}
        {expanded
          ? `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`
          : `View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
      </Button>

      {expanded && (
        <div className='mt-1 divide-y divide-border/60 pl-2'>
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
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAnchorResolved={onAnchorResolved}
            />
          ))}
          {repliesQuery.hasNextPage && !repliesQuery.isFetchingNextPage && (
            <Button
              variant='ghost'
              size='sm'
              className='mt-1 h-7 px-2 text-xs'
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

// ─── Top-level comment card ───────────────────────────────────────────────────

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

  return (
    <>
      <div ref={anchorRef} data-comment-id={comment.id}>
        <Card
          className={cn(
            'rounded-none border-border bg-card py-0 shadow-none transition-colors duration-500',
            highlighted && 'bg-primary/10 ring-1 ring-primary/30'
          )}
        >
          <CardContent className='p-6 md:p-8'>
            <div className='flex w-full items-start gap-3'>
              <UserAvatar address={comment.authorAddress} />
              <div className='flex min-w-0 flex-1 items-start justify-between gap-2'>
                <div className='flex flex-col gap-1 text-sm'>
                  <span className='flex items-center gap-1.5 font-medium text-foreground'>
                    {formatAddress(comment.authorAddress)}
                    <AuthorRoleBadge role={comment.authorRole} />
                    {comment.pinned && <PinnedCommentBadge />}
                  </span>
                  <div className='flex flex-wrap items-center gap-2'>
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
                            <span className='cursor-default text-muted-foreground text-xs'>
                              (edited · {formatProposalDate(comment.updatedAt)})
                            </span>
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
                    connectedAddress={connectedAddress}
                    onEdit={() => setIsEditOpen(true)}
                    onDelete={(byModerator) => onDelete(comment.id, false, byModerator)}
                    onBan={setBanTarget}
                    onReport={() => setIsReportOpen(true)}
                    onCopyLink={() => copyCommentLink(comment.id)}
                  />
                </div>
              </div>
            </div>

            {isDeleted ? (
              <DeletedCommentPlaceholder className='mt-6 text-base leading-7' />
            ) : (
              <CommentMarkdownPreview source={comment.contentMarkdown} className='mt-6 text-base leading-7' />
            )}

            {!isDeleted && (
              <div className='mt-6 flex items-center gap-2 border-border border-t pt-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  disabled={isUpvoting(comment.id)}
                  onClick={() => onUpvote(comment.id)}
                >
                  <ThumbsUp className='size-4' />
                  {comment.upvotes}
                </Button>
                <Button variant='ghost' size='sm' onClick={() => onReply(comment)}>
                  <MessageSquare className='size-4' />
                  Reply
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
              onReply={onReply}
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
        onSubmit={(content) => onUpdate(comment.id, content, false)}
      />
      <DialogBanAddress open={!!banTarget} targetAddress={banTarget} onClose={() => setBanTarget(null)} />
      <DialogReportComment
        open={isReportOpen}
        proposalId={proposalId}
        commentId={comment.id}
        onOpenChange={setIsReportOpen}
      />
    </>
  );
}
