'use client';

import MarkdownPreview from '@uiw/react-markdown-preview';
import { ChevronDown, ChevronUp, MessageSquare, MoreHorizontal, Pencil, ThumbsUp, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { IForumComment } from '@/api/forum';
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
import { formatAddress } from '@/lib/utils';
import { formatProposalDate, formatProposalDateFull } from '../utils';
import { EditCommentForm } from './EditCommentForm';
import { UserAvatar } from './UserAvatar';

function DeletedCommentPlaceholder({ className }: { className?: string }) {
  return <p className={`text-muted-foreground/60 italic ${className ?? ''}`}>Comment deleted</p>;
}

const commentMarkdownPreviewClassName =
  '[&_.wmde-markdown]:!bg-transparent [&_.wmde-markdown]:!text-foreground [&_.wmde-markdown]:font-sans [&_.wmde-markdown_a]:!text-primary [&_.wmde-markdown_blockquote]:!border-border [&_.wmde-markdown_code]:!bg-muted [&_.wmde-markdown_h1]:!border-0 [&_.wmde-markdown_h1]:text-xl [&_.wmde-markdown_h2]:!border-0 [&_.wmde-markdown_h2]:text-lg [&_.wmde-markdown_h3]:text-base [&_.wmde-markdown_li]:my-1 [&_.wmde-markdown_p]:my-2 [&_.wmde-markdown_ul]:my-2';

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
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function CommentActionsMenu({ isOwner, canEdit, onEdit, onDelete }: CommentActionsMenuProps) {
  if (!isOwner) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='size-7 shrink-0 text-muted-foreground hover:text-foreground'>
          <MoreHorizontal className='size-4' />
          <span className='sr-only'>More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {canEdit && (
          <>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className='size-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem className='text-destructive focus:text-destructive' onClick={onDelete}>
          <Trash2 className='size-4' />
          Delete
        </DropdownMenuItem>
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
  onReply: (comment: IForumComment) => void;
  onUpdate: (commentId: string, content: string, isReply: boolean) => Promise<void>;
  onDelete: (commentId: string, isReply: boolean) => void;
};

function ReplyItem({ reply, depth, proposalId, connectedAddress, onReply, onUpdate, onDelete }: ReplyItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const repliesQuery = useForumCommentReplies({
    variables: { proposalId, commentId: reply.id },
    enabled: expanded && reply.replyCount > 0,
  });

  const subReplies = repliesQuery.data?.pages.flatMap((p) => p.data) ?? [];
  const isDeleted = !!reply.deletedAt;
  const canReply = depth < 2;
  const isOwner = !!connectedAddress && connectedAddress.toLowerCase() === reply.authorAddress.toLowerCase();
  const canEdit = isOwner && isWithinEditWindow(reply.createdAt);

  return (
    <div className='flex gap-3 py-4'>
      <div className='mt-0.5 shrink-0'>
        <UserAvatar address={reply.authorAddress} className='size-7' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-col flex-wrap gap-1 font-medium text-sm'>
            <span className='text-foreground'>{formatAddress(reply.authorAddress)}</span>
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
          {!isDeleted && (
            <CommentActionsMenu
              isOwner={isOwner}
              canEdit={canEdit}
              onEdit={() => setIsEditOpen(true)}
              onDelete={() => onDelete(reply.id, true)}
            />
          )}
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
                onReply={onReply}
                onUpdate={onUpdate}
                onDelete={onDelete}
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
    </div>
  );
}

// ─── Expandable replies section ───────────────────────────────────────────────

type CommentRepliesSectionProps = {
  comment: IForumComment;
  proposalId: string;
  connectedAddress?: string;
  autoExpand?: boolean;
  onReply: (comment: IForumComment) => void;
  onUpdate: (commentId: string, content: string, isReply: boolean) => Promise<void>;
  onDelete: (commentId: string, isReply: boolean) => void;
};

function CommentRepliesSection({
  comment,
  proposalId,
  connectedAddress,
  autoExpand,
  onReply,
  onUpdate,
  onDelete,
}: CommentRepliesSectionProps) {
  const [expanded, setExpanded] = useState(false);

  const repliesQuery = useForumCommentReplies({
    variables: { proposalId, commentId: comment.id },
    enabled: expanded,
  });

  const replies = repliesQuery.data?.pages.flatMap((p) => p.data) ?? [];

  useEffect(() => {
    if (autoExpand) {
      setExpanded(true);
    }
  }, [autoExpand]);

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
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
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
  upvotingCommentId?: string | null;
  onReply: (comment: IForumComment) => void;
  onUpvote: (commentId: string) => void;
  onUpdate: (commentId: string, content: string, isReply: boolean) => Promise<void>;
  onDelete: (commentId: string, isReply: boolean) => void;
};

export function ReplyCard({
  comment,
  proposalId,
  connectedAddress,
  autoExpandReplies,
  upvotingCommentId,
  onReply,
  onUpvote,
  onUpdate,
  onDelete,
}: ReplyCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isDeleted = !!comment.deletedAt;
  const isUpvoting = (id: string) => upvotingCommentId === id;
  const isOwner = !!connectedAddress && connectedAddress.toLowerCase() === comment.authorAddress.toLowerCase();
  const canEdit = isOwner && isWithinEditWindow(comment.createdAt);

  return (
    <>
      <Card className='rounded-none border-border bg-card py-0 shadow-none'>
        <CardContent className='p-6 md:p-8'>
          <div className='flex w-full items-start gap-3'>
            <UserAvatar address={comment.authorAddress} />
            <div className='flex min-w-0 flex-1 items-start justify-between gap-2'>
              <div className='flex flex-col gap-1 text-sm'>
                <span className='font-medium text-foreground'>{formatAddress(comment.authorAddress)}</span>
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
              {!isDeleted && (
                <CommentActionsMenu
                  isOwner={isOwner}
                  canEdit={canEdit}
                  onEdit={() => setIsEditOpen(true)}
                  onDelete={() => onDelete(comment.id, false)}
                />
              )}
            </div>
          </div>

          {isDeleted ? (
            <DeletedCommentPlaceholder className='mt-6 text-base leading-7' />
          ) : (
            <CommentMarkdownPreview source={comment.contentMarkdown} className='mt-6 text-base leading-7' />
          )}

          {!isDeleted && (
            <div className='mt-6 flex items-center gap-2 border-border border-t pt-4'>
              <Button variant='ghost' size='sm' disabled={isUpvoting(comment.id)} onClick={() => onUpvote(comment.id)}>
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
            onReply={onReply}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>

      <EditCommentForm
        open={isEditOpen}
        initialContent={comment.contentMarkdown}
        onOpenChange={setIsEditOpen}
        onSubmit={(content) => onUpdate(comment.id, content, false)}
      />
    </>
  );
}
