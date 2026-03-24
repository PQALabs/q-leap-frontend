'use client';

import { LayoutDashboard, Menu, PlusCircle, Wallet, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useConnection, useDisconnect } from 'wagmi';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { qdayMainnet, qdayTestnet } from '@/constants/wagmi';
import { useSwitchToQday } from '@/hooks/use-switch-to-qday';
import { truncateAddress } from '@/lib/wallet';
import { useIntersectionStore } from '@/stores/use-intersection-store';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [{ label: 'My Portfolio', href: '/portfolio' }];

export function Header() {
  const t = useTranslations('header');
  const setTargetInView = useIntersectionStore.use.setTargetInView();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { address, isConnected, chainId, chain } = useConnection();
  const { mutate: disconnect } = useDisconnect();
  const { switchToQday, isPending: isAddingChain } = useSwitchToQday();

  const targetChain = env.ENABLE_TESTNET ? qdayTestnet : qdayMainnet;
  const isQdayChain = isConnected && chainId === targetChain.id;

  const handleOpenConnectWallet = () => {
    setTargetInView('connectWallet');
  };

  return (
    <header className='sticky top-0 z-50 w-full border-border border-b bg-header-background backdrop-blur-md'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <div className='flex items-center gap-3'>
          <Link
            href='/'
            className='flex items-center gap-2 font-bold text-foreground text-lg tracking-wide transition-opacity hover:opacity-80'
          >
            <span className='flex h-8 w-8 items-center justify-center rounded-md bg-primary font-extrabold text-primary-foreground text-sm'>
              Q
            </span>
            <span className='hidden sm:inline'>{siteConfig.name}</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className='hidden items-center gap-6 md:flex'>
          {/* {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='font-medium text-muted-foreground text-sm transition-colors hover:text-foreground'
            >
              {item.label}
            </Link>
          ))} */}
        </nav>

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
              <Link
                href='/dashboard'
                className='mr-4 hidden items-center gap-1.5 font-medium text-primary text-sm transition-colors hover:text-foreground sm:flex'
              >
                {t('myDashboard')}
              </Link>

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
                    className='hidden items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground sm:flex'
                  >
                    <Wallet size={13} />
                    <span>{truncateAddress(address)}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem variant='destructive' className='cursor-pointer' onClick={() => disconnect()}>
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

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile menu toggle */}
          <button
            type='button'
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={t('toggleMobileMenu')}
            className='flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-accent md:hidden'
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className='border-border border-t bg-background px-4 py-4 md:hidden'>
          <nav className='flex flex-col gap-3'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className='font-medium text-muted-foreground text-sm transition-colors hover:text-foreground'
              >
                {item.label}
              </Link>
            ))}
            {isConnected && (
              <Link
                href='/dashboard'
                onClick={() => setMobileOpen(false)}
                className='flex items-center gap-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground'
              >
                <LayoutDashboard size={14} />
                {t('dashboard')}
              </Link>
            )}
          </nav>
          <div className='mt-4 flex flex-wrap items-center gap-2'>
            {isConnected ? (
              <>
                <div className='flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 font-medium text-xs'>
                  <span className='h-2 w-2 rounded-full bg-green-500' />
                  <span className='text-muted-foreground'>{chain?.name?.toUpperCase() || t('unknown')}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type='button'
                      className='flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 font-medium text-muted-foreground text-xs'
                    >
                      <Wallet size={13} />
                      <span>{truncateAddress(address)}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem variant='destructive' className='cursor-pointer' onClick={() => disconnect()}>
                      {t('disconnect')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Add QDay Chain button in mobile — shown when on a different chain */}
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
        </div>
      )}
    </header>
  );
}
