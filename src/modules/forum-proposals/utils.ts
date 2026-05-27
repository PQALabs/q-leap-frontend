import { formatDistanceToNow } from 'date-fns';
import removeMarkdown from 'remove-markdown';
import type { IForumProposal } from '@/api/forum';
import { formatAddress } from '@/lib/utils';
import type { Proposal } from './types';

export function formatCreatedAt(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

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

export function markdownToPlainText(source: string) {
  return removeMarkdown(source, {
    gfm: true,
    stripListLeaders: true,
    useImgAltText: true,
  })
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateMarkdownText(source: string, maxLength: number) {
  const text = markdownToPlainText(source);

  if (text.length <= maxLength) {
    return text;
  }

  const slice = text.slice(0, maxLength);
  const lastSpaceIndex = slice.lastIndexOf(' ');
  const truncatedText = lastSpaceIndex > maxLength * 0.7 ? slice.slice(0, lastSpaceIndex) : slice;

  return `${truncatedText.trimEnd()}...`;
}
