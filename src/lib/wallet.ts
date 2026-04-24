export const parseWalletError = ({
  code,
  message,
}: {
  code: number;
  message: string;
  data?: { location?: string };
}) => {
  if (code === 4001 || code === -32003) {
    return 'Wallet connection denied. Please approve the connection request in your wallet';
  }

  return message;
};

export const truncateAddress = (addr?: string) => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};
