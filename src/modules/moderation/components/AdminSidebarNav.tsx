'use client';

import { Flag, Menu, Shield, ShieldOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FORUM_ROUTES } from '@/constants/routes';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';

const navItems = [
  {
    label: 'Comment Reports',
    href: FORUM_ROUTES.MODERATION_REPORTS,
    icon: Flag,
    adminOnly: false,
  },
  {
    label: 'Moderators',
    href: FORUM_ROUTES.MODERATION_MODERATORS,
    icon: Shield,
    adminOnly: true,
  },
  {
    label: 'Banned Addresses',
    href: FORUM_ROUTES.MODERATION_BANNED,
    icon: ShieldOff,
    adminOnly: false,
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = useForumAuthStore((s) => s.user?.role === 'admin');
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);
  const activeLabel = visibleNavItems.find((item) => pathname.includes(item.href))?.label ?? 'Admin Portal';

  return (
    <>
      <div className='flex items-center gap-2 border border-border px-4 py-3 md:hidden'>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 rounded-none'
              aria-label='Open admin navigation'
            >
              <Menu className='size-4' />
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-52 p-0' showCloseButton={false}>
            <SheetTitle className='sr-only'>Admin Portal</SheetTitle>
            <div className='border-border border-b px-4 py-3'>
              <p className='font-semibold text-foreground text-xs uppercase tracking-wider'>Admin Portal</p>
            </div>
            <nav className='py-1'>
              {visibleNavItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathname.includes(href);
                return (
                  <button
                    key={href}
                    type='button'
                    className={cn(
                      'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-accent font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                    onClick={() => {
                      setOpen(false);
                      router.push(href);
                    }}
                  >
                    <Icon className='size-4 shrink-0' />
                    {label}
                  </button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='shrink-0 font-semibold text-foreground text-xs uppercase tracking-wider'>Admin Portal</span>
          <span className='min-w-0 truncate text-muted-foreground text-sm'>{activeLabel}</span>
        </div>
      </div>

      <aside className='hidden w-52 shrink-0 md:block'>
        <div className=''>
          <div className='border-border border-b px-4 py-3'>
            <p className='font-semibold text-foreground text-xs uppercase tracking-wider'>Admin Portal</p>
          </div>
          <nav className='py-1'>
            {visibleNavItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname.includes(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-accent font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  )}
                >
                  <Icon className='size-4 shrink-0' />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
