'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// CopyAddressButton — inline copy-to-clipboard button with checkmark feedback
// ---------------------------------------------------------------------------
interface CopyAddressButtonProps {
  address: string;
  title: string;
}

export function CopyAddressButton({ address, title }: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='inline-flex cursor-pointer items-center text-muted-foreground/60 transition-colors hover:text-foreground'
      title={title}
    >
      {copied ? <Check size={12} className='text-success' /> : <Copy size={12} />}
    </button>
  );
}
