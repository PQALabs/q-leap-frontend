import type { UserRole } from '@/api/auth/types';

export interface IUserProfile {
  id: number;
  walletAddress: string;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface IUserProfileResponse {
  data: IUserProfile;
}

export interface IUpdateProfileRequest {
  username?: string | null;
  email?: string | null;
  avatarUrl?: string;
}

export interface IAvatarPresignedUrlRequest {
  extension: 'png' | 'jpg' | 'jpeg' | 'webp' | 'gif';
}

export interface IAvatarPresignedUrlData {
  presignedUrl: string;
  objectKey: string;
  publicUrl: string;
}

export interface IAvatarPresignedUrlResponse {
  data: IAvatarPresignedUrlData;
}
