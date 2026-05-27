'use client';

import { useState } from 'react';
import type { ICommentReportItem, ICommentReportListParams } from '@/api/moderation';
import { useCommentReports } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { CommentFullDialog } from './CommentFullDialog';
import { CommentReportListItem } from './CommentReportListItem';
import { CommentReportRowSkeleton } from './CommentReportRowSkeleton';
import { CommentReportStatusFilter } from './CommentReportStatusFilter';
import { ConfirmDeleteCommentDialog } from './ConfirmDeleteCommentDialog';
import { ConfirmRejectReportDialog } from './ConfirmRejectReportDialog';
import { ConfirmResolveReportDialog } from './ConfirmResolveReportDialog';

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
          <CommentReportStatusFilter
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          />
        </div>

        {isLoading && (
          <>
            <CommentReportRowSkeleton />
            <CommentReportRowSkeleton />
            <CommentReportRowSkeleton />
          </>
        )}

        {!isLoading && items.length === 0 && (
          <p className='px-6 py-8 text-center text-muted-foreground text-sm'>No reports found.</p>
        )}

        {!isLoading &&
          items.map((report: ICommentReportItem, index) => (
            <CommentReportListItem
              key={report.id}
              report={report}
              displayIndex={(page - 1) * limit + index + 1}
              currentUser={currentUser}
              onViewComment={setFullViewComment}
              onDelete={setPendingDelete}
              onReject={setPendingReject}
              onResolve={setPendingResolve}
            />
          ))}

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

      <ConfirmDeleteCommentDialog report={pendingDelete} onClose={() => setPendingDelete(null)} />
      <ConfirmResolveReportDialog report={pendingResolve} onClose={() => setPendingResolve(null)} />
      <ConfirmRejectReportDialog report={pendingReject} onClose={() => setPendingReject(null)} />
      <CommentFullDialog comment={fullViewComment} onClose={() => setFullViewComment(null)} />
    </>
  );
}
