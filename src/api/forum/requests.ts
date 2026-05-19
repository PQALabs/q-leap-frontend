import { request } from '../client';
import type {
  ICommentMutationResponse,
  ICreateCommentRequest,
  ICreateForumProposalRequest,
  ICreateForumProposalResponse,
  IDeleteCommentRequest,
  IForumComment,
  IForumCommentsParams,
  IForumCommentsResponse,
  IForumProposalResponse,
  IForumProposalsParams,
  IForumProposalsResponse,
  IUpdateCommentRequest,
  IUpvoteCommentResponse,
} from './types';

export const getForumProposalsRequest = async (params: IForumProposalsParams = {}) => {
  const { data } = await request<IForumProposalsResponse>({
    url: '/forum/proposals',
    method: 'GET',
    params: {
      limit: 10,
      sortBy: 'createdAt',
      order: 'DESC',
      ...params,
    },
  });

  return data;
};

export const getForumProposalRequest = async (proposalId: string) => {
  const { data } = await request<IForumProposalResponse>({
    url: `/forum/proposals/${proposalId}`,
    method: 'GET',
  });

  if (!data.data) {
    throw new Error(data.meta.message || 'Proposal not found');
  }

  return data.data;
};

export const createForumProposalRequest = async ({
  payload,
  signature,
}: {
  payload: ICreateForumProposalRequest;
  signature: string;
}) => {
  const { data } = await request<ICreateForumProposalResponse>({
    url: '/forum/proposals',
    method: 'POST',
    headers: {
      'X-Signature': signature,
    },
    data: payload,
  });

  return data.data;
};

export const getForumCommentsRequest = async (proposalId: string, params: IForumCommentsParams = {}) => {
  const { data } = await request<IForumCommentsResponse>({
    url: `/forum/proposals/${proposalId}/comments`,
    method: 'GET',
    params: {
      limit: 10,
      sortBy: 'upvotes,createdAt',
      order: 'DESC,DESC',
      ...params,
    },
  });

  return data;
};

export const createForumCommentRequest = async ({
  proposalId,
  payload,
  signature,
}: {
  proposalId: string;
  payload: ICreateCommentRequest;
  signature: string;
}) => {
  const { data } = await request<ICommentMutationResponse>({
    url: `/forum/proposals/${proposalId}/comments`,
    method: 'POST',
    headers: { 'X-Signature': signature },
    data: payload,
  });

  return data.data;
};

export const createForumReplyRequest = async ({
  proposalId,
  commentId,
  payload,
  signature,
}: {
  proposalId: string;
  commentId: string;
  payload: ICreateCommentRequest;
  signature: string;
}) => {
  const { data } = await request<ICommentMutationResponse>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}/replies`,
    method: 'POST',
    headers: { 'X-Signature': signature },
    data: payload,
  });

  return data.data;
};

export const getForumCommentRepliesRequest = async (
  proposalId: string,
  commentId: string,
  params: IForumCommentsParams = {}
) => {
  const { data } = await request<IForumCommentsResponse>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}/replies`,
    method: 'GET',
    params: {
      limit: 20,
      ...params,
    },
  });

  return data;
};

export const updateForumCommentRequest = async ({
  proposalId,
  commentId,
  payload,
  signature,
}: {
  proposalId: string;
  commentId: string;
  payload: IUpdateCommentRequest;
  signature: string;
}): Promise<IForumComment> => {
  const { data } = await request<IForumComment>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}`,
    method: 'PATCH',
    headers: { 'X-Signature': signature },
    data: payload,
  });

  return data;
};

export const deleteForumCommentRequest = async ({
  proposalId,
  commentId,
  payload,
  signature,
}: {
  proposalId: string;
  commentId: string;
  payload: IDeleteCommentRequest;
  signature: string;
}) => {
  await request({
    url: `/forum/proposals/${proposalId}/comments/${commentId}`,
    method: 'DELETE',
    headers: { 'X-Signature': signature },
    data: payload,
  });
};

export const upvoteForumCommentRequest = async ({
  proposalId,
  commentId,
  payload,
  signature,
}: {
  proposalId: string;
  commentId: string;
  payload: { signatureTimestamp: number };
  signature: string;
}) => {
  const { data } = await request<IUpvoteCommentResponse>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}/upvote`,
    method: 'PUT',
    headers: { 'X-Signature': signature },
    data: payload,
  });

  return data;
};
