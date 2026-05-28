export function formatBanExpiry(expiresAt: string | null): string {
  if (!expiresAt) return 'Permanent';

  return new Date(expiresAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
