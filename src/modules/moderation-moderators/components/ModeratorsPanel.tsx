'use client';

import { useEffect, useState } from 'react';
import type { IModerator } from '@/api/moderation';
import { ModerationPaginationFooter } from '@/modules/moderation/components/ModerationPaginationFooter';
import { getPaginatedPanelState } from '@/modules/moderation/utils/pagination';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { useModerators } from '../hooks/use-moderators';
import { AddModeratorDialog } from './AddModeratorDialog';
import { ModeratorListItem } from './ModeratorListItem';
import { ModeratorRowSkeleton } from './ModeratorRowSkeleton';
import { RemoveModeratorDialog } from './RemoveModeratorDialog';

export function ModeratorsPanel() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useModerators({ page, limit });
  const [pendingRemove, setPendingRemove] = useState<IModerator | null>(null);
  const isAdmin = useForumAuthStore((s) => s.user?.role === 'admin');
  const pagination = getPaginatedPanelState({
    items: data?.data ?? [],
    meta: data?.meta,
    page,
    limit,
  });
  const moderators = pagination.items;

  useEffect(() => {
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  return (
    <div className='border border-border bg-card'>
      <div className='flex items-center justify-between border-border border-b px-6 py-4'>
        <h2 className='font-semibold text-foreground text-sm'>Moderators</h2>
        {isAdmin && <AddModeratorDialog />}
      </div>

      {isLoading && (
        <>
          <ModeratorRowSkeleton />
          <ModeratorRowSkeleton />
          <ModeratorRowSkeleton />
        </>
      )}

      {!isLoading && moderators.length === 0 && (
        <p className='px-6 py-8 text-center text-muted-foreground text-sm'>No moderators yet.</p>
      )}

      {!isLoading &&
        moderators.map((mod) => (
          <ModeratorListItem key={mod.id} moderator={mod} canRemove={isAdmin} onRemove={setPendingRemove} />
        ))}

      {!isLoading && (
        <ModerationPaginationFooter
          page={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={setPage}
        />
      )}

      <RemoveModeratorDialog moderator={pendingRemove} onClose={() => setPendingRemove(null)} />
    </div>
  );
}
