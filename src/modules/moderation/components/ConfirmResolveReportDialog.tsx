'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ICommentReportItem } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { queryKeys } from '@/constants/query-keys';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useResolveCommentReport } from '../hooks/use-resolve-comment-report';

type ConfirmResolveReportDialogProps = {
  report: ICommentReportItem | null;
  onClose: () => void;
};

export function ConfirmResolveReportDialog({ report, onClose }: ConfirmResolveReportDialogProps) {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useResolveCommentReport();

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
