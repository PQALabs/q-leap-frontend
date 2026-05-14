import { Eye, MessageSquare } from 'lucide-react';
import type { Proposal } from '../types';
import { formatCreatedAt } from '../utils';
import { MarkdownTruncate } from './MarkdownTruncate';
import { ProposalCategory } from './ProposalCategory';

type ProposalCardProps = {
  proposal: Proposal;
};

export function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <article className='border border-border bg-card p-4'>
      <div className='flex items-center gap-2 font-mono text-foreground text-xs leading-none'>
        <ProposalCategory category={proposal.category} />
        <span className='font-semibold'>{proposal.author}</span>
        <span className='size-1 rounded-full bg-foreground' />
        <span>{formatCreatedAt(proposal.createdAt)}</span>
      </div>

      <h2 className='mt-2 font-bold font-serif text-primary text-xl leading-6'>{proposal.title}</h2>

      <MarkdownTruncate source={proposal.description} />

      <div className='mt-3 border-border border-t pt-3'>
        <div className='flex items-center gap-5 text-muted-foreground text-sm leading-none'>
          <span className='flex items-center gap-2'>
            <MessageSquare size={14} strokeWidth={1.7} />
            {proposal.comments}
          </span>
          <span className='flex items-center gap-2'>
            <Eye size={15} strokeWidth={1.7} />
            {proposal.views}
          </span>
        </div>
      </div>
    </article>
  );
}
