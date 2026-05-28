import type { IForumProposal } from '@/api/forum';
import { formatAddress } from '@/lib/utils';
import type { Proposal } from '../types';

export function toProposalCard(proposal: IForumProposal): Proposal {
  return {
    id: proposal.id,
    category: proposal.proposalType,
    author: formatAddress(proposal.authorAddress),
    createdAt: proposal.createdAt,
    title: proposal.title,
    description: proposal.description ?? '',
    totalComments: proposal.totalComments?.toString() ?? '0',
    uniqueCommenters: proposal.uniqueCommenters?.toString() ?? '0',
  };
}
