'use client';

import { Loader2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useReportComment } from '../hooks/use-report-comment';

type DialogReportCommentProps = {
  open: boolean;
  proposalId: string;
  commentId: string;
  onOpenChange: (open: boolean) => void;
};

export function DialogReportComment({ open, proposalId, commentId, onOpenChange }: DialogReportCommentProps) {
  const [reason, setReason] = useState('');
  const { mutateAsync, isPending } = useReportComment();

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (!trimmed) return;

    try {
      await mutateAsync({ proposalId, commentId, reason: trimmed });
      toast.success('Report submitted');
      onOpenChange(false);
      setReason('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit report.';
      if (message.toLowerCase().includes('409') || message.toLowerCase().includes('already')) {
        toast.error('You have already reported this comment.');
      } else {
        toast.error(message);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setReason('');
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-sm'>
        <DialogHeader className='px-6 pt-6 pb-4 text-left'>
          <DialogTitle className='flex items-center gap-2 font-medium text-foreground'>
            <TriangleAlert className='size-4 text-destructive' />
            Report Comment
          </DialogTitle>
        </DialogHeader>

        <div className='px-6 pb-4'>
          <Textarea
            placeholder='Describe the reason for reporting this comment…'
            className='h-24 resize-none rounded-none text-sm'
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
          />
          <p className='mt-1 text-right text-muted-foreground text-xs'>{reason.length}/500</p>
        </div>

        <DialogFooter className='gap-2 border-border border-t px-6 py-4 sm:justify-start'>
          <Button
            type='button'
            variant='destructive'
            size='xs'
            className='h-7 rounded-none px-4'
            disabled={isPending || !reason.trim()}
            onClick={handleSubmit}
            icon={isPending ? <Loader2 className='animate-spin' /> : undefined}
          >
            {isPending ? 'Submitting…' : 'Submit Report'}
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
