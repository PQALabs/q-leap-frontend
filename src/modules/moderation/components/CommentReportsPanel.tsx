'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { format } from 'date-fns';
import { Ban, Check, ExternalLink, Loader2, Maximize2, ShieldAlert, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSignMessage } from 'wagmi';
import { deleteForumCommentRequest } from '@/api/forum';
import type { CommentReportStatus, ICommentReportItem, ICommentReportListParams } from '@/api/moderation';
import { rejectCommentReportRequest, resolveCommentReportRequest, useCommentReports } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { queryKeys } from '@/constants/query-keys';
import { getEvmMessage } from '@/lib/get-evm-message';
import { formatAddress } from '@/lib/utils';
import { buildDeleteCommentSignatureMessage } from '@/modules/forum-proposal-detail/comment-signatures';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';

// ─── Markdown helpers ─────────────────────────────────────────────────────────

const mdPreviewCls =
  '[&_.wmde-markdown]:!bg-transparent [&_.wmde-markdown]:!text-foreground [&_.wmde-markdown]:font-sans [&_.wmde-markdown_a]:!text-primary [&_.wmde-markdown_blockquote]:!border-border [&_.wmde-markdown_code]:!bg-muted [&_.wmde-markdown_h1]:!border-0 [&_.wmde-markdown_h1]:text-xl [&_.wmde-markdown_h2]:!border-0 [&_.wmde-markdown_h2]:text-lg [&_.wmde-markdown_h3]:text-base [&_.wmde-markdown_li]:my-1 [&_.wmde-markdown_p]:my-2 [&_.wmde-markdown_ul]:my-2';

function truncateWords(text: string, limit: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '…';
}

// ─── Full comment dialog ──────────────────────────────────────────────────────

type CommentFullDialogProps = {
  comment: ICommentReportItem['comment'] | null;
  onClose: () => void;
};

function CommentFullDialog({ comment, onClose }: CommentFullDialogProps) {
  return (
    <Dialog open={!!comment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-2xl'>
        <DialogHeader className='border-border border-b px-6 py-4 text-left'>
          <DialogTitle className='font-medium text-foreground text-sm'>Full comment</DialogTitle>
        </DialogHeader>
        <div className={`${mdPreviewCls} max-h-[60vh] min-h-50 overflow-y-auto px-6 py-4`} data-color-mode='dark'>
          <MarkdownPreview source={comment?.contentMarkdown ?? ''} />
        </div>
        <div className='border-border border-t px-6 py-3'>
          <DialogClose asChild>
            <Button type='button' variant='outline' size='xs' className='h-7 rounded-none px-4'>
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete hook + dialog ─────────────────────────────────────────────────────

function useModeratorDeleteComment() {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const requireSignature = useForumAuthStore((s) => s.user?.requireSignature ?? false);

  return useMutation({
    mutationFn: async ({ proposalId, commentId }: { proposalId: string; commentId: string }) => {
      let signature: string | undefined;
      let payload: { signatureTimestamp: number } | undefined;

      if (requireSignature) {
        const signatureTimestamp = Date.now();
        const message = buildDeleteCommentSignatureMessage({ proposalId, commentId, signatureTimestamp });
        signature = await signMessageAsync({ message });
        payload = { signatureTimestamp };
      }

      return deleteForumCommentRequest({ proposalId, commentId, payload, signature });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.commentReports() });
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.comments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.forum.commentReplies() });
    },
  });
}

type ConfirmDeleteDialogProps = {
  report: ICommentReportItem | null;
  onClose: () => void;
};

