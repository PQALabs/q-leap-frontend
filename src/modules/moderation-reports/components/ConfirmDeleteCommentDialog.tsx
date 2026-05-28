'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ICommentReportItem } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useModeratorDeleteComment } from '../hooks/use-moderator-delete-comment';

type ConfirmDeleteCommentDialogProps = {
  report: ICommentReportItem | null;
  onClose: () => void;
};

export function ConfirmDeleteCommentDialog({ report, onClose }: ConfirmDeleteCommentDialogProps) {
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
