import { keccak256, stringToHex } from 'viem';

type AddModeratorParams = {
  address: string;
  signatureTimestamp: number;
};

type RemoveModeratorParams = {
  address: string;
  signatureTimestamp: number;
};

type BanAddressParams = {
  address: string;
  expiresAt: string | null;
  reason: string | null;
  signatureTimestamp: number;
};

type UnbanAddressParams = {
  address: string;
  signatureTimestamp: number;
};

export function buildAddModeratorMessage({ address, signatureTimestamp }: AddModeratorParams): string {
  return ['QLEAP:ADD_MODERATOR', `address:${address}`, `timestamp:${signatureTimestamp}`].join('\n');
}

export function buildRemoveModeratorMessage({ address, signatureTimestamp }: RemoveModeratorParams): string {
  return ['QLEAP:REMOVE_MODERATOR', `address:${address}`, `timestamp:${signatureTimestamp}`].join('\n');
}

export function buildBanAddressMessage({ address, expiresAt, reason, signatureTimestamp }: BanAddressParams): string {
  const expiresAtMsg = expiresAt ?? 'permanent';
  const reasonHash = keccak256(stringToHex(reason ?? ''));
  return [
    'QLEAP:BAN_ADDRESS',
    `address:${address}`,
    `expiresAt:${expiresAtMsg}`,
    `reasonHash:${reasonHash}`,
    `timestamp:${signatureTimestamp}`,
  ].join('\n');
}

export function buildUnbanAddressMessage({ address, signatureTimestamp }: UnbanAddressParams): string {
  return ['QLEAP:UNBAN_ADDRESS', `address:${address}`, `timestamp:${signatureTimestamp}`].join('\n');
}
