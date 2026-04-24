/** Display symbol overrides — e.g. wrapped native tokens shown as their unwrapped symbol */
const DISPLAY_SYMBOLS: Record<string, string> = {
  WQDAY: 'WQDAY',
};

/** Display name overrides — e.g. human-readable token names */
const DISPLAY_NAME: Record<string, string> = {
  WQDAY: 'Wrapped QDay',
  WABEL: 'Wrapped Abelian',
};

export function getDisplaySymbol(symbol: string): string {
  return DISPLAY_SYMBOLS[symbol.toUpperCase()] ?? symbol;
}

export function getDisplayName(symbol: string): string {
  return DISPLAY_NAME[symbol.toUpperCase()] ?? symbol;
}
