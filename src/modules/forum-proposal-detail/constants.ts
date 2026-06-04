import type { SnapshotVote } from './types';

export const DEFAULT_AUTHOR_ROLE = 'Q-Shield contributor';
export const FORUM_COMMENTS_PAGE_SIZE = 10;

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
