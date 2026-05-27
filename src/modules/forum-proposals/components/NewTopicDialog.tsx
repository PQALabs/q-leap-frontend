'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { FORUM_PROPOSAL_TYPES, type ForumProposalType } from '@/api/forum';
import { DialogForumLogin } from '@/components/dialog-forum-login/DialogForumLogin';
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
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEvmMessage } from '@/lib/get-evm-message';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { useCreateProposal } from '../use-create-proposal';
import { ProposalMarkdownEditor } from './ProposalMarkdownEditor';

const topicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(255, 'Title must be 255 characters or less.'),
  category: z
    .union([z.enum(FORUM_PROPOSAL_TYPES), z.literal('')])
    .refine((value) => value !== '', 'Please select a category.'),
  content: z.string().trim().min(10, 'Content must be at least 10 characters.'),
});

type TopicFormValues = Omit<z.infer<typeof topicSchema>, 'category'> & {
  category: ForumProposalType | '';
};

const defaultValues: TopicFormValues = {
  title: '',
  category: '',
  content: '',
};

export function NewTopicDialog() {
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const isLoggedIn = useForumAuthStore((s) => s.hasHydrated && !!s.token);
  const editorColorMode = resolvedTheme === 'dark' ? 'dark' : 'light';

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const { isPending, mutateAsync } = useCreateProposal();

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync({
        title: values.title,
        content: values.content,
        category: values.category as ForumProposalType,
      });
      toast.success('Topic created');
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : getEvmMessage(error);
      toast.error('Failed to create topic', { description: message });
    }
  });

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) form.reset(defaultValues);
        }}
      >
        <DialogTrigger asChild>
          <Button
            type='button'
            variant='secondary'
            size='xs'
            className='rounded-none px-4 font-bold text-xs leading-none'
            icon={<Plus />}
          >
            NEW TOPIC
          </Button>
        </DialogTrigger>

        <DialogContent
          showCloseButton={false}
          className='gap-0 rounded-none border-border bg-card p-0 sm:max-w-[748px]'
        >
          <DialogHeader className='flex-row items-center justify-between gap-4 border-border border-b px-6 py-4 text-left'>
            <DialogTitle className='font-medium text-foreground'>Create a new proposal</DialogTitle>
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
              <div className='grid grid-cols-[1fr_170px] gap-4'>
                <Field data-invalid={!!form.formState.errors.title}>
                  <Input
                    {...form.register('title')}
                    aria-invalid={!!form.formState.errors.title}
                    disabled={!isLoggedIn}
                    placeholder='Type title, or paste a link here'
                    className='rounded-none bg-muted text-xs shadow-none'
                  />
                  <FieldError errors={[form.formState.errors.title]} className='text-xs' />
                </Field>

                <Field data-invalid={!!form.formState.errors.category}>
                  <Controller
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={!isLoggedIn}>
                        <SelectTrigger
                          aria-invalid={!!form.formState.errors.category}
                          className='h-10 w-full rounded-none bg-muted text-xs shadow-none'
                        >
                          <SelectValue placeholder='category...' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {FORUM_PROPOSAL_TYPES.map((proposalType) => (
                              <SelectItem key={proposalType} value={proposalType}>
                                {proposalType}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[form.formState.errors.category]} className='text-xs' />
                </Field>
              </div>

              <Field data-invalid={!!form.formState.errors.content} className='gap-0'>
                <Controller
                  control={form.control}
                  name='content'
                  render={({ field }) => (
                    <ProposalMarkdownEditor
                      value={field.value}
                      colorMode={editorColorMode}
                      isInvalid={!!form.formState.errors.content}
                      disabled={!isLoggedIn}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <FieldError errors={[form.formState.errors.content]} className='pt-1 text-xs' />
              </Field>
            </FieldGroup>

            <DialogFooter className='mt-6 flex-row justify-start gap-4 sm:justify-start'>
              {isLoggedIn ? (
                <Button
                  type='submit'
                  size='xs'
                  className='h-7 rounded-none px-4'
                  disabled={isPending}
                  icon={isPending ? <Loader2 className='animate-spin' /> : <Plus />}
                >
                  {isPending ? 'Creating' : 'Create Proposal'}
                </Button>
              ) : (
                <Button
                  type='button'
                  size='xs'
                  className='h-7 rounded-none px-4'
                  icon={<Plus />}
                  onClick={() => setLoginDialogOpen(true)}
                >
                  Sign in to create
                </Button>
              )}
              <DialogClose asChild>
                <Button type='button' variant='ghost' size='xs' className='h-7 rounded-none px-2' disabled={isPending}>
                  Discard
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DialogForumLogin open={loginDialogOpen} onOpenChangeAction={() => setLoginDialogOpen(false)} />
    </>
  );
}
