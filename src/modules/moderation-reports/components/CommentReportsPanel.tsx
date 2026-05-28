'use client';

import { useEffect, useState } from 'react';
import type { ICommentReportItem, ICommentReportListParams } from '@/api/moderation';
import { useCommentReports } from '@/api/moderation';
import { ModerationPaginationFooter } from '@/modules/moderation/components/ModerationPaginationFooter';
import { getPaginatedPanelState } from '@/modules/moderation/utils/pagination';
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
  const pagination = getPaginatedPanelState({
    items: data?.data ?? [],
    meta: data?.meta,
    page,
    limit,
  });
  const items = pagination.items;

  useEffect(() => {
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  return (
    <>
      <div>
        <div className='flex items-center justify-between border border-border bg-card px-6 py-4'>
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

        {!isLoading && items.length > 0 && (
          <div className='pt-4'>
            {items.map((report: ICommentReportItem, index) => (
              <CommentReportListItem
                key={report.id}
                report={report}
                displayIndex={(pagination.currentPage - 1) * limit + index + 1}
                currentUser={currentUser}
                onViewComment={setFullViewComment}
                onDelete={setPendingDelete}
                onReject={setPendingReject}
                onResolve={setPendingResolve}
              />
            ))}
          </div>
        )}

        {!isLoading && (
          <ModerationPaginationFooter
            page={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDeleteCommentDialog report={pendingDelete} onClose={() => setPendingDelete(null)} />
      <ConfirmResolveReportDialog report={pendingResolve} onClose={() => setPendingResolve(null)} />
      <ConfirmRejectReportDialog report={pendingReject} onClose={() => setPendingReject(null)} />
      <CommentFullDialog comment={fullViewComment} onClose={() => setFullViewComment(null)} />
    </>
  );
}
