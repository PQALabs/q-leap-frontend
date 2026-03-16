export interface Asset {
  name: string;
  symbol: string;
  formattedSymbol?: string;
  color?: string;
  icon?: string;
  aIcon?: string;
  symbolFormatted?: string;
  symbolsArray?: string[];
  formattedName?: string;
  shortSymbol?: string;
}

export const assetsList: Asset[] = [];

export const assetsOrder: string[] = [];
export const stableAssets: string[] = [];
