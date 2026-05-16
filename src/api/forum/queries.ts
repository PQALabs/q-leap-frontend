import { createInfiniteQuery } from 'react-query-kit';
import { queryKeys } from '@/constants/query-keys';
import { getForumProposalsRequest } from './requests';
import type { IForumProposalsParams, IForumProposalsResponse } from './types';

export const useForumProposals = createInfiniteQuery<IForumProposalsResponse, IForumProposalsParams, Error, number>({
  queryKey: queryKeys.forum.proposals(),
  initialPageParam: 1,
  fetcher: (variables, { pageParam }) =>
    getForumProposalsRequest({
      ...variables,
      page: pageParam,
    }),
  getNextPageParam: (lastPage) => {
    const { currentPage, totalPages } = lastPage.meta;

    return currentPage < totalPages ? currentPage + 1 : undefined;
  },
});
