import type { TListResponse } from '@/types';

export const FORUM_PROPOSAL_TYPES = ['Governance', 'Risk', 'Treasury', 'Development', 'Others'] as const;

export type ForumProposalType = (typeof FORUM_PROPOSAL_TYPES)[number];

export interface IForumProposal {
  id: string;
  title: string;
  description: string | null;
  authorAddress: string;
  proposalType: ForumProposalType | null;
  snapshotId: string | null;
  onchainId: string | null;
  signature: string;
  signatureTimestamp: number;
  createdAt: string;
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

export interface ICreateForumProposalRequest {
  title: string;
  description: string;
  proposalType?: ForumProposalType;
  snapshotId?: string;
  onchainId?: string;
  signatureTimestamp: number;
}

export interface ICreateForumProposalResponse {
  meta: {
    code: number;
    message: string;
  };
  data: IForumProposal;
}
