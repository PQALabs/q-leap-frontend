'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { IForumComment } from '@/api/forum';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldError } from '@/components/ui/field';
import { formatAddress } from '@/lib/utils';
import { getForumCommentMutationErrorMessage } from '../utils';
import { CommentMarkdownEditor } from './CommentMarkdownEditor';

const commentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty.'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

const defaultValues: CommentFormValues = {
  content: '',
};

type AddCommentFormProps = {
  open: boolean;
  proposalTitle: string;
  replyTo?: IForumComment | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string) => Promise<void>;
};

const MAX_REPLY_QUOTE_LENGTH = 100;

function getReplyQuotePreview(comment: IForumComment) {
  const text = comment.contentMarkdown.replace(/\s+/g, ' ').trim();

  if (text.length <= MAX_REPLY_QUOTE_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_REPLY_QUOTE_LENGTH).trimEnd()}...`;
}

export function AddCommentForm({ open, proposalTitle, replyTo, onOpenChange, onSubmit }: AddCommentFormProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const handleDiscard = () => {
    form.reset(defaultValues);
    onOpenChange(false);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values.content.trim());
      form.reset(defaultValues);
      onOpenChange(false);
      toast.success(replyTo ? 'Reply added' : 'Comment added');
    } catch (error) {
      toast.error(getForumCommentMutationErrorMessage(error, 'Failed to submit comment.'));
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          form.reset(defaultValues);
        }
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
              {replyTo ? `Replying to ${formatAddress(replyTo.authorAddress)}` : proposalTitle}
            </DialogTitle>
          </div>

          <DialogClose asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              aria-label='Close reply dialog'
              className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            >
              <X className='size-4' />
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {replyTo ? (
            <div className='border-border border-b px-4 py-3'>
              <div className='rounded-sm border border-border bg-muted px-3 py-2 text-sm'>
                <div className='mb-1 font-medium text-foreground'>
                  Replying to {formatAddress(replyTo.authorAddress)}
                </div>
                <p className='text-muted-foreground leading-5'>{getReplyQuotePreview(replyTo)}</p>
              </div>
            </div>
          ) : null}

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
            <Button size={'sm'} type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : replyTo ? 'Reply' : 'Comment'}
            </Button>
            <Button size={'sm'} type='button' variant='ghost' onClick={handleDiscard} disabled={isSubmitting}>
              Discard
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
