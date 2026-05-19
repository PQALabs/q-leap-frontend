'use client';

import { useMemo } from 'react';
import { useForumProposal } from '@/api/forum';
import { toProposalDetail } from '../utils';

export function useForumProposalDetail(proposalId: string) {
  const query = useForumProposal({
    variables: proposalId,
    enabled: Boolean(proposalId),
  });

  const proposal = useMemo(() => (query.data ? toProposalDetail(query.data) : null), [query.data]);

  return {
    ...query,
    proposal,
  };
}
