import type { TListResponse } from '@/types';

export const FORUM_PROPOSAL_TYPES = ['Governance', 'Risk', 'Treasury', 'Development', 'Others'] as const;

export type ForumProposalType = (typeof FORUM_PROPOSAL_TYPES)[number];
export type ForumUserRole = 'user' | 'moderator' | 'admin';

export interface IForumProposal {
  id: string;
  title: string;
  description: string | null;
  authorAddress: string;
  proposalType: ForumProposalType | null;
  snapshotId: string | null;
  onchainId: string | null;
  signature: string;
  signatureTimestamp: number | string;
  createdAt: string;
  updatedAt?: string | null;
  deletedAt?: string | null;
  totalComments?: number;
  uniqueCommenters?: number;
}

export interface IForumProposalsParams {
  page?: number;
  limit?: number;
  search?: string;
  proposalType?: ForumProposalType;
  sortBy?: 'createdAt';
  order?: 'ASC' | 'DESC';
}

export type IForumProposalsResponse = TListResponse<IForumProposal>;

export interface IForumProposalResponse {
  meta: {
    code: number;
    message: string;
  };
  data: IForumProposal | null;
}

export interface ICreateForumProposalRequest {
  title: string;
  description: string;
  proposalType?: ForumProposalType;
  snapshotId?: string;
  onchainId?: string;
  signatureTimestamp?: number;
}

export interface ICreateForumProposalResponse {
  meta: {
    code: number;
    message: string;
  };
  data: IForumProposal;
}

export interface IForumComment {
  id: string;
  proposalId: string;
  parentCommentId: string | null;
  authorAddress: string;
  authorRole?: ForumUserRole;
  contentMarkdown: string;
  contentHtml: string;
  upvotes: number;
  replyCount: number;
  pinned: boolean;
  pinnedAt: string | null;
  pinnedByAddress: string | null;
  editedCount: number;
  signature?: string | null;
  signatureTimestamp?: number | string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface IForumCommentsParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'upvotes' | 'createdAt,upvotes' | 'upvotes,createdAt';
  order?: 'ASC' | 'DESC' | 'ASC,ASC' | 'ASC,DESC' | 'DESC,ASC' | 'DESC,DESC';
  type?: 'top_level' | 'all';
  authorAddress?: string;
}

export type IForumCommentsResponse = TListResponse<IForumComment>;

export interface IForumCommentAnchor {
  targetCommentId: string;
  rootCommentId: string;
  ancestorCommentIds: string[];
  rootPage: number;
  replyPages: Record<string, number>;
}

export interface IForumCommentAnchorResponse {
  meta: {
    code: number;
    message: string;
  };
  data: IForumCommentAnchor;
}

export interface ICreateCommentRequest {
  contentMarkdown: string;
  contentHtml: string;
  signatureTimestamp?: number;
}

export interface ICommentMutationResponse {
  meta: {
    code: number;
    message: string;
  };
  data: IForumComment;
}

export interface IUpvoteCommentResponse {
  upvoted: boolean;
  upvotes: number;
}

export interface IDeleteCommentRequest {
  signatureTimestamp?: number;
}

export interface IPinCommentRequest {
  signatureTimestamp: number;
}

export interface IUpdateCommentRequest {
  contentMarkdown: string;
  contentHtml: string;
  signatureTimestamp?: number;
}

export interface IReportCommentBody {
  reason: string;
  signatureTimestamp?: number;
}

export interface IReportCommentResponse {
  meta: { code: number; message: string };
  data: {
    id: number;
    commentId: string;
    reporterAddress: string;
    reason: string;
    status: 'pending' | 'reviewed';
    reportedAt: string;
  };
}
