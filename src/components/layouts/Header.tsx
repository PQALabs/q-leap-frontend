'use client';

import { Check, Copy, LayoutDashboard, LogOut, Menu, MessageSquare, PlusCircle, Shield, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useConnection, useDisconnect } from 'wagmi';
import { DialogForumPreferences } from '@/components/dialog-forum-login/DialogForumPreferences';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { FORUM_ROUTES } from '@/constants/routes';
import { qdayMainnet, qdayTestnet } from '@/constants/wagmi';
import { useCopy } from '@/hooks/use-copy';
import { useSwitchToQday } from '@/hooks/use-switch-to-qday';
import { truncateAddress } from '@/lib/wallet';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import { useIntersectionStore } from '@/stores/use-intersection-store';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [];

export function Header() {
  const t = useTranslations('header');
  const pathname = usePathname();
  const setTargetInView = useIntersectionStore.use.setTargetInView();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const { copied, copy } = useCopy();
  const forumUser = useForumAuthStore((s) => s.user);
  const { address, isConnected, chainId, chain } = useConnection();
  const { mutateAsync: disconnect } = useDisconnect();
  const { switchToQday, isPending: isAddingChain } = useSwitchToQday();

  const targetChain = env.ENABLE_TESTNET ? qdayTestnet : qdayMainnet;
  const isQdayChain = isConnected && chainId === targetChain.id;
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
  const isForumPage = pathnameWithoutLocale === '/forum' || pathnameWithoutLocale.startsWith('/forum/');

  const handleOpenConnectWallet = () => {
    setTargetInView('connectWallet');
  };

  const clearForumAuth = useForumAuthStore((s) => s.clearAuth);

  const handleDisconnect = async () => {
    await disconnect();
    clearForumAuth();
    toast.success(t('disconnectSuccess'));
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/' || pathname.match(/^\/[a-z]{2}\/?$/)) {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <>
      <header className='sticky top-0 z-50 w-full border-border border-b bg-header-background backdrop-blur-md'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <Link
              href='/'
              onClick={handleLogoClick}
              className='flex items-center gap-2 font-bold text-foreground text-lg tracking-wide transition-opacity hover:opacity-80'
            >
              {/* Light theme logo */}
              <Image
                src='/logo-light.svg'
                alt={siteConfig.name}
                width={36}
                height={36}
                className='block dark:hidden'
                priority
              />
              {/* Dark theme logo */}
              <Image
                src='/logo-dark.svg'
                alt={siteConfig.name}
                width={36}
                height={36}
                className='hidden dark:block'
                priority
              />
              <span className='hidden sm:inline'>{siteConfig.name}</span>
            </Link>
          </div>

          {/* Desktop nav */}
          {env.ENABLE_FORUM && (
            <nav className='hidden items-center md:flex'>
              <Link
                href='/forum'
                className='flex items-center gap-1.5 px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground'
              >
                <MessageSquare size={14} />
                Forum
              </Link>
              {forumUser && (forumUser.role === 'admin' || forumUser.role === 'moderator') && (
                <Link
                  href={FORUM_ROUTES.MODERATION_REPORTS}
                  className='flex items-center gap-1.5 px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground'
                >
                  <Shield size={14} />
                  Admin
                </Link>
              )}
            </nav>
          )}

          {/* Right controls */}
          <div className='flex items-center gap-2'>
            {/* Add QDay Chain button — shown when connected to a different chain */}
            {isConnected && !isQdayChain && (
              <button
                type='button'
                onClick={() => switchToQday()}
                disabled={isAddingChain}
                className='hidden items-center gap-1.5 rounded-full border border-orange-500 px-3 py-1.5 font-semibold text-orange-500 text-xs transition-colors hover:bg-orange-500/10 disabled:opacity-60 sm:flex'
              >
                <PlusCircle size={13} />
                <span>{isAddingChain ? t('addingChain') : t('addChain', { chainName: targetChain.name })}</span>
              </button>
            )}

            {isConnected ? (
              <>
                {/* Dashboard link */}
                {!isForumPage && (
                  <Button variant='ghost' asChild className='mr-4 hidden sm:flex'>
                    <Link href='/dashboard'>
                      <LayoutDashboard size={14} />
                      {t('myDashboard')}
                    </Link>
                  </Button>
                )}

                {/* Network badge */}
                <div className='hidden items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 font-medium text-xs sm:flex'>
                  <span className='h-2 w-2 rounded-full bg-green-500' />
                  <span className='text-muted-foreground'>{chain?.name?.toUpperCase() || t('unknown')}</span>
                </div>

                {/* Wallet address */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='hidden cursor-pointer items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground sm:flex'
                    >
                      <Wallet size={13} />
                      <span>{truncateAddress(address)}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      className='cursor-pointer'
                      onClick={() => {
                        if (address) {
                          copy(address);
                          toast.success(t('copied'));
                        }
                      }}
                    >
                      {copied ? <Check size={13} className='mr-1.5' /> : <Copy size={13} className='mr-1.5' />}
                      {copied ? t('copied') : t('copyAddress')}
                    </DropdownMenuItem>
                    {env.ENABLE_FORUM && forumUser && (
                      <DropdownMenuItem className='cursor-pointer' onClick={() => setPreferencesOpen(true)}>
                        <Shield size={13} className='mr-1.5' />
                        Forum preferences
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem variant='destructive' className='cursor-pointer' onClick={handleDisconnect}>
                      <LogOut size={13} className='mr-1.5' />
                      {t('disconnect')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                className='hidden h-8 px-4 font-semibold text-xs sm:flex'
                onClick={handleOpenConnectWallet}
                icon={<Wallet size={14} />}
              >
                {t('connectWallet')}
              </Button>
            )}

            {/* Notification bell — only on forum pages when forum user is logged in */}
            {env.ENABLE_FORUM && isForumPage && forumUser && <NotificationBell />}

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Mobile menu toggle */}
            <button
              type='button'
              onClick={() => setMobileOpen(true)}
              aria-label={t('toggleMobileMenu')}
              className='flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent md:hidden'
            >
              <Menu size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — Sheet slide-in from right */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side='right' className='w-72 p-0'>
          <SheetHeader className='border-border border-b px-4 py-4'>
            <SheetTitle className='flex items-center gap-2 font-bold text-lg'>
              <Image src='/logo-light.svg' alt={siteConfig.name} width={32} height={32} className='block dark:hidden' />
              <Image src='/logo-dark.svg' alt={siteConfig.name} width={32} height={32} className='hidden dark:block' />
              {siteConfig.name}
            </SheetTitle>
          </SheetHeader>

          {/* Navigation links */}
          <nav className='flex flex-col gap-1 px-4 pt-4'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className='flex items-center rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground'
              >
                {item.label}
              </Link>
            ))}
            {env.ENABLE_FORUM && (
              <Link
                href='/forum'
                onClick={() => setMobileOpen(false)}
                className='flex items-center gap-2 rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground'
              >
                <MessageSquare size={14} />
                Forum
              </Link>
            )}
            {env.ENABLE_FORUM && forumUser && (forumUser.role === 'admin' || forumUser.role === 'moderator') && (
              <Link
                href={FORUM_ROUTES.MODERATION_REPORTS}
                onClick={() => setMobileOpen(false)}
                className='flex items-center gap-2 rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground'
              >
                <Shield size={14} />
                Admin Portal
              </Link>
            )}
            {isConnected && !isForumPage && (
              <Link
                href='/dashboard'
                onClick={() => setMobileOpen(false)}
                className='flex items-center gap-2 rounded-md px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground'
              >
                <LayoutDashboard size={14} />
                {t('dashboard')}
              </Link>
            )}
          </nav>

          <Separator className='my-3' />

          {/* Wallet & network section */}
          <div className='flex flex-col gap-3 px-4'>
            {isConnected ? (
              <>
                {/* Network badge */}
                <div className='flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 font-medium text-xs'>
                  <span className='h-2 w-2 rounded-full bg-green-500' />
                  <span className='text-muted-foreground'>{chain?.name?.toUpperCase() || t('unknown')}</span>
                </div>

                {/* Wallet address with copy */}
                <button
                  type='button'
                  onClick={() => {
                    if (address) {
                      copy(address);
                      toast.success(t('copied'));
                    }
                  }}
                  className='flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent'
                >
                  <Wallet size={13} />
                  <span className='flex-1 text-left'>{truncateAddress(address)}</span>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>

                {/* Add QDay Chain button — shown when on a different chain */}
                {!isQdayChain && (
                  <button
                    type='button'
                    onClick={() => switchToQday()}
                    disabled={isAddingChain}
                    className='flex w-full items-center justify-center gap-1.5 rounded-full border border-orange-500 px-3 py-1.5 font-semibold text-orange-500 text-xs transition-colors hover:bg-orange-500/10 disabled:opacity-60'
                  >
                    <PlusCircle size={13} />
                    <span>{isAddingChain ? t('addingChain') : t('addChain', { chainName: targetChain.name })}</span>
                  </button>
                )}

                <Separator />

                {/* Disconnect */}
                <button
                  type='button'
                  onClick={() => {
                    disconnect();
                    clearForumAuth();
                    setMobileOpen(false);
                  }}
                  className='flex items-center gap-2 rounded-md px-3 py-2 font-medium text-destructive text-sm transition-colors hover:bg-destructive/10'
                >
                  <LogOut size={14} />
                  {t('disconnect')}
                </button>
              </>
            ) : (
              <Button
                className='w-full'
                onClick={() => {
                  setMobileOpen(false);
                  setTargetInView('connectWallet');
                }}
                icon={<Wallet size={14} />}
              >
                {t('connectWallet')}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <DialogForumPreferences open={preferencesOpen} onOpenChangeAction={setPreferencesOpen} />
    </>
  );
}
