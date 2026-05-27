import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { request } from '../client';
import type {
  ICommentMutationResponse,
  ICreateCommentRequest,
  ICreateForumProposalRequest,
  ICreateForumProposalResponse,
  IDeleteCommentRequest,
  IForumComment,
  IForumCommentAnchorResponse,
  IForumCommentsParams,
  IForumCommentsResponse,
  IForumProposalResponse,
  IForumProposalsParams,
  IForumProposalsResponse,
  IPinCommentRequest,
  IReportCommentBody,
  IReportCommentResponse,
  IUpdateCommentRequest,
  IUpvoteCommentResponse,
} from './types';

function getAuthHeaders(signature?: string): Record<string, string> {
  const token = useForumAuthStore.getState().token;
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(signature && { 'X-Signature': signature }),
  };
}

function unwrapCommentResponse(response: ICommentMutationResponse | IForumComment): IForumComment {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

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
  signature?: string;
}) => {
  const { data } = await request<ICreateForumProposalResponse>({
    url: '/forum/proposals',
    method: 'POST',
    headers: getAuthHeaders(signature),
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
  signature?: string;
}) => {
  const { data } = await request<ICommentMutationResponse>({
    url: `/forum/proposals/${proposalId}/comments`,
    method: 'POST',
    headers: getAuthHeaders(signature),
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
  signature?: string;
}) => {
  const { data } = await request<ICommentMutationResponse>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}/replies`,
    method: 'POST',
    headers: getAuthHeaders(signature),
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

export const getForumCommentAnchorRequest = async (
  proposalId: string,
  commentId: string,
  params: IForumCommentsParams = {}
) => {
  const { data } = await request<IForumCommentAnchorResponse>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}/anchor`,
    method: 'GET',
    params: {
      limit: 10,
      sortBy: 'upvotes,createdAt',
      order: 'DESC,DESC',
      ...params,
    },
  });

  return data.data;
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
  signature?: string;
}): Promise<IForumComment> => {
  const { data } = await request<ICommentMutationResponse>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}`,
    method: 'PATCH',
    headers: getAuthHeaders(signature),
    data: payload,
  });

  return data.data;
};

export const deleteForumCommentRequest = async ({
  proposalId,
  commentId,
  payload,
  signature,
}: {
  proposalId: string;
  commentId: string;
  payload?: IDeleteCommentRequest;
  signature?: string;
}) => {
  await request({
    url: `/forum/proposals/${proposalId}/comments/${commentId}`,
    method: 'DELETE',
    headers: getAuthHeaders(signature),
    data: payload,
  });
};

export const reportForumCommentRequest = async ({
  proposalId,
  commentId,
  payload,
  signature,
}: {
  proposalId: string;
  commentId: string;
  payload: IReportCommentBody;
  signature?: string;
}) => {
  const { data } = await request<IReportCommentResponse>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}/report`,
    method: 'POST',
    headers: getAuthHeaders(signature),
    data: payload,
  });
  return data.data;
};

export const upvoteForumCommentRequest = async ({
  proposalId,
  commentId,
  payload,
  signature,
}: {
  proposalId: string;
  commentId: string;
  payload?: { signatureTimestamp: number };
  signature?: string;
}) => {
  const { data } = await request<IUpvoteCommentResponse>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}/upvote`,
    method: 'PUT',
    headers: getAuthHeaders(signature),
    data: payload,
  });

  return data;
};

export const pinForumCommentRequest = async ({
  proposalId,
  commentId,
  payload,
  signature,
}: {
  proposalId: string;
  commentId: string;
  payload: IPinCommentRequest;
  signature: string;
}): Promise<IForumComment> => {
  const { data } = await request<ICommentMutationResponse | IForumComment>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}/pin`,
    method: 'PUT',
    headers: getAuthHeaders(signature),
    data: payload,
  });

  return unwrapCommentResponse(data);
};

export const unpinForumCommentRequest = async ({
  proposalId,
  commentId,
  payload,
  signature,
}: {
  proposalId: string;
  commentId: string;
  payload: IPinCommentRequest;
  signature: string;
}): Promise<IForumComment> => {
  const { data } = await request<ICommentMutationResponse | IForumComment>({
    url: `/forum/proposals/${proposalId}/comments/${commentId}/pin`,
    method: 'DELETE',
    headers: getAuthHeaders(signature),
    data: payload,
  });

  return unwrapCommentResponse(data);
};
