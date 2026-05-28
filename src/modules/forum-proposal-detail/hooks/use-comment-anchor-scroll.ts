'use client';

import { useEffect, useRef } from 'react';

const ANCHOR_SCROLL_OFFSET = 96;

function scrollToCommentElement(element: HTMLElement) {
  const top = element.getBoundingClientRect().top + window.scrollY - ANCHOR_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
}

export function useCommentAnchorScroll({
  commentId,
  isTarget,
  onAnchorResolved,
}: {
  commentId: string;
  isTarget: boolean;
  onAnchorResolved?: (commentId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTarget) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      if (!ref.current) {
        return;
      }

      scrollToCommentElement(ref.current);
      onAnchorResolved?.(commentId);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [commentId, isTarget, onAnchorResolved]);

  return ref;
}
