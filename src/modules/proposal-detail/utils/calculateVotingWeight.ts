/**
 * Returns a multiplier in [0, 1] based on lock duration relative to the max.
 * 0 days locked = 0×, max days locked = 1× (linear).
 */
export function computeMultiplier(lockDurationDays: number, maxLockDays = 1460): number {
  if (lockDurationDays <= 0) return 0;
  return Math.min(lockDurationDays / maxLockDays, 1);
}

/**
 * Returns voting weight = token_balance × multiplier.
 */
export function computeVotingWeight(tokenBalance: number, lockDurationDays: number, maxLockDays = 1460): number {
  return tokenBalance * computeMultiplier(lockDurationDays, maxLockDays);
}

/**
 * Formats a number of days into a human-readable duration string.
 */
export function formatLockDurationLabel(days: number): string {
  if (days >= 365) {
    const years = days / 365;
    const rounded = Math.round(years * 10) / 10;
    return `${rounded} year${rounded !== 1 ? 's' : ''}`;
  }
  if (days >= 30) return `${Math.floor(days / 30)} months`;
  return `${days} days`;
}
