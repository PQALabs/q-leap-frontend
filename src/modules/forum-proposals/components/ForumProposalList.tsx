import { Loader2 } from 'lucide-react';
import type { RefObject } from 'react';
import { FORUM_PROPOSALS_SKELETON_COUNT } from '../constants';
import type { Proposal } from '../types';
import { ProposalCard } from './ProposalCard';
import { ProposalCardSkeleton } from './ProposalCardSkeleton';

type ForumProposalListProps = {
  proposals: Proposal[];
  isLoading: boolean;
  isFiltered: boolean;
  isLoadingMore: boolean;
  loadMoreRef: RefObject<HTMLDivElement | null>;
};

export function ForumProposalList({
  proposals,
  isLoading,
  isFiltered,
  isLoadingMore,
  loadMoreRef,
}: ForumProposalListProps) {
  return (
    <>
      <div className='space-y-4'>
        {isLoading
          ? Array.from({ length: FORUM_PROPOSALS_SKELETON_COUNT }).map((_, index) => (
              <ProposalCardSkeleton key={`proposal-skeleton-${index}`} />
            ))
          : proposals.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)}
      </div>

      {!isLoading && proposals.length === 0 && (
        <div className='border border-border bg-card px-4 py-8 text-center text-muted-foreground text-sm'>
          {isFiltered ? 'No proposals found.' : 'No proposals yet.'}
        </div>
      )}

      <div ref={loadMoreRef} className='h-1' />

      {isLoadingMore && (
        <div className='flex items-center justify-center py-6 text-muted-foreground text-sm'>
          <Loader2 className='mr-2 size-4 animate-spin' />
          Loading more proposals
        </div>
      )}
    </>
  );
}
