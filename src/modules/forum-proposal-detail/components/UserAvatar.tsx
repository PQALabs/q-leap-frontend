'use client';

import jazzicon from '@metamask/jazzicon';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type UserAvatarProps = {
  address: string;
  className?: string;
};

export function UserAvatar({ address, className }: UserAvatarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !address) return;
    const seed = Number.parseInt(address.slice(2, 10), 16);
    const container = ref.current;
    container.innerHTML = '';
    const icon = jazzicon(container.clientWidth || 40, seed);
    container.appendChild(icon);
  }, [address]);

  return <div ref={ref} className={cn('shrink-0 overflow-hidden rounded-full', className ?? 'size-10')} />;
}
