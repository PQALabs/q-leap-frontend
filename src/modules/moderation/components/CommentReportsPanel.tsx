'use client';

import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { ICommentReportItem, ICommentReportListParams } from '@/api/moderation';
import { useCommentReports } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatAddress } from '@/lib/utils';

function ReportRowSkeleton() {
  return (
    <div className='space-y-2 border-border border-b px-6 py-4'>
      <Skeleton className='h-4 w-48' />
      <Skeleton className='h-3 w-64' />
      <Skeleton className='h-10 w-full' />
    </div>
  );
}

type StatusFilterProps = {
  value: ICommentReportListParams['status'];
  onChange: (v: ICommentReportListParams['status']) => void;
};

function StatusFilter({ value, onChange }: StatusFilterProps) {
  const options: { label: string; value: ICommentReportListParams['status'] }[] = [
    { label: 'All', value: undefined },
    { label: 'Pending', value: 'pending' },
    { label: 'Reviewed', value: 'reviewed' },
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

export function CommentReportsPanel() {
  const [status, setStatus] = useState<ICommentReportListParams['status']>('pending');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useCommentReports({ status, page, limit });

  const items = data?.data ?? [];
  const pagination = data?.meta;

  return (
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
        items.map((report: ICommentReportItem) => (
          <div key={report.id} className='border-border border-b px-6 py-4 last:border-b-0'>
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
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                  report.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted text-muted-foreground'
                }`}
              >
                {report.status}
              </span>
            </div>

            {report.comment && (
              <div className='mt-2 rounded-none border border-border bg-muted/30 px-4 py-3'>
                <div className='mb-1 flex items-center justify-between gap-2'>
                  <span className='text-muted-foreground text-xs'>
                    By <span className='font-mono'>{formatAddress(report.comment.authorAddress)}</span>
                    {report.comment.deletedAt && <span className='ml-2 text-destructive'>(deleted)</span>}
                  </span>
                  <a
                    href={`/forum/${report.comment.proposalId}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-1 text-muted-foreground text-xs hover:text-foreground'
                  >
                    <ExternalLink className='size-3' />
                    View proposal
                  </a>
                </div>
                <p className='line-clamp-3 text-foreground text-sm'>{report.comment.contentMarkdown}</p>
              </div>
            )}
          </div>
        ))}

      {pagination && pagination.totalPages > 1 && (
        <div className='flex items-center justify-between border-border border-t px-6 py-3'>
          <span className='text-muted-foreground text-xs'>
            Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalItems} total
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
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
