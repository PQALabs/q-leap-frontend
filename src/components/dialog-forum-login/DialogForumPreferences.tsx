'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSignMessage } from 'wagmi';
import { updateAuthPreferencesRequest } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getEvmMessage } from '@/lib/get-evm-message';
import { cn } from '@/lib/utils';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';

type Props = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
};

export const DialogForumPreferences = ({ open, onOpenChangeAction }: Props) => {
  const user = useForumAuthStore((s) => s.user);
  const setUser = useForumAuthStore((s) => s.setUser);

  const { mutateAsync: signMessageAsync } = useSignMessage();

  const [requireSignature, setRequireSignature] = useState(user?.requireSignature ?? false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setRequireSignature(user?.requireSignature ?? false);
    }
  }, [open, user?.requireSignature]);

  const hasChanged = requireSignature !== (user?.requireSignature ?? false);

  const handleSave = async () => {
    if (!hasChanged) {
      onOpenChangeAction(false);
      return;
    }

    setIsSaving(true);
    try {
      const signatureTimestamp = Date.now();
      const message = `QLEAP:UPDATE_PREFERENCES\ntimestamp:${signatureTimestamp}`;
      const signature = await signMessageAsync({ message });

      const updated = await updateAuthPreferencesRequest({ requireSignature, signatureTimestamp }, signature);
      setUser(updated);
      toast.success('Preference saved');
      onOpenChangeAction(false);
    } catch (error) {
      toast.error(getEvmMessage(error) || 'Failed to save preference');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setRequireSignature(user?.requireSignature ?? false);
    onOpenChangeAction(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-describedby='' className='rounded-xs border-border p-6 sm:max-w-110'>
        <DialogHeader className='mb-6 space-y-1.5 text-center'>
          <DialogTitle className='text-center font-bold text-xl'>Security preference</DialogTitle>
          <DialogDescription className='text-center text-muted-foreground text-sm'>
            Choose how you want to authorize forum actions.
          </DialogDescription>
        </DialogHeader>

        <div className='mb-6 flex flex-col gap-3'>
          <button
            type='button'
            disabled={isSaving}
            onClick={() => setRequireSignature(false)}
            className={cn(
              'w-full rounded-xs border p-4 text-left transition-colors',
              !requireSignature
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border/70 hover:bg-accent/50'
            )}
          >
            <div className='flex items-start gap-3'>
              <div
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  !requireSignature ? 'border-primary' : 'border-muted-foreground/40'
                )}
              >
                {!requireSignature && <div className='h-2 w-2 rounded-full bg-primary' />}
              </div>
              <div>
                <p className='font-semibold text-foreground text-sm'>
                  Session only <span className='font-normal text-muted-foreground text-xs'>(Recommended)</span>
                </p>
                <p className='mt-0.5 text-muted-foreground text-xs leading-relaxed'>
                  Just sign in once — no extra steps when you comment, vote, or create proposals.
                </p>
              </div>
            </div>
          </button>

          <button
            type='button'
            disabled={isSaving}
            onClick={() => setRequireSignature(true)}
            className={cn(
              'w-full rounded-xs border p-4 text-left transition-colors',
              requireSignature
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-border/70 hover:bg-accent/50'
            )}
          >
            <div className='flex items-start gap-3'>
              <div
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  requireSignature ? 'border-primary' : 'border-muted-foreground/40'
                )}
              >
                {requireSignature && <div className='h-2 w-2 rounded-full bg-primary' />}
              </div>
              <div>
                <p className='font-semibold text-foreground text-sm'>Sign each action</p>
                <p className='mt-0.5 text-muted-foreground text-xs leading-relaxed'>
                  Your wallet will ask for approval on each action. Best for shared or high-security environments.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className='flex gap-3'>
          <Button onClick={handleSave} disabled={isSaving} loading={isSaving} className='flex-1 font-semibold'>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant='outline' disabled={isSaving} onClick={() => handleOpenChange(false)} className='flex-1'>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
