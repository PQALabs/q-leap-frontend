'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminSidebarNav } from '@/modules/moderation/components/AdminSidebarNav';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';

export default function ModerationLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const user = useForumAuthStore((s) => s.user);
  const token = useForumAuthStore((s) => s.token);
  const hasHydrated = useForumAuthStore((s) => s.hasHydrated);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hasHydrated) return null;

  if (!token || !user || user.role === 'user') {
    notFound();
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex flex-col gap-4 md:flex-row md:items-start md:gap-6'>
        <AdminSidebarNav />
        <div className='min-w-0 flex-1'>{children}</div>
      </div>
    </div>
  );
}
