import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type='button'
      onClick={handleCopy}
      className='ml-1 inline-flex cursor-pointer items-center text-muted-foreground/70 transition-colors hover:text-foreground'
      title='Copy address'
    >
      {copied ? <Check size={12} className='text-emerald-500' /> : <Copy size={12} />}
    </button>
  );
}
