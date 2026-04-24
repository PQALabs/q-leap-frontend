import { useEffect } from 'react';
import { useIntersectionStore } from '@/stores/use-intersection-store';

export function useMetaMaskAppear() {
  const setTargetInView = useIntersectionStore.use.setTargetInView();

  useEffect(() => {
    // 2. Create a MutationObserver to watch for the modal appearing in the DOM
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          // Check if the added node is the MetaMask wrapper
          if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'mm-install-modal') {
            if (node.shadowRoot) {
              setTargetInView('');
            }
          }
        }
      }
    });

    // Start watching the body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => observer.disconnect();
  }, []);
}
