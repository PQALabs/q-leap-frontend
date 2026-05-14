'use client';

import { useDebouncedValue } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { useForumProposals } from '@/api/forum';
import { useScrollPagination } from '@/hooks/use-scroll-pagination';
import { ForumProposalFilters } from '@/modules/forum-proposals/components/ForumProposalFilters';
import { ForumProposalList } from '@/modules/forum-proposals/components/ForumProposalList';
import { NewTopicDialog } from '@/modules/forum-proposals/components/NewTopicDialog';
import {
  ALL_FORUM_PROPOSAL_CATEGORIES,
  FORUM_PROPOSALS_LOAD_MORE_MIN_DELAY,
  FORUM_PROPOSALS_PAGE_SIZE,
} from '@/modules/forum-proposals/constants';
import type { CategoryFilter } from '@/modules/forum-proposals/types';
import { toProposalCard } from '@/modules/forum-proposals/utils';

export function ForumProposals() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>(ALL_FORUM_PROPOSAL_CATEGORIES);
  const [debouncedSearch] = useDebouncedValue(search.trim(), 300);

  const queryVariables = useMemo(
    () => ({
      limit: FORUM_PROPOSALS_PAGE_SIZE,
      order: 'DESC' as const,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(category !== ALL_FORUM_PROPOSAL_CATEGORIES ? { proposalType: category } : {}),
    }),
    [category, debouncedSearch]
  );

  const { data, error, fetchNextPage, hasNextPage, isError, isFetchingNextPage, isLoading, refetch } =
    useForumProposals({ variables: queryVariables });

  const { loadMoreRef, visiblePageCount, isLoadingMore } = useScrollPagination({
    pageCount: data?.pages.length ?? 0,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
    minDelay: FORUM_PROPOSALS_LOAD_MORE_MIN_DELAY,
  });

  const proposals = useMemo(
    () => data?.pages.slice(0, visiblePageCount).flatMap((page) => page.data.map(toProposalCard)) ?? [],
    [data, visiblePageCount]
  );

  const errorMessage = error instanceof Error ? error.message : 'Unable to load proposals.';

  return (
    <main className='min-h-screen bg-background px-[44px] pt-[25px] pb-12'>
      <div className='mx-auto max-w-[781px]'>
        <div className='mb-5 flex items-start justify-between gap-4'>
          <h1 className='font-bold font-serif text-[26px] text-primary leading-8'>Community Governance</h1>
          <NewTopicDialog />
        </div>

        <ForumProposalFilters
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        {isError ? (
          <div className='border border-border bg-card px-4 py-5 text-center text-muted-foreground text-sm'>
            <p>{errorMessage}</p>
            <button
              type='button'
              className='mt-3 font-semibold text-primary text-xs uppercase'
              onClick={() => refetch()}
            >
              Try again
            </button>
          </div>
        ) : (
          <ForumProposalList
            proposals={proposals}
            isLoading={isLoading}
            isFiltered={!!debouncedSearch || category !== ALL_FORUM_PROPOSAL_CATEGORIES}
            isLoadingMore={isLoadingMore}
            loadMoreRef={loadMoreRef}
          />
        )}
      </div>
    </main>
  );
}
