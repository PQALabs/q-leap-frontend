'use client';

import MarkdownPreview from '@uiw/react-markdown-preview';
import type { ICommentReportItem } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { commentReportMarkdownClass } from '../comment-report-markdown';

type CommentFullDialogProps = {
  comment: ICommentReportItem['comment'] | null;
  onClose: () => void;
};

export function CommentFullDialog({ comment, onClose }: CommentFullDialogProps) {
  return (
    <Dialog open={!!comment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-2xl'>
        <DialogHeader className='border-border border-b px-6 py-4 text-left'>
          <DialogTitle className='font-medium text-foreground text-sm'>Full comment</DialogTitle>
        </DialogHeader>
        <div
          className={`${commentReportMarkdownClass} max-h-[60vh] min-h-50 overflow-y-auto px-6 py-4`}
          data-color-mode='dark'
        >
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
