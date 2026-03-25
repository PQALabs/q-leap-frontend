import { useCallback, useState } from 'react';

/**
 * useCopy — copies a string to the clipboard and tracks a brief "copied" state.
 *
 * @param timeout  How long the `copied` flag stays `true` (ms). Default 1500.
 * @returns `{ copied, copy }` – `copied` is a boolean flag, `copy(text)` triggers the copy.
 */
export function useCopy(timeout = 1500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    },
    [timeout]
  );

  return { copied, copy } as const;
}
