import type { ProposalReply, SnapshotVote, ThreadStat } from './types';

export const DEFAULT_AUTHOR_ROLE = 'Q-Shield contributor';
export const FORUM_COMMENT_SIGNATURE_PREFIX = 'QLEAP:CREATE_COMMENT';
export const FORUM_UPVOTE_SIGNATURE_PREFIX = 'QLEAP:UPVOTE_COMMENT';
export const FORUM_DELETE_COMMENT_SIGNATURE_PREFIX = 'QLEAP:DELETE_COMMENT';
export const FORUM_EDIT_COMMENT_SIGNATURE_PREFIX = 'QLEAP:EDIT_COMMENT';
export const FORUM_REPORT_COMMENT_SIGNATURE_PREFIX = 'QLEAP:REPORT_COMMENT';
export const FORUM_PIN_COMMENT_SIGNATURE_PREFIX = 'QLEAP:PIN_COMMENT';
export const FORUM_UNPIN_COMMENT_SIGNATURE_PREFIX = 'QLEAP:UNPIN_COMMENT';
export const FORUM_COMMENTS_PAGE_SIZE = 10;

export const SNAPSHOT_VOTES: SnapshotVote[] = [
  {
    label: 'For',
    value: '617k',
    percentage: 79,
    tone: 'success',
  },
  {
    label: 'Against',
    value: '4.9k',
    percentage: 1,
    tone: 'danger',
  },
  {
    label: 'Abstain',
    value: '158k',
    percentage: 20,
    tone: 'muted',
  },
];

export const THREAD_STATS: ThreadStat[] = [
  {
    label: 'views',
    value: '17.3k',
  },
  {
    label: 'comments',
    value: '35',
  },
  {
    label: 'contributors',
    value: '60',
  },
];

export const FALLBACK_DESCRIPTION = `## Summary

The core aim of this proposal is to refine controls around protocol risk, improve capital efficiency, and keep contributors aligned around transparent governance execution.

## Motivation

The proposal introduces a practical operating model for review, execution, and post-vote monitoring. It is designed to keep implementation steps clear for voters while preserving enough context for contributors who need to evaluate risk and governance impact.

## Risk considerations

- Market conditions can change between forum review and execution.
- Operational ownership should be explicit before the proposal moves on-chain.
- Monitoring should remain active after implementation so contributors can identify regressions early.

## Recommendation

Proceed with the proposal if the implementation owner confirms the final parameters and publishes the execution transaction for review before submission.`;

export const FEATURED_REPLIES: ProposalReply[] = [
  {
    id: 'reply-1',
    author: 'ApuMaliku',
    role: 'Risk contributor',
    date: 'Apr 19',
    votes: 18,
    content: [
      'I support moving this forward, provided the final execution payload stays visible before the vote is queued.',
      'The risk section is clear enough for the current scope. The follow-up should focus on monitoring and public ownership once the proposal is executed.',
    ],
  },
];
