import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16: "proxy.ts" replaces the deprecated "middleware.ts" convention.
// next-intl's createMiddleware returns a standard Next.js handler, compatible with proxy.
export default createMiddleware(routing);

export const config = {
  // Match all page routes except Next.js internals and static files
  matcher: ['/((?!_next|.*\\..*).*)'],
};
