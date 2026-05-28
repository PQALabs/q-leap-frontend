'use client';

import { Loader2, ShieldBan, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { isAddress } from 'viem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getEvmMessage } from '@/lib/get-evm-message';
import { formatAddress } from '@/lib/utils';
import { useBanAddress } from '../hooks/use-ban-address';

type BanAddressDialogProps = {
  open: boolean;
  targetAddress: string | null;
  onClose: () => void;
};

export function BanAddressDialog({ open, targetAddress, onClose }: BanAddressDialogProps) {
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [addressError, setAddressError] = useState('');
  const { mutateAsync, isPending } = useBanAddress();
  const hasTargetAddress = !!targetAddress;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAddress('');
      setReason('');
      setExpiresAt('');
      setAddressError('');
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const addressToBan = (targetAddress ?? address).trim();
    if (!isAddress(addressToBan)) {
      setAddressError('Please enter a valid Ethereum address.');
      return;
    }
    setAddressError('');

    try {
      await mutateAsync({
        targetAddress: addressToBan,
        reason: reason.trim() || null,
        expiresAt: expiresAt || null,
      });
      toast.success(`${formatAddress(addressToBan)} has been banned`);
      handleOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : getEvmMessage(err);
      toast.error('Failed to ban address', { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-md'>
        <DialogHeader className='flex-row items-center justify-between gap-4 border-border border-b px-6 py-4 text-left'>
          <DialogTitle className='font-medium text-foreground'>Ban Address</DialogTitle>
          <DialogClose asChild>
            <button
              type='button'
              aria-label='Close modal'
              className='inline-flex size-4 items-center justify-center text-muted-foreground'
            >
              <X size={13} />
            </button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='px-6 pt-5 pb-4'>
          <FieldGroup className='gap-3'>
            {hasTargetAddress ? (
              <p className='break-all font-mono text-muted-foreground text-sm'>{targetAddress}</p>
            ) : (
              <Field data-invalid={!!addressError}>
                <Label className='text-xs'>Address</Label>
                <Input
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (addressError) setAddressError('');
                  }}
                  placeholder='0x...'
                  className='rounded-none bg-muted font-mono text-xs shadow-none'
                  disabled={isPending}
                  autoFocus
                />
                {addressError && <FieldError errors={[{ message: addressError }]} className='text-xs' />}
              </Field>
            )}

            <Field>
              <Label className='text-xs'>Reason (optional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='e.g. Spam, abusive behavior…'
                className='resize-none rounded-none bg-muted text-xs shadow-none'
                rows={2}
                disabled={isPending}
              />
            </Field>

            <Field>
              <Label className='text-xs'>Expires at (leave empty for permanent)</Label>
              <Input
                type='date'
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className='rounded-none bg-muted text-xs shadow-none'
                disabled={isPending}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className='mt-6 flex-row justify-start gap-4 sm:justify-start'>
            <Button
              type='submit'
              variant='destructive'
              size='xs'
              className='h-7 rounded-none px-4'
              disabled={isPending}
              icon={isPending ? <Loader2 className='animate-spin' /> : <ShieldBan />}
            >
              {isPending ? 'Banning…' : 'Ban'}
            </Button>
            <DialogClose asChild>
              <Button type='button' variant='ghost' size='xs' className='h-7 rounded-none px-2' disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
