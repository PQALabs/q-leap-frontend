import { useCallback, useEffect, useRef, useState } from 'react';

type UseScrollPaginationOptions = {
  pageCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
  minDelay?: number;
};

export function useScrollPagination({
  pageCount,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  minDelay = 0,
}: UseScrollPaginationOptions) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isLoadMoreVisible, setIsLoadMoreVisible] = useState(false);
  const [visiblePageCount, setVisiblePageCount] = useState(0);

  useEffect(() => {
    if (!pageCount) {
      setVisiblePageCount(0);
      return;
    }
    if (!isLoadMoreVisible) {
      setVisiblePageCount(pageCount);
    }
  }, [pageCount, isLoadMoreVisible]);

  const handleLoadMore = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage || isLoadMoreVisible) return;

    setIsLoadMoreVisible(true);
    try {
      const tasks: Promise<unknown>[] = [fetchNextPage()];
      if (minDelay > 0) tasks.push(new Promise((resolve) => setTimeout(resolve, minDelay)));
      await Promise.all(tasks);
    } finally {
      setIsLoadMoreVisible(false);
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoadMoreVisible, minDelay]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMore();
      },
      { rootMargin: '240px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleLoadMore, hasNextPage]);

  return {
    loadMoreRef,
    visiblePageCount,
    isLoadingMore: isFetchingNextPage || isLoadMoreVisible,
  };
}
