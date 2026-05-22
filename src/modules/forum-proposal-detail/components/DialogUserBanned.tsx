'use client';

import { format } from 'date-fns';
import { ShieldBan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type DialogUserBannedProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expiresAt: string | null;
  reason?: string | null;
};

export function DialogUserBanned({ open, onOpenChange, expiresAt, reason }: DialogUserBannedProps) {
  const isPermanent = !expiresAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-sm'>
        <DialogHeader className='px-6 pt-6 pb-4 text-left'>
          <DialogTitle className='flex items-center gap-2 font-medium text-foreground'>
            <ShieldBan className='size-4 text-destructive' />
            Account Banned
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-2 px-6 pb-4'>
          <p className='text-muted-foreground text-sm'>
            {isPermanent
              ? 'Your account has been permanently banned from commenting and replying.'
              : `Your account has been banned until ${format(new Date(expiresAt), 'PPP')}.`}
          </p>
          {reason && (
            <p className='text-muted-foreground text-sm'>
              <span className='font-medium text-foreground'>Reason:</span> {reason}
            </p>
          )}
        </div>
        <DialogFooter className='border-border border-t px-6 py-4 sm:justify-start'>
          <DialogClose asChild>
            <Button type='button' size='xs' className='h-7 rounded-none px-4'>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
