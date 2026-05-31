'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { updateUserProfileRequest } from '@/api/user/requests';
import type { IUpdateProfileRequest, IUserProfile } from '@/api/user/types';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryKeys } from '@/constants/query-keys';

const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be 50 characters or less.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username may only contain letters, numbers, and underscores.')
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(255, 'Email must be 255 characters or less.')
    .or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: IUserProfile;
}

const toNullableProfileValue = (value: string) => (value === '' ? null : value);

export function ProfileForm({ profile }: ProfileFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile.username ?? '',
      email: profile.email ?? '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    form.reset({
      username: profile.username ?? '',
      email: profile.email ?? '',
    });
  }, [profile, form]);

  const { isSubmitting, isDirty } = form.formState;

  const handleSubmit = form.handleSubmit(async (values) => {
    const patch: IUpdateProfileRequest = {};
    const username = toNullableProfileValue(values.username);
    const email = toNullableProfileValue(values.email);

    if (username !== profile.username) patch.username = username;
    if (email !== profile.email) patch.email = email;

    if (Object.keys(patch).length === 0) return;

    try {
      await updateUserProfileRequest(patch);
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      toast.success('Profile updated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast.error('Failed to update profile', { description: message });
    }
  });

  return (
    <form onSubmit={handleSubmit} className='w-full'>
      <FieldGroup className='gap-4'>
        <Field data-invalid={!!form.formState.errors.username}>
          <Label htmlFor='username' className='font-medium text-xs'>
            Username
          </Label>
          <Input
            id='username'
            {...form.register('username')}
            aria-invalid={!!form.formState.errors.username}
            placeholder='e.g. crypto_user'
            className='rounded-none bg-muted text-sm shadow-none'
          />
          <FieldError errors={[form.formState.errors.username]} className='text-xs' />
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <Label htmlFor='email' className='font-medium text-xs'>
            Email
          </Label>
          <Input
            id='email'
            type='email'
            {...form.register('email')}
            aria-invalid={!!form.formState.errors.email}
            placeholder='user@example.com'
            className='rounded-none bg-muted text-sm shadow-none'
          />
          <FieldError errors={[form.formState.errors.email]} className='text-xs' />
        </Field>
      </FieldGroup>

      <div className='mt-6'>
        <Button
          type='submit'
          size='sm'
          className='rounded-none px-5'
          disabled={!isDirty || isSubmitting}
          icon={isSubmitting ? <Loader2 className='animate-spin' /> : <Save size={14} />}
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
