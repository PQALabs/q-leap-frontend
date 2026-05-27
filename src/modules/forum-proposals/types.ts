import type { ForumProposalType } from '@/api/forum';
import type { ALL_FORUM_PROPOSAL_CATEGORIES } from './constants';

export type CategoryFilter = typeof ALL_FORUM_PROPOSAL_CATEGORIES | ForumProposalType;

export type Proposal = {
  id: string;
  category: ForumProposalType | null;
  author: string;
  createdAt: string;
  title: string;
  description: string;
  totalComments: string;
  uniqueCommenters: string;
};
