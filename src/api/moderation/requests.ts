import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { request } from '../client';
import type {
  IAddModeratorBody,
  IAddModeratorResponse,
  IBanAddressBody,
  IBanAddressResponse,
  IBannedAddress,
  ICommentReportListParams,
  ICommentReportListResponse,
  IGetBannedAddressesResponse,
  IGetModeratorsResponse,
  IModerationListParams,
  IModerator,
  IRemoveModeratorBody,
  IUnbanAddressBody,
} from './types';

function getAuthHeaders(signature?: string): Record<string, string> {
  const token = useForumAuthStore.getState().token;
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(signature && { 'X-Signature': signature }),
  };
}

export const getModeratorsRequest = async (params: IModerationListParams = {}): Promise<IGetModeratorsResponse> => {
  const { data } = await request<IGetModeratorsResponse>({
    url: '/moderation/moderators',
    method: 'GET',
    headers: getAuthHeaders(),
    params,
  });
  return data;
};

export const getBannedAddressesRequest = async (
  params: IModerationListParams = {}
): Promise<IGetBannedAddressesResponse> => {
  const { data } = await request<IGetBannedAddressesResponse>({
    url: '/moderation/addresses/banned',
    method: 'GET',
    headers: getAuthHeaders(),
    params,
  });
  return data;
};

export const addModeratorRequest = async ({
  address,
  body,
  signature,
}: {
  address: string;
  body: IAddModeratorBody;
  signature: string;
}): Promise<IModerator> => {
  const { data } = await request<IAddModeratorResponse>({
    url: `/moderation/moderators/${address}`,
    method: 'POST',
    headers: getAuthHeaders(signature),
    data: body,
  });
  return data.data;
};

export const removeModeratorRequest = async ({
  address,
  body,
  signature,
}: {
  address: string;
  body: IRemoveModeratorBody;
  signature: string;
}): Promise<void> => {
  await request({
    url: `/moderation/moderators/${address}`,
    method: 'DELETE',
    headers: getAuthHeaders(signature),
    data: body,
  });
};

export const banAddressRequest = async ({
  address,
  body,
  signature,
}: {
  address: string;
  body: IBanAddressBody;
  signature: string;
}): Promise<IBannedAddress> => {
  const { data } = await request<IBanAddressResponse>({
    url: `/moderation/addresses/${address}/ban`,
    method: 'POST',
    headers: getAuthHeaders(signature),
    data: body,
  });
  return data.data;
};

export const getAddressBanStatusRequest = async (address: string): Promise<IBannedAddress | null> => {
  const { data } = await request<IBanAddressResponse>({
    url: `/moderation/addresses/${address}/ban`,
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return data.data ?? null;
};

export const resolveCommentReportRequest = async (reportId: number): Promise<void> => {
  await request({
    url: `/moderation/comment-reports/${reportId}/resolve`,
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
};

export const rejectCommentReportRequest = async (reportId: number): Promise<void> => {
  await request({
    url: `/moderation/comment-reports/${reportId}/reject`,
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
};

export const getCommentReportsRequest = async (
  params: ICommentReportListParams = {}
): Promise<ICommentReportListResponse> => {
  const { data } = await request<ICommentReportListResponse>({
    url: '/moderation/comment-reports',
    method: 'GET',
    headers: getAuthHeaders(),
    params,
  });
  return data;
};

export const unbanAddressRequest = async ({
  address,
  body,
  signature,
}: {
  address: string;
  body: IUnbanAddressBody;
  signature: string;
}): Promise<void> => {
  await request({
    url: `/moderation/addresses/${address}/ban`,
    method: 'DELETE',
    headers: getAuthHeaders(signature),
    data: body,
  });
};
