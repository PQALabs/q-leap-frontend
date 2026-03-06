import { appConfig } from '.';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  appUrl: appConfig.appUrl,
  name: 'Q-LEAP',
  metaTitle: 'Q-LEAP',
  description: 'Q-LEAP',
  ogImage: `${appConfig.appUrl}/og-image.jpg`,
};
