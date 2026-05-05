console.log('🚀 ~ process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

export const env = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Q-LEAP',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  ENABLE_TESTNET: (process.env.NEXT_PUBLIC_ENABLE_TESTNET ?? 'false') === 'true',
  ENABLE_LIQUIDATION: (process.env.NEXT_PUBLIC_ENABLE_LIQUIDATION ?? 'false') === 'true',
};
