'use client';

import { CompactNumber } from '@/components/compact-number';

/**
 * USD value renderer — Aave-style formatting.
 * Shows compact form on mobile (<md), full number on desktop (md+).
 */
export function UsdValue({ value }: { value: number }) {
  const full = value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <>
      ${/* Desktop: full number */}
      <span className='hidden md:inline'>{full}</span>
      {/* Mobile: compact number */}
      <span className='md:hidden'>
        <CompactNumber value={value} maximumFractionDigits={2} minimumFractionDigits={2} />
      </span>
    </>
  );
}
