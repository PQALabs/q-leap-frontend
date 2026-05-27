'use client';

import MarkdownPreview from '@uiw/react-markdown-preview';
import { format } from 'date-fns';
import { Ban, Check, ExternalLink, Maximize2, ShieldAlert, Trash2, X } from 'lucide-react';
import type { IAuthUser } from '@/api/auth/types';
import type { CommentReportStatus, ICommentReportItem } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils';
import { commentReportMarkdownClass, truncateWords } from '../comment-report-markdown';

const STATUS_BADGE: Record<CommentReportStatus, { cls: string; label: string }> = {
  pending: { cls: 'bg-yellow-500/10 text-yellow-600', label: 'Pending' },
  reviewed: { cls: 'bg-green-500/10 text-green-600', label: 'Resolved' },
  rejected: { cls: 'bg-destructive/10 text-destructive', label: 'Rejected' },
};

function StatusBadge({ status }: { status: CommentReportStatus }) {
  const { cls, label } = STATUS_BADGE[status];
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span>;
}

type CommentReportListItemProps = {
  report: ICommentReportItem;
  displayIndex: number;
  currentUser: IAuthUser | null;
  onViewComment: (comment: ICommentReportItem['comment']) => void;
  onDelete: (report: ICommentReportItem) => void;
  onReject: (report: ICommentReportItem) => void;
  onResolve: (report: ICommentReportItem) => void;
};

export function CommentReportListItem({
  report,
  displayIndex,
  currentUser,
  onViewComment,
  onDelete,
  onReject,
  onResolve,
}: CommentReportListItemProps) {
  const isCommentDeleted = !!report.comment?.deletedAt;
  const ban = report.comment?.authorBan;
  const isAuthorBanned = !!ban && (ban.expiresAt === null || new Date(ban.expiresAt) > new Date());
  const isOwnComment =
    currentUser?.role === 'moderator' &&
    report.comment?.authorAddress?.toLowerCase() === currentUser.walletAddress?.toLowerCase();

  const canAct = report.status === 'pending' && !!currentUser && !isOwnComment;

  return (
    <div className='border-border border-b px-6 py-4 last:border-b-0'>
      <div className='mb-2 flex items-start justify-between gap-4'>
        <div className='flex flex-col gap-0.5'>
          <span className='text-muted-foreground text-xs'>
            #{displayIndex} · {format(new Date(report.reportedAt), 'dd/MM/yyyy HH:mm')}
          </span>
          <span className='text-muted-foreground text-xs'>
            Reporter: <span className='font-mono'>{formatAddress(report.reporterAddress)}</span>
          </span>
          <p className='mt-1 text-foreground text-sm'>
            <span className='font-medium'>Reason:</span> {report.reason}
          </p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      {report.comment && (
        <div
          className='group mt-2 cursor-pointer rounded-none border border-border bg-muted/30 px-4 py-3 hover:border-border/80 hover:bg-muted/50'
          onClick={() => onViewComment(report.comment)}
        >
          <div className='mb-1 flex items-center justify-between gap-2'>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
              <span className='text-muted-foreground text-xs'>
                By <span className='font-mono'>{formatAddress(report.comment.authorAddress)}</span>
              </span>
              {isCommentDeleted && <span className='text-destructive text-xs'>⚠ Comment deleted</span>}
              {isAuthorBanned && (
                <span className='flex items-center gap-1 text-destructive text-xs'>
                  <Ban className='size-3' />
                  {ban.expiresAt
                    ? `Banned until ${format(new Date(ban.expiresAt), 'dd/MM/yyyy HH:mm')}`
                    : 'Banned permanently'}
                </span>
              )}
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex items-center gap-1 text-muted-foreground text-xs opacity-0 transition-opacity group-hover:opacity-100'>
                <Maximize2 className='size-3' />
                View full
              </span>
              <a
                href={`/forum/${report.comment.proposalId}?commentId=${report.comment.id}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground'
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className='size-3' />
                View comment
              </a>
            </div>
          </div>
          <div className={`${commentReportMarkdownClass} pointer-events-none text-sm`} data-color-mode='dark'>
            <MarkdownPreview source={truncateWords(report.comment.contentMarkdown, 50)} />
          </div>
        </div>
      )}

      {canAct && (
        <div className='mt-3 flex items-center gap-2 border-border border-t pt-3'>
          {!isCommentDeleted && (
            <Button
              type='button'
              variant='outline'
              size='xs'
              className='h-7 rounded-none border-destructive/40 px-3 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive'
              onClick={() => onDelete(report)}
              icon={<Trash2 className='size-3.5' />}
            >
              Delete comment
            </Button>
          )}
          <Button
            type='button'
            variant='outline'
            size='xs'
            className='h-7 rounded-none px-3 text-xs'
            onClick={() => onReject(report)}
            icon={<X className='size-3.5' />}
          >
            Reject
          </Button>
          <Button
            type='button'
            variant='outline'
            size='xs'
            className='h-7 rounded-none border-green-600/40 px-3 text-green-600 text-xs hover:bg-green-600/10 hover:text-green-600'
            onClick={() => onResolve(report)}
            icon={<Check className='size-3.5' />}
          >
            Resolve
          </Button>
        </div>
      )}

      {!canAct && report.status === 'pending' && isOwnComment && (
        <div className='mt-3 flex items-center gap-1 border-border border-t pt-3 text-muted-foreground text-xs'>
          <ShieldAlert className='size-3.5' />
          Cannot act — this comment was written by you
        </div>
      )}
    </div>
  );
}
