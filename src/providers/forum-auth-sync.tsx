'use client';

import { useEffect, useRef } from 'react';
import { useDisconnect } from 'wagmi';
import { useAuthMe } from '@/api/auth';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';

export function ForumAuthSync() {
  const { mutate: disconnect } = useDisconnect();
  const token = useForumAuthStore((s) => s.token);
  const hasHydrated = useForumAuthStore((s) => s.hasHydrated);
  const prevTokenRef = useRef(token);

  // Run /me globally whenever a forum session exists
  useAuthMe();

  useEffect(() => {
    if (!hasHydrated) return;

    const prevToken = prevTokenRef.current;
    prevTokenRef.current = token;

    // Token cleared after being set → session expired or manual logout.
    // Manual logout already calls disconnect() before clearAuth, so this is a harmless no-op in that case.
    if (prevToken && !token) {
      disconnect();
    }
  }, [hasHydrated, token, disconnect]);

  return null;
}
