import { request } from '../client';
import type {
  IAvatarPresignedUrlData,
  IAvatarPresignedUrlRequest,
  IAvatarPresignedUrlResponse,
  IUpdateProfileRequest,
  IUserProfile,
  IUserProfileResponse,
} from './types';

export const getUserProfileRequest = async (): Promise<IUserProfile> => {
  const { data: response } = await request<IUserProfileResponse>({
    url: '/users/me/profile',
    method: 'GET',
  });
  return response.data;
};

export const updateUserProfileRequest = async (data: IUpdateProfileRequest): Promise<IUserProfile> => {
  const { data: response } = await request<IUserProfileResponse>({
    url: '/users/me/profile',
    method: 'PATCH',
    data,
  });
  return response.data;
};

export const getAvatarPresignedUrlRequest = async (
  data: IAvatarPresignedUrlRequest
): Promise<IAvatarPresignedUrlData> => {
  const { data: response } = await request<IAvatarPresignedUrlResponse>({
    url: '/users/me/avatar/presigned-url',
    method: 'POST',
    data,
  });
  return response.data;
};

export const uploadAvatarToObs = async (presignedUrl: string, file: File): Promise<void> => {
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: arrayBuffer,
  });
  if (!response.ok) {
    throw new Error(`OBS upload failed: ${response.status}`);
  }
};
