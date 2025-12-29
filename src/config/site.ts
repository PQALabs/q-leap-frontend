import { appConfig } from '.';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  appUrl: appConfig.appUrl,
  name: 'NextJS 16 - Boilerplate',
  metaTitle: 'NextJS 16 - Boilerplate',
  description: 'NextJS 16 - Boilerplate',
  ogImage: `${appConfig.appUrl}/og-image.jpg`,
};
