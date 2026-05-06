import { useMemo } from 'react';
import type { VotingWeightInfo } from '@/modules/proposal-detail/proposal-voting';
import {
  computeMultiplier,
  computeVotingWeight,
  formatLockDurationLabel,
} from '@/modules/proposal-detail/utils/calculateVotingWeight';

// Adjust these constants to test different scenarios
const MOCK_TOKEN_BALANCE = 1000;
const MOCK_LOCK_DURATION_DAYS = 730; // 2 years
const MAX_LOCK_DAYS = 1460; // 4 years (standard veToken max)

/**
 * Returns a static VotingWeightInfo for development purposes.
 * When the contract is ready, replace with useVotingWeight() — no UI changes needed.
 */
export function useMockVotingWeight(): VotingWeightInfo {
  return useMemo(() => {
    const multiplier = computeMultiplier(MOCK_LOCK_DURATION_DAYS, MAX_LOCK_DAYS);
    const weight = computeVotingWeight(MOCK_TOKEN_BALANCE, MOCK_LOCK_DURATION_DAYS, MAX_LOCK_DAYS);

    return {
      tokenBalance: MOCK_TOKEN_BALANCE.toFixed(2),
      lockDurationDays: MOCK_LOCK_DURATION_DAYS,
      lockDurationLabel: formatLockDurationLabel(MOCK_LOCK_DURATION_DAYS),
      multiplier: parseFloat(multiplier.toFixed(4)),
      votingWeight: weight.toFixed(2),
      maxLockDays: MAX_LOCK_DAYS,
      percentOfMax: multiplier,
    };
  }, []);
}
