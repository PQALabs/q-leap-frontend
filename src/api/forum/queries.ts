import { createInfiniteQuery, createQuery } from 'react-query-kit';
import { queryKeys } from '@/constants/query-keys';
import {
  getForumCommentRepliesRequest,
  getForumCommentsRequest,
  getForumProposalRequest,
  getForumProposalsRequest,
} from './requests';
import type {
  IForumCommentsParams,
  IForumCommentsResponse,
  IForumProposal,
  IForumProposalsParams,
  IForumProposalsResponse,
} from './types';

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

export const useForumProposal = createQuery<IForumProposal, string, Error>({
  queryKey: queryKeys.forum.proposal(),
  fetcher: getForumProposalRequest,
});

export const useForumCommentReplies = createInfiniteQuery<
  IForumCommentsResponse,
  IForumCommentsParams & { proposalId: string; commentId: string },
  Error,
  number
>({
  queryKey: queryKeys.forum.commentReplies(),
  initialPageParam: 1,
  fetcher: ({ proposalId, commentId, ...params }, { pageParam }) =>
    getForumCommentRepliesRequest(proposalId, commentId, { ...params, page: pageParam }),
  getNextPageParam: (lastPage) => {
    const { currentPage, totalPages } = lastPage.meta;

    return currentPage < totalPages ? currentPage + 1 : undefined;
  },
});

export const useForumComments = createInfiniteQuery<
  IForumCommentsResponse,
  IForumCommentsParams & { proposalId: string },
  Error,
  number
>({
  queryKey: queryKeys.forum.comments(),
  initialPageParam: 1,
  fetcher: ({ proposalId, ...params }, { pageParam }) =>
    getForumCommentsRequest(proposalId, { ...params, page: pageParam }),
  getNextPageParam: (lastPage) => {
    const { currentPage, totalPages } = lastPage.meta;

    return currentPage < totalPages ? currentPage + 1 : undefined;
  },
});
