'use client';

import type { ICommentReportListParams } from '@/api/moderation';
import { Button } from '@/components/ui/button';

type CommentReportStatusFilterProps = {
  value: ICommentReportListParams['status'];
  onChange: (v: ICommentReportListParams['status']) => void;
};

export function CommentReportStatusFilter({ value, onChange }: CommentReportStatusFilterProps) {
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
