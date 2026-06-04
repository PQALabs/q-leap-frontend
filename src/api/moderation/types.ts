export interface IModerator {
  id: number;
  walletAddress: string;
  role: 'moderator';
  isActive: boolean;
  createdAt: string;
}

export interface IBannedAddress {
  address: string;
  bannedAt: string;
  expiresAt: string | null;
  reason: string | null;
  bannedBy: string;
}

export interface IGetModeratorsResponse {
  meta: { code: number; message: string };
  data: IModerator[];
}

export interface IAddModeratorResponse {
  meta: { code: number; message: string };
  data: IModerator;
}

export interface IBanAddressResponse {
  meta: { code: number; message: string };
  data: IBannedAddress;
}

export interface IGetBannedAddressesResponse {
  meta: { code: number; message: string };
  data: IBannedAddress[];
}

export interface IAddModeratorBody {
  signatureTimestamp: number;
}

export interface IRemoveModeratorBody {
  signatureTimestamp: number;
}

export interface IBanAddressBody {
  signatureTimestamp: number;
  reason?: string | null;
  expiresAt?: string | null;
}

export interface IUnbanAddressBody {
  signatureTimestamp: number;
}

export type CommentReportStatus = 'pending' | 'reviewed' | 'rejected';

export interface ICommentReportItem {
  id: number;
  commentId: string;
  reporterAddress: string;
  reason: string;
  status: CommentReportStatus;
  reportedAt: string;
  comment: {
    id: string;
    proposalId: string;
    authorAddress: string;
    contentMarkdown: string;
    contentHtml: string;
    deletedAt: string | null;
    authorBan: {
      address: string;
      bannedAt: string;
      expiresAt: string | null;
      reason: string | null;
      bannedBy: string;
    } | null;
  };
}

export interface ICommentReportListParams {
  status?: CommentReportStatus;
  commentId?: string;
  page?: number;
  limit?: number;
}

export interface ICommentReportListResponse {
  meta: {
    code: number;
    message: string;
    itemCount: number;
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  data: ICommentReportItem[];
}
