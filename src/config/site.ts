import { env } from './env';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  appUrl: env.APP_URL,
  name: 'Q-LEAP',
  metaTitle: 'Q-LEAP',
  description: 'Q-LEAP',
  ogImage: `${env.APP_URL}/og-image.jpg`,
};
