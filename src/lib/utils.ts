import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  return mobileRegex.test(userAgent.toLowerCase());
};

/**
 * Truncates a number to the given number of decimal places WITHOUT rounding.
 * e.g. truncateDecimals(1.239, 2) === "1.23"
 */
export const truncateDecimals = (value: number, decimals: number = 2): string => {
  const factor = Math.pow(10, decimals);
  const truncated = Math.trunc(value * factor) / factor;
  return truncated.toFixed(decimals);
};
