'use client';

import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { isAddress } from 'viem';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useAddModerator } from '../hooks/use-add-moderator';

export function DialogAddModerator() {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const { mutateAsync, isPending } = useAddModerator();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAddress('');
      setError('');
    }
    setOpen(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAddress(address)) {
      setError('Please enter a valid Ethereum address.');
      return;
    }
    setError('');

    try {
      await mutateAsync(address);
      toast.success('Moderator added');
      handleOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : getEvmMessage(err);
      toast.error('Failed to add moderator', { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type='button' size='xs' className='rounded-none px-4 font-bold text-xs' icon={<Plus />}>
          ADD MODERATOR
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton={false} className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-md'>
        <DialogHeader className='flex-row items-center justify-between gap-4 border-border border-b px-6 py-4 text-left'>
          <DialogTitle className='font-medium text-foreground'>Add Moderator</DialogTitle>
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
          <Field data-invalid={!!error}>
            <Input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (error) setError('');
              }}
              placeholder='0x...'
              className='rounded-none bg-muted font-mono text-xs shadow-none'
              disabled={isPending}
              autoFocus
            />
            {error && <FieldError errors={[{ message: error }]} className='text-xs' />}
          </Field>

          <DialogFooter className='mt-6 flex-row justify-start gap-4 sm:justify-start'>
            <Button
              type='submit'
              size='xs'
              className='h-7 rounded-none px-4'
              disabled={isPending}
              icon={isPending ? <Loader2 className='animate-spin' /> : <Plus />}
            >
              {isPending ? 'Adding…' : 'Add'}
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