function ConfirmDeleteDialog({ report, onClose }: ConfirmDeleteDialogProps) {
  const { mutateAsync, isPending } = useModeratorDeleteComment();

  const handleConfirm = async () => {
    if (!report?.comment) return;
    try {
      await mutateAsync({ proposalId: report.comment.proposalId, commentId: report.comment.id });
      toast.success('Comment deleted');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : getEvmMessage(err);
      toast.error('Failed to delete comment', { description: message });
    }
  };

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-sm'>
        <DialogHeader className='px-6 pt-6 pb-4 text-left'>
          <DialogTitle className='font-medium text-foreground'>Delete comment?</DialogTitle>
        </DialogHeader>
        <p className='px-6 pb-4 text-muted-foreground text-sm'>
          You are removing this comment as a moderator. This action cannot be undone.
        </p>
        <DialogFooter className='gap-2 border-border border-t px-6 py-4 sm:justify-start'>
          <Button
            type='button'
            variant='destructive'
            size='xs'
            className='h-7 rounded-none px-4'
            disabled={isPending}
            onClick={handleConfirm}
            icon={isPending ? <Loader2 className='animate-spin' /> : <Trash2 />}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </Button>
          <DialogClose asChild>
            <Button type='button' variant='ghost' size='xs' className='h-7 rounded-none px-2' disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Resolve hook + dialog ────────────────────────────────────────────────────

function useResolveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: number) => resolveCommentReportRequest(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.commentReports() });
    },
  });
}

type ConfirmResolveDialogProps = {
  report: ICommentReportItem | null;
  onClose: () => void;
};

function ConfirmResolveDialog({ report, onClose }: ConfirmResolveDialogProps) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useResolveReport();

  const handleConfirm = async () => {
    if (!report) return;
    try {
      await mutateAsync(report.id);
      toast.success('Report resolved');
      onClose();
    } catch (err: any) {
      if (err?.code === 400 || err?.statusCode === 400) {
        toast.info('Report already handled — refreshing list');
        queryClient.invalidateQueries({ queryKey: queryKeys.moderation.commentReports() });
        onClose();
        return;
      }
      const message = err?.message ?? (err instanceof Error ? err.message : getEvmMessage(err));
      toast.error('Failed to resolve report', { description: message });
    }
  };

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-sm'>
        <DialogHeader className='px-6 pt-6 pb-4 text-left'>
          <DialogTitle className='flex items-center gap-2 font-medium text-foreground'>
            <Check className='size-4 text-muted-foreground' />
            Resolve report?
          </DialogTitle>
        </DialogHeader>
        <p className='px-6 pb-4 text-muted-foreground text-sm'>
          Mark this report as resolved. Use this after taking action (deleting the comment, banning the author, etc.).
        </p>
        <DialogFooter className='gap-2 border-border border-t px-6 py-4 sm:justify-start'>
          <Button
            type='button'
            variant='outline'
            size='xs'
            className='h-7 rounded-none px-4'
            disabled={isPending}
            onClick={handleConfirm}
            icon={isPending ? <Loader2 className='animate-spin' /> : <Check className='size-3.5' />}
          >
            {isPending ? 'Resolving…' : 'Resolve'}
          </Button>
          <DialogClose asChild>
            <Button type='button' variant='ghost' size='xs' className='h-7 rounded-none px-2' disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reject hook + dialog ─────────────────────────────────────────────────────

function useRejectReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: number) => rejectCommentReportRequest(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.moderation.commentReports() });
    },
  });
}

type ConfirmRejectDialogProps = {
  report: ICommentReportItem | null;
  onClose: () => void;
};

