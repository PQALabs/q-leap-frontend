'use client';

import MarkdownPreview from '@uiw/react-markdown-preview';
import { useTheme } from 'next-themes';

interface ProposalContentProps {
  description: string;
}

export function ProposalContent({ description }: ProposalContentProps) {
  const { resolvedTheme, theme } = useTheme();
  const colorMode = resolvedTheme === 'dark' || theme === 'dark' ? 'dark' : 'light';

  return (
    <section className='rounded-xs border border-border bg-card px-7 py-8 shadow-sm'>
      <MarkdownPreview
        source={description}
        wrapperElement={{ 'data-color-mode': colorMode }}
        className='!bg-transparent !font-sans [&_a]:text-primary [&_h1]:font-serif [&_h2]:font-serif'
      />
    </section>
  );
}
