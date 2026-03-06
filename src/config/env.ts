export const env = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Q-LEAP',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  USE_TESTNET: (process.env.NEXT_PUBLIC_USE_TESTNET ?? 'false') === 'true',
};
