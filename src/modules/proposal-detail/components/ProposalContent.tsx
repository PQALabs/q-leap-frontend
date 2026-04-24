import { cn } from '@/lib/utils';
import type { ProposalContentSection } from '../proposal-detail.data';

interface ProposalContentProps {
  author: string;
  sections: ProposalContentSection[];
  references: string[];
  copyright: string;
}

export function ProposalContent({ author, sections, references, copyright }: ProposalContentProps) {
  return (
    <section className='rounded-xs border border-border bg-card px-7 py-8 shadow-sm'>
      <div className='space-y-12'>
        <ContentBlock heading='Author' paragraphs={[author]} compact />

        {sections.map((section) => (
          <ContentBlock key={section.heading} heading={section.heading} paragraphs={section.paragraphs} />
        ))}

        <div className='space-y-6'>
          <h2 className='font-serif text-2xl text-foreground tracking-tight'>References</h2>
          <ul className='list-disc space-y-2 pl-6 text-muted-foreground leading-8'>
            {references.map((reference) => (
              <li key={reference}>{reference}</li>
            ))}
          </ul>
        </div>

        <ContentBlock heading='Copyright' paragraphs={[copyright]} />
      </div>
    </section>
  );
}

function ContentBlock({
  heading,
  paragraphs,
  compact = false,
}: {
  heading: string;
  paragraphs: string[];
  compact?: boolean;
}) {
  return (
    <div className='space-y-5'>
      <h2 className='font-serif text-2xl text-foreground tracking-tight'>{heading}</h2>
      <div className={cn('space-y-6 text-muted-foreground leading-8', compact && 'space-y-0')}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
