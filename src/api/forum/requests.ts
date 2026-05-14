import { request } from '../client';
import type {
  ICreateForumProposalRequest,
  ICreateForumProposalResponse,
  IForumProposalsParams,
  IForumProposalsResponse,
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
