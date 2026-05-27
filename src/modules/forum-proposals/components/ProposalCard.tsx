import { Eye, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import type { Proposal } from '../types';
import { formatCreatedAt } from '../utils';
import { MarkdownTruncate } from './MarkdownTruncate';
import { ProposalCategory } from './ProposalCategory';

type ProposalCardProps = {
  proposal: Proposal;
};

export function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <Link
      href={`/forum/${proposal.id}`}
      className='block border border-border bg-card p-4 transition-colors hover:border-primary/60 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    >
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
            {proposal.totalComments || 0}
          </span>
          <span className='flex items-center gap-2'>
            <Users size={15} strokeWidth={1.7} />
            {proposal.uniqueCommenters || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
