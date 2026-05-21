export type UserRole = 'user' | 'moderator' | 'admin';

export interface IAuthUser {
  id: number;
  walletAddress: string;
  role: UserRole;
  requireSignature: boolean;
  isActive: boolean;
}

export interface IAuthSession {
  id: string;
  nonce: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
  current?: boolean;
}

export interface IApiMeta {
  code: number;
  message: string;
}

export interface IAuthNonceRequest {
  address: string;
}

export interface IAuthNonceResponse {
  meta: IApiMeta;
  data: { nonce: number };
}

export interface IAuthLoginRequest {
  address: string;
  nonce: number;
  signature: string;
}

export interface IAuthLoginResponse {
  meta: IApiMeta;
  data: { token: string };
}

export interface IAuthMeData {
  sessionId: string;
  user: IAuthUser;
  activeSessions: IAuthSession[];
}

export interface IAuthMeResponse {
  meta: IApiMeta;
  data: IAuthMeData;
}

export interface IAuthLogoutRequest {
  deactivateAllSessions?: boolean;
}

export interface IAuthLogoutResponse {
  loggedOut: boolean;
  deactivatedSessions: number;
}

export interface IAuthPreferencesRequest {
  requireSignature: boolean;
  signatureTimestamp: number;
}

export interface IAuthPreferencesResponse {
  meta: IApiMeta;
  data: IAuthUser;
}
