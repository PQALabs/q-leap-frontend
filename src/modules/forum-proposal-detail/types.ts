import type { ForumProposalType } from '@/api/forum';

export type SnapshotVote = {
  label: string;
  value: string;
  percentage: number;
  tone: 'success' | 'danger' | 'muted';
};

export type ThreadStat = {
  label: string;
  value: string;
};

export type ProposalReply = {
  id: string;
  author: string;
  role: string;
  date: string;
  content: string[];
  votes: number;
};

export type ProposalDetailViewModel = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  author: string;
  authorAddress: string;
  authorRole: string;
  createdAt: string;
  category: ForumProposalType | null;
  snapshotId: string | null;
  snapshotUrl: string | null;
  totalComments: number;
  uniqueCommenters: number;
};
