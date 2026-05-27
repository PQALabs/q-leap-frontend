'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ICommentReportItem } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { queryKeys } from '@/constants/query-keys';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useRejectCommentReport } from '../hooks/use-reject-comment-report';

type ConfirmRejectReportDialogProps = {
  report: ICommentReportItem | null;
  onClose: () => void;
};

export function ConfirmRejectReportDialog({ report, onClose }: ConfirmRejectReportDialogProps) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useRejectCommentReport();

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
