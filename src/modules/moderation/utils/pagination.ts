import type { IModerationListMeta } from '@/api/moderation';

type GetPaginatedItemsArgs<T> = {
  items: T[];
  meta?: IModerationListMeta;
  page: number;
  limit: number;
};

export function getPaginatedPanelState<T>({ items, meta, page, limit }: GetPaginatedItemsArgs<T>) {
  const hasServerPagination = typeof meta?.totalPages === 'number';

  if (hasServerPagination) {
    return {
      items,
      currentPage: meta?.currentPage ?? page,
      totalItems: meta?.totalItems ?? items.length,
      totalPages: meta?.totalPages ?? 0,
    };
  }

  return {
    items: items.slice((page - 1) * limit, page * limit),
    currentPage: page,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / limit),
  };
}
