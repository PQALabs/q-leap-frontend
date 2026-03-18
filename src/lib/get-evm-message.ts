/**
 * Extract a human-readable error message from an EVM / wallet error.
 *
 * Viem errors typically have this structure:
 * - error.shortMessage → concise one-liner (e.g. "User rejected the request.")
 * - error.details → more context from the RPC
 * - error.cause?.reason → contract revert reason (e.g. "invalid sender")
 * - error.cause?.shortMessage → nested viem error
 * - error.metaMessages → array of extra context lines
 */
export function getEvmMessage(error: any): string {
  if (!error) return 'An unknown error occurred';

  // ── Wallet rejection (MetaMask, etc.) ──
  const code = error?.code ?? error?.cause?.code;
  if (code === 4001 || code === -32003) {
    return 'Transaction rejected by user';
  }

  // ── Contract revert reason (e.g. "invalid sender", "insufficient balance") ──
  const revertReason =
    error?.cause?.reason || error?.cause?.data?.message || error?.cause?.shortMessage || error?.data?.message;
  if (revertReason) {
    return `Contract error: ${revertReason}`;
  }

  // ── Viem shortMessage (clean one-liner) ──
  if (error?.shortMessage) {
    return error.shortMessage;
  }

  // ── RPC details ──
  if (error?.details) {
    return error.details;
  }

  // ── Fallback to raw message, truncated ──
  if (error?.message) {
    // Take only the first line to avoid huge stack traces
    const firstLine = error.message.split('\n')[0];
    return firstLine.length > 150 ? `${firstLine.slice(0, 150)}…` : firstLine;
  }

  return 'An unknown error occurred. Please try again.';
}
