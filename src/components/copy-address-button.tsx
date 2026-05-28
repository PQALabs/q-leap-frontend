'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// CopyAddressButton — inline copy-to-clipboard button with checkmark feedback
// ---------------------------------------------------------------------------
interface CopyAddressButtonProps {
  address: string;
  title: string;
  className?: string;
  iconClassName?: string;
}

export function CopyAddressButton({ address, title, className, iconClassName }: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      className={`inline-flex cursor-pointer items-center text-muted-foreground/90 transition-colors hover:text-foreground ${className ?? ''}`}
      title={title}
    >
      {copied ? (
        <Check className={`size-3 text-success ${iconClassName ?? ''}`} />
      ) : (
        <Copy className={iconClassName ?? 'size-3'} />
      )}
    </button>
  );
}
