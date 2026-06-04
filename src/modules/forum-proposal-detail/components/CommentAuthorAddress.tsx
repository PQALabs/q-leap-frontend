'use client';

import type { ReactNode } from 'react';
import { CopyAddressButton } from '@/components/copy-address-button';
import { cn, formatAddress } from '@/lib/utils';

type CommentAuthorAddressProps = {
  address: string;
  className?: string;
  copyButtonClassName?: string;
  copyIconClassName?: string;
  children?: ReactNode;
};

export function CommentAuthorAddress({
  address,
  className,
  copyButtonClassName,
  copyIconClassName,
  children,
}: CommentAuthorAddressProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-foreground', className)}>
      <span className='font-medium'>{formatAddress(address)}</span>
      <CopyAddressButton
        address={address}
        title='Copy author address'
        className={copyButtonClassName}
        iconClassName={copyIconClassName}
      />
      {children}
    </span>
  );
}
