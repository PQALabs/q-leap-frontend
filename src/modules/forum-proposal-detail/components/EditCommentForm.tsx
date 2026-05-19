'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { getForumCommentMutationErrorMessage } from '../utils';
import { CommentMarkdownEditor } from './CommentMarkdownEditor';

const editSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty.'),
});

type EditFormValues = z.infer<typeof editSchema>;

type EditCommentFormProps = {
  open: boolean;
  initialContent: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string) => Promise<void>;
};

export function EditCommentForm({ open, initialContent, onOpenChange, onSubmit }: EditCommentFormProps) {
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { content: initialContent },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (open) {
      form.reset({ content: initialContent });
    }
  }, [open, initialContent, form]);

  const handleDiscard = () => {
    form.reset({ content: initialContent });
    onOpenChange(false);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values.content.trim());
      onOpenChange(false);
      toast.success('Comment updated');
    } catch (error) {
      toast.error(getForumCommentMutationErrorMessage(error, 'Failed to update comment.'));
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) form.reset({ content: initialContent });
      }}
    >
      <DialogContent
        showCloseButton={false}
        className='gap-0 overflow-hidden rounded-sm border-border bg-card p-0 text-card-foreground shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] sm:max-w-[670px]'
      >
        <DialogHeader className='flex-row items-center justify-between gap-4 border-border border-b px-4 py-3 text-left'>
          <div className='flex min-w-0 items-center gap-3'>
            <DialogClose asChild>
              <Button
                type='button'
                variant='outline'
                size='icon-xs'
                aria-label='Back'
                className='size-[26px] rounded-sm bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              >
                <ArrowLeft className='size-4' />
              </Button>
            </DialogClose>
            <DialogTitle className='truncate font-bold font-serif text-lg text-primary leading-7'>
              Edit comment
            </DialogTitle>
          </div>

          <DialogClose asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              aria-label='Close edit dialog'
              className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            >
              <X className='size-4' />
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Field data-invalid={!!form.formState.errors.content} className='gap-0'>
            <Controller
              control={form.control}
              name='content'
              render={({ field }) => (
                <CommentMarkdownEditor
                  value={field.value}
                  isInvalid={!!form.formState.errors.content}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <FieldError errors={[form.formState.errors.content]} className='px-4 pt-1 text-xs' />
          </Field>

          <div className='flex items-center gap-4 px-4 pt-6 pb-5'>
            <Button size='sm' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
            <Button size='sm' type='button' variant='ghost' onClick={handleDiscard} disabled={isSubmitting}>
              Discard
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
