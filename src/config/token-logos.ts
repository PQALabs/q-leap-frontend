/** Token logo paths (stored in /public/token-icons/) */
export const TOKEN_LOGOS: Record<string, string> = {
  WABEL: '/token-icons/WABEL.svg',
  WQDAY: '/token-icons/WQDAY.svg',
  USD8S: '/token-icons/USD8.png',
};

/** Get token logo URL by symbol, returns undefined if not found */
export function getTokenLogoUrl(symbol: string): string | undefined {
  return TOKEN_LOGOS[symbol.toUpperCase()];
}
