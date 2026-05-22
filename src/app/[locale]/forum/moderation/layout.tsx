'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';

export default function ModerationLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const user = useForumAuthStore((s) => s.user);
  const token = useForumAuthStore((s) => s.token);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!token || !user || user.role === 'user') {
    notFound();
  }

  return <>{children}</>;
}
