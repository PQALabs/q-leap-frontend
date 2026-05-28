'use client';

import { ShieldBan } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { IBannedAddress } from '@/api/moderation';
import { Button } from '@/components/ui/button';
import { ModerationPaginationFooter } from '@/modules/moderation/components/ModerationPaginationFooter';
import { getPaginatedPanelState } from '@/modules/moderation/utils/pagination';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { useBannedAddresses } from '../hooks/use-banned-addresses';
import { BanAddressDialog } from './BanAddressDialog';
import { BanListItem } from './BanListItem';
import { BanListRowSkeleton } from './BanListRowSkeleton';
import { UnbanAddressDialog } from './UnbanAddressDialog';

export function BanListPanel() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useBannedAddresses({ page, limit });
  const [pendingUnban, setPendingUnban] = useState<IBannedAddress | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const currentUserAddress = useForumAuthStore((s) => s.user?.walletAddress?.toLowerCase());
  const pagination = getPaginatedPanelState({
    items: data?.data ?? [],
    meta: data?.meta,
    page,
    limit,
  });
  const bannedAddresses = pagination.items;

  useEffect(() => {
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  return (
    <div className='border border-border bg-card'>
      <div className='flex items-center justify-between gap-4 border-border border-b px-6 py-4'>
        <h2 className='font-semibold text-foreground text-sm'>Banned Addresses</h2>
        <Button
          type='button'
          variant='destructive'
          size='xs'
          className='shrink-0 rounded-none px-4 font-bold text-xs'
          icon={<ShieldBan />}
          onClick={() => setBanDialogOpen(true)}
        >
          BAN ADDRESS
        </Button>
      </div>

      {isLoading && (
        <>
          <BanListRowSkeleton />
          <BanListRowSkeleton />
          <BanListRowSkeleton />
        </>
      )}

      {!isLoading && bannedAddresses.length === 0 && (
        <p className='px-6 py-8 text-center text-muted-foreground text-sm'>No banned addresses.</p>
      )}

      {!isLoading &&
        bannedAddresses.map((entry) => (
          <BanListItem
            key={entry.address}
            entry={entry}
            canUnban={entry.address.toLowerCase() !== currentUserAddress}
            onUnban={setPendingUnban}
          />
        ))}

      {!isLoading && (
        <ModerationPaginationFooter
          page={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={setPage}
        />
      )}

      <BanAddressDialog open={banDialogOpen} targetAddress={null} onClose={() => setBanDialogOpen(false)} />
      <UnbanAddressDialog entry={pendingUnban} onClose={() => setPendingUnban(null)} />
    </div>
  );
}
