'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignMessage } from 'wagmi';
import { banAddressRequest } from '@/api/moderation';
import { queryKeys } from '@/constants/query-keys';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { buildBanAddressMessage } from '../moderation-signatures';

type BanAddressInput = {
  targetAddress: string;
  reason?: string | null;
  expiresAt?: string | null;
};

export function useBanAddress() {
  const queryClient = useQueryClient();
  const { mutateAsync: signMessageAsync } = useSignMessage();
  const token = useForumAuthStore((s) => s.token);

  return useMutation({
    mutationFn: async ({ targetAddress, reason = null, expiresAt = null }: BanAddressInput) => {
      if (!token) {
        throw new Error('Please sign in to perform this action.');
      }

      const address = targetAddress.toLowerCase();
      const signatureTimestamp = Date.now();
      const message = buildBanAddressMessage({ address, expiresAt, reason, signatureTimestamp });
      const signature = await signMessageAsync({ message });

      return banAddressRequest({
        address,
        body: { signatureTimestamp, reason, expiresAt },
        signature,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.moderation.bannedAddresses() }),
  });
}
