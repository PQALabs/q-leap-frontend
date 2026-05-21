import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { request } from '../client';
import type {
  IAuthLoginRequest,
  IAuthLoginResponse,
  IAuthLogoutRequest,
  IAuthLogoutResponse,
  IAuthMeData,
  IAuthMeResponse,
  IAuthNonceRequest,
  IAuthNonceResponse,
  IAuthPreferencesRequest,
  IAuthPreferencesResponse,
  IAuthUser,
} from './types';

export const getAuthNonceRequest = async (data: IAuthNonceRequest): Promise<{ nonce: number }> => {
  const { data: response } = await request<IAuthNonceResponse>({
    url: '/auth/nonce',
    method: 'POST',
    data,
  });
  return response.data;
};

export const loginRequest = async (data: IAuthLoginRequest): Promise<{ token: string }> => {
  const { data: response } = await request<IAuthLoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data,
  });
  return response.data;
};

export const getAuthMeRequest = async (token?: string): Promise<IAuthMeData> => {
  const { data: response } = await request<IAuthMeResponse>({
    url: '/auth/me',
    method: 'GET',
    ...(token && { headers: { Authorization: `Bearer ${token}` } }),
  });
  return response.data;
};

export const logoutRequest = async (data: IAuthLogoutRequest = {}): Promise<IAuthLogoutResponse> => {
  const { data: response } = await request<IAuthLogoutResponse>({
    url: '/auth/logout',
    method: 'POST',
    data,
  });
  return response;
};

export const updateAuthPreferencesRequest = async (
  data: IAuthPreferencesRequest,
  signature: string
): Promise<IAuthUser> => {
  const token = useForumAuthStore.getState().token;
  const { data: response } = await request<IAuthPreferencesResponse>({
    url: '/auth/me/preferences',
    method: 'PATCH',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      'X-Signature': signature,
    },
    data,
  });
  return response.data;
};
