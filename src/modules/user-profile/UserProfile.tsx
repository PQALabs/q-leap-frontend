'use client';

import { format } from 'date-fns';
import { Shield, Wallet } from 'lucide-react';
import { useUserProfile } from '@/api/user/queries';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { AvatarUpload } from './components/AvatarUpload';
import { ProfileForm } from './components/ProfileForm';

function ProfileSkeleton() {
  return (
    <div className='mx-auto max-w-xl space-y-6'>
      <Skeleton className='h-6 w-40' />
      <div className='flex flex-col items-center gap-3'>
        <Skeleton className='h-24 w-24 rounded-full' />
        <Skeleton className='h-3 w-32' />
      </div>
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-8 w-28' />
    </div>
  );
}

export function UserProfile() {
  const token = useForumAuthStore((s) => {
    return s.token;
  });
  const hasHydrated = useForumAuthStore((s) => s.hasHydrated);

  const {
    data: profile,
    isLoading,
    isError,
  } = useUserProfile({
    enabled: hasHydrated && !!token,
  });

  if (!hasHydrated || isLoading) return <ProfileSkeleton />;

  if (!token) {
    return (
      <div className='mx-auto max-w-xl py-16 text-center'>
        <Wallet size={32} className='mx-auto mb-3 text-muted-foreground' />
        <p className='font-medium text-foreground'>Sign in required</p>
        <p className='mt-1 text-muted-foreground text-sm'>
          Please connect your wallet and sign in to view your profile.
        </p>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className='mx-auto max-w-xl py-16 text-center text-muted-foreground text-sm'>
        Failed to load profile. Please refresh the page.
      </div>
    );
  }

  const roleBadgeClass =
    profile.role === 'admin'
      ? 'bg-red-500/10 text-red-500 border-red-500/30'
      : profile.role === 'moderator'
        ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
        : 'bg-muted text-muted-foreground border-border';

  return (
    <div className='pb-16'>
      <div className='mx-auto max-w-xl'>
        <h1 className='mb-6 font-bold font-serif text-2xl text-primary leading-tight'>My Profile</h1>

        {/* Avatar */}
        <section className='flex flex-col items-center gap-1 py-4'>
          <AvatarUpload currentAvatarUrl={profile.avatarUrl} username={profile.username} />
        </section>

        <Separator className='my-5' />

        {/* Read-only info */}
        <section className='mb-5 space-y-3'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2 text-muted-foreground text-sm'>
              <Wallet size={14} />
              <span>Wallet</span>
            </div>
            <span className='break-all font-mono text-foreground text-xs'>{profile.walletAddress}</span>
          </div>

          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2 text-muted-foreground text-sm'>
              <Shield size={14} />
              <span>Role</span>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium text-xs capitalize ${roleBadgeClass}`}
            >
              {profile.role}
            </span>
          </div>

          <div className='flex items-center justify-between gap-4'>
            <span className='text-muted-foreground text-sm'>Member since</span>
            <span className='text-foreground text-xs'>{format(new Date(profile.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </section>

        <Separator className='my-5' />

        {/* Editable form */}
        <section>
          <h2 className='mb-4 font-semibold text-base text-foreground'>Edit profile</h2>
          <ProfileForm profile={profile} />
        </section>
      </div>
    </div>
  );
}
