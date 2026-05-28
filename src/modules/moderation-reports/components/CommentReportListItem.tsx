'use client';

import MarkdownPreview from '@uiw/react-markdown-preview';
import { format } from 'date-fns';
import { Ban, Check, ExternalLink, Maximize2, ShieldAlert, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { IAuthUser } from '@/api/auth/types';
import type { CommentReportStatus, IBannedAddress, ICommentReportItem } from '@/api/moderation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatAddress } from '@/lib/utils';
import { BanAddressDialog } from '@/modules/moderation-banned/components/BanAddressDialog';
import { UnbanAddressDialog } from '@/modules/moderation-banned/components/UnbanAddressDialog';
import { commentReportMarkdownClass, truncateWords } from './comment-report-markdown';

const STATUS_BADGE: Record<CommentReportStatus, { cls: string; label: string }> = {
  pending: { cls: 'bg-yellow-500/10 text-yellow-600', label: 'Pending' },
  reviewed: { cls: 'bg-green-500/10 text-green-600', label: 'Resolved' },
  rejected: { cls: 'bg-destructive/10 text-destructive', label: 'Rejected' },
};

const STATUS_ACCENT: Record<CommentReportStatus, string> = {
  pending: 'bg-yellow-500',
  reviewed: 'bg-green-600',
  rejected: 'bg-destructive',
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
  const [banTarget, setBanTarget] = useState<string | null>(null);
  const [unbanTarget, setUnbanTarget] = useState<IBannedAddress | null>(null);

  const isCommentDeleted = !!report.comment?.deletedAt;
  const ban = report.comment?.authorBan;
  const isAuthorBanned = !!ban && (ban.expiresAt === null || new Date(ban.expiresAt) > new Date());
  const isOwnComment =
    currentUser?.role === 'moderator' &&
    report.comment?.authorAddress?.toLowerCase() === currentUser.walletAddress?.toLowerCase();

  const canAct = report.status === 'pending' && !!currentUser && !isOwnComment;

  return (
    <div className='mb-3 flex overflow-hidden rounded-sm border border-border bg-card last:mb-0'>
      {/* Left status accent strip */}
      <div className={`w-1 shrink-0 ${STATUS_ACCENT[report.status]}`} />

      <div className='flex-1 px-4 py-3'>
        {/* Header row */}
        <div className='mb-1.5 flex items-center justify-between gap-2'>
          <span className='text-muted-foreground text-xs'>
            #{displayIndex} · {format(new Date(report.reportedAt), 'dd/MM/yyyy HH:mm')}
          </span>
          <StatusBadge status={report.status} />
        </div>

        {/* Metadata row */}
        <div className='mb-2 text-muted-foreground text-xs'>
          Reporter: <span className='font-mono'>{formatAddress(report.reporterAddress)}</span>
        </div>

        <Alert variant='warning' className='mb-3 py-2 text-xs'>
          <ShieldAlert className='size-3.5' />
          <AlertDescription className='text-xs'>
            <span className='font-medium'>Reason:</span> {report.reason}
          </AlertDescription>
        </Alert>

        {/* Comment preview */}
        {report.comment && (
          <div
            className='group cursor-pointer rounded-none border border-border bg-muted/30 px-4 py-3 hover:border-border/80 hover:bg-muted/50'
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
                <Link
                  href={`/forum/${report.comment.proposalId}?commentId=${report.comment.id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground'
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className='size-3' />
                  View comment
                </Link>
              </div>
            </div>
            <div className={`${commentReportMarkdownClass} pointer-events-none text-sm`} data-color-mode='dark'>
              <MarkdownPreview source={truncateWords(report.comment.contentMarkdown, 50)} />
            </div>
          </div>
        )}

        {/* Footer */}
        {canAct && (
          <div className='mt-3 flex flex-wrap items-center justify-end gap-2 border-border border-t pt-3'>
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
            {report.comment?.authorAddress &&
              (isAuthorBanned ? (
                <Button
                  type='button'
                  variant='outline'
                  size='xs'
                  className='h-7 rounded-none px-3 text-xs'
                  onClick={() => setUnbanTarget(ban!)}
                  icon={<Ban className='size-3.5' />}
                >
                  Unban address
                </Button>
              ) : (
                <Button
                  type='button'
                  variant='outline'
                  size='xs'
                  className='h-7 rounded-none border-destructive/40 px-3 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive'
                  onClick={() => setBanTarget(report.comment!.authorAddress)}
                  icon={<Ban className='size-3.5' />}
                >
                  Ban address
                </Button>
              ))}
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

      <BanAddressDialog open={!!banTarget} targetAddress={banTarget} onClose={() => setBanTarget(null)} />
      <UnbanAddressDialog entry={unbanTarget} onClose={() => setUnbanTarget(null)} />
    </div>
  );
}
