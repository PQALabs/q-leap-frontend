import { format } from 'date-fns';
import removeMarkdown from 'remove-markdown';
import type { IForumProposal } from '@/api/forum';
import { formatAddress } from '@/lib/utils';
import { DEFAULT_AUTHOR_ROLE, FALLBACK_DESCRIPTION } from '../constants';
import type { ProposalDetailViewModel } from '../types';

export function formatProposalDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return format(date, 'MMM d');
}

export function formatProposalDateFull(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return format(date, 'PPp');
}

export function markdownToText(source: string) {
  return removeMarkdown(source, {
    gfm: true,
    stripListLeaders: true,
    useImgAltText: true,
  })
    .replace(/\s+/g, ' ')
    .trim();
}

export function getProposalSubtitle(description: string) {
  const text = markdownToText(description);

  if (!text) {
    return 'Community proposal for review and discussion.';
  }

  const firstSentence = text.match(/^(.+?[.!?])\s/)?.[1] ?? text;

  return firstSentence.length > 160 ? `${firstSentence.slice(0, 157).trimEnd()}...` : firstSentence;
}

export function getSnapshotUrl(snapshotId: string | null) {
  if (!snapshotId) {
    return null;
  }

  return `https://snapshot.org/#/proposal/${snapshotId}`;
}

export function toProposalDetail(proposal: IForumProposal): ProposalDetailViewModel {
  const description = proposal.description?.trim() || FALLBACK_DESCRIPTION;

  return {
    id: proposal.id,
    title: proposal.title,
    subtitle: getProposalSubtitle(description),
    description,
    author: formatAddress(proposal.authorAddress),
    authorAddress: proposal.authorAddress,
    authorRole: DEFAULT_AUTHOR_ROLE,
    createdAt: formatProposalDate(proposal.createdAt),
    category: proposal.proposalType,
    snapshotId: proposal.snapshotId,
    snapshotUrl: getSnapshotUrl(proposal.snapshotId),
    totalComments: proposal.totalComments ?? 0,
    uniqueCommenters: proposal.uniqueCommenters ?? 0,
  };
}
