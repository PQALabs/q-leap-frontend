'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type PendingDeleteComment = {
  commentId: string;
  isReply: boolean;
  byModerator: boolean;
};

type ConfirmDeleteCommentDialogProps = {
  target: PendingDeleteComment | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteCommentDialog({ target, isPending, onClose, onConfirm }: ConfirmDeleteCommentDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-sm'>
        <DialogHeader className='px-6 pt-6 pb-4 text-left'>
          <DialogTitle className='font-medium text-foreground'>
            {target?.byModerator ? 'Remove comment?' : 'Delete comment?'}
          </DialogTitle>
        </DialogHeader>
        <p className='px-6 pb-4 text-muted-foreground text-sm'>
          {target?.byModerator
            ? 'You are removing this comment as a moderator. This action cannot be undone.'
            : 'This action cannot be undone.'}
        </p>
        <DialogFooter className='gap-2 border-border border-t px-6 py-4 sm:justify-start'>
          <Button
            type='button'
            variant='destructive'
            size='xs'
            className='h-7 rounded-none px-4'
            disabled={isPending}
            onClick={onConfirm}
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
