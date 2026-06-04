'use client';

import { CopyAddressButton } from '@/components/copy-address-button';
import { cn, formatAddress } from '@/lib/utils';

type AddressWithCopyProps = {
  address: string;
  copyTitle?: string;
  className?: string;
  textClassName?: string;
  copyButtonClassName?: string;
  copyIconClassName?: string;
};

export function AddressWithCopy({
  address,
  copyTitle = 'Copy address',
  className,
  textClassName,
  copyButtonClassName,
  copyIconClassName,
}: AddressWithCopyProps) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <span className={cn(textClassName)}>{formatAddress(address)}</span>
      <CopyAddressButton
        address={address}
        title={copyTitle}
        className={copyButtonClassName}
        iconClassName={copyIconClassName}
      />
    </span>
  );
}