function ConfirmRejectDialog({ report, onClose }: ConfirmRejectDialogProps) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useRejectReport();

  const handleConfirm = async () => {
    if (!report) return;
    try {
      await mutateAsync(report.id);
      toast.success('Report rejected');
      onClose();
    } catch (err: any) {
      if (err?.code === 400 || err?.statusCode === 400) {
        toast.info('Report already handled — refreshing list');
        queryClient.invalidateQueries({ queryKey: queryKeys.moderation.commentReports() });
        onClose();
        return;
      }
      const message = err?.message ?? (err instanceof Error ? err.message : getEvmMessage(err));
      toast.error('Failed to reject report', { description: message });
    }
  };

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-sm'>
        <DialogHeader className='px-6 pt-6 pb-4 text-left'>
          <DialogTitle className='flex items-center gap-2 font-medium text-foreground'>
            <X className='size-4 text-muted-foreground' />
            Reject report?
          </DialogTitle>
        </DialogHeader>
        <p className='px-6 pb-4 text-muted-foreground text-sm'>
          This report will be marked as rejected — no further action will be taken.
        </p>
        <DialogFooter className='gap-2 border-border border-t px-6 py-4 sm:justify-start'>
          <Button
            type='button'
            variant='outline'
            size='xs'
            className='h-7 rounded-none px-4'
            disabled={isPending}
            onClick={handleConfirm}
            icon={isPending ? <Loader2 className='animate-spin' /> : <X className='size-3.5' />}
          >
            {isPending ? 'Rejecting…' : 'Reject'}
          </Button>
          <DialogClose asChild>
            <Button type='button' variant='ghost' size='xs' className='h-7 rounded-none px-2' disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ReportRowSkeleton() {
  return (
    <div className='space-y-2 border-border border-b px-6 py-4'>
      <Skeleton className='h-4 w-48' />
      <Skeleton className='h-3 w-64' />
      <Skeleton className='h-16 w-full' />
      <Skeleton className='h-7 w-32' />
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<CommentReportStatus, { cls: string; label: string }> = {
  pending: { cls: 'bg-yellow-500/10 text-yellow-600', label: 'Pending' },
  reviewed: { cls: 'bg-green-500/10 text-green-600', label: 'Resolved' },
  rejected: { cls: 'bg-destructive/10 text-destructive', label: 'Rejected' },
};

function StatusBadge({ status }: { status: CommentReportStatus }) {
  const { cls, label } = STATUS_BADGE[status];
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span>;
}

// ─── Status filter ────────────────────────────────────────────────────────────

type StatusFilterProps = {
  value: ICommentReportListParams['status'];
  onChange: (v: ICommentReportListParams['status']) => void;
};

function StatusFilter({ value, onChange }: StatusFilterProps) {
  const options: { label: string; value: ICommentReportListParams['status'] }[] = [
    { label: 'All', value: undefined },
    { label: 'Pending', value: 'pending' },
    { label: 'Resolved', value: 'reviewed' },
    { label: 'Rejected', value: 'rejected' },
  ];

  return (
    <div className='flex gap-1'>
      {options.map((opt) => (
        <Button
          key={String(opt.value)}
          type='button'
          variant={value === opt.value ? 'default' : 'outline'}
          size='xs'
          className='h-7 rounded-none px-3 text-xs'
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function CommentReportsPanel() {
  const [status, setStatus] = useState<ICommentReportListParams['status']>('pending');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ICommentReportItem | null>(null);
  const [pendingResolve, setPendingResolve] = useState<ICommentReportItem | null>(null);
  const [pendingReject, setPendingReject] = useState<ICommentReportItem | null>(null);
  const [fullViewComment, setFullViewComment] = useState<ICommentReportItem['comment'] | null>(null);
  const limit = 20;

  const currentUser = useForumAuthStore((s) => s.user);

  const { data, isLoading } = useCommentReports({ status, page, limit });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;

  return (
    <>
      <div className='border border-border bg-card'>
        <div className='flex items-center justify-between border-border border-b px-6 py-4'>
          <h2 className='font-semibold text-foreground text-sm'>Comment Reports</h2>
          <StatusFilter
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />
        </div>

        {isLoading && (
          <>
            <ReportRowSkeleton />
            <ReportRowSkeleton />
            <ReportRowSkeleton />
          </>
        )}

        {!isLoading && items.length === 0 && (
          <p className='px-6 py-8 text-center text-muted-foreground text-sm'>No reports found.</p>
        )}

        {!isLoading &&
          items.map((report: ICommentReportItem) => {
            const isCommentDeleted = !!report.comment?.deletedAt;
            const ban = report.comment?.authorBan;
            const isAuthorBanned = !!ban && (ban.expiresAt === null || new Date(ban.expiresAt) > new Date());

            const canAct =
              report.status === 'pending' &&
              !!currentUser &&
              !(
                currentUser.role === 'moderator' &&
                report.comment?.authorAddress?.toLowerCase() === currentUser.walletAddress?.toLowerCase()
              );

            return (
              <div key={report.id} className='border-border border-b px-6 py-4 last:border-b-0'>
                {/* Report metadata */}
                <div className='mb-2 flex items-start justify-between gap-4'>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-muted-foreground text-xs'>
                      #{report.id} · {format(new Date(report.reportedAt), 'dd/MM/yyyy HH:mm')}
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

                {/* Comment preview */}
                {report.comment && (
                  <div
                    className='group mt-2 cursor-pointer rounded-none border border-border bg-muted/30 px-4 py-3 hover:border-border/80 hover:bg-muted/50'
                    onClick={() => setFullViewComment(report.comment)}
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
                            {ban!.expiresAt
                              ? `Banned until ${format(new Date(ban!.expiresAt), 'dd/MM/yyyy HH:mm')}`
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
                          href={`/forum/${report.comment.proposalId}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground'
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className='size-3' />
                          View proposal
                        </a>
                      </div>
                    </div>
                    <div className={`${mdPreviewCls} pointer-events-none text-sm`} data-color-mode='dark'>
                      <MarkdownPreview source={truncateWords(report.comment.contentMarkdown, 50)} />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {canAct && (
                  <div className='mt-3 flex items-center gap-2 border-border border-t pt-3'>
                    {!isCommentDeleted && (
                      <Button
                        type='button'
                        variant='outline'
                        size='xs'
                        className='h-7 rounded-none border-destructive/40 px-3 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive'
                        onClick={() => setPendingDelete(report)}
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
                      onClick={() => setPendingReject(report)}
                      icon={<X className='size-3.5' />}
                    >
                      Reject
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='xs'
                      className='h-7 rounded-none border-green-600/40 px-3 text-green-600 text-xs hover:bg-green-600/10 hover:text-green-600'
                      onClick={() => setPendingResolve(report)}
                      icon={<Check className='size-3.5' />}
                    >
                      Resolve
                    </Button>
                    {currentUser?.role === 'moderator' &&
                      report.comment?.authorAddress?.toLowerCase() === currentUser.walletAddress?.toLowerCase() && (
                        <span className='flex items-center gap-1 text-muted-foreground text-xs'>
                          <ShieldAlert className='size-3.5' />
                          Cannot act on own comment
                        </span>
                      )}
                  </div>
                )}

                {/* Moderator conflict hint — shown when canAct is false due to own comment */}
                {!canAct &&
                  report.status === 'pending' &&
                  currentUser?.role === 'moderator' &&
                  report.comment?.authorAddress?.toLowerCase() === currentUser.walletAddress?.toLowerCase() && (
                    <div className='mt-3 flex items-center gap-1 border-border border-t pt-3 text-muted-foreground text-xs'>
                      <ShieldAlert className='size-3.5' />
                      Cannot act — this comment was written by you
                    </div>
                  )}
              </div>
            );
          })}

        {totalPages > 1 && (
          <div className='flex items-center justify-between border-border border-t px-6 py-3'>
            <span className='text-muted-foreground text-xs'>
              Page {meta?.currentPage ?? page} of {totalPages} · {meta?.totalItems ?? 0} total
            </span>
            <div className='flex gap-1'>
              <Button
                type='button'
                variant='outline'
                size='xs'
                className='h-7 rounded-none px-3 text-xs'
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                type='button'
                variant='outline'
                size='xs'
                className='h-7 rounded-none px-3 text-xs'
                disabled={page >= (meta?.totalPages ?? 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog report={pendingDelete} onClose={() => setPendingDelete(null)} />
      <ConfirmResolveDialog report={pendingResolve} onClose={() => setPendingResolve(null)} />
      <ConfirmRejectDialog report={pendingReject} onClose={() => setPendingReject(null)} />
      <CommentFullDialog comment={fullViewComment} onClose={() => setFullViewComment(null)} />
    </>
  );
}
