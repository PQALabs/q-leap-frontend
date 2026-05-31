'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAccount, useConnect, useConnectors, useDisconnect, useSignMessage } from 'wagmi';
import { getAuthMeRequest, getAuthNonceRequest, loginRequest, updateAuthPreferencesRequest } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { env } from '@/config/env';
import { EVM_CONNECTORS_INFO, WALLET_IDS } from '@/constants/wallets';
import { useMetaMaskAppear } from '@/hooks/use-metamask-appear';
import { getEvmMessage } from '@/lib/get-evm-message';
import { cn } from '@/lib/utils';
import { parseWalletError, truncateAddress } from '@/lib/wallet';
import { useForumAuthStore } from '@/stores/use-forum-auth-store';
import type { WalletDisplay } from '@/types';
import { ConnectorItem } from '../dialog-connect-wallet/ConnectorItem';

type Step = 'connect' | 'sign' | 'signing' | 'preferences' | 'saving';

type Props = {
  open?: boolean;
  onOpenChangeAction: () => void;
  onLoginSuccess?: () => void;
};

export const DialogForumLogin = ({ open, onOpenChangeAction, onLoginSuccess }: Props) => {
  useMetaMaskAppear();

  const { mutateAsync: connectAsync, isPending: isConnecting } = useConnect();
  const connectors = useConnectors();
  const { mutateAsync: disconnectAsync } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { mutateAsync: signMessageAsync } = useSignMessage();

  const token = useForumAuthStore((s) => s.token);
  const forumUser = useForumAuthStore((s) => s.user);
  const hasHydrated = useForumAuthStore((s) => s.hasHydrated);
  const setAuth = useForumAuthStore((s) => s.setAuth);
  const setUser = useForumAuthStore((s) => s.setUser);
  const signInInFlightRef = useRef(false);

  const [step, setStep] = useState<Step>(() => (isConnected ? 'sign' : 'connect'));
  const [isReady, setIsReady] = useState(false);
  const [requireSignature, setRequireSignature] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') setIsReady(true);
  }, []);

  const canReuseStoredSession =
    !!token &&
    (!address || !forumUser?.walletAddress || forumUser.walletAddress.toLowerCase() === address.toLowerCase());

  const supportedConnectors: (WalletDisplay & { description: string })[] = useMemo(() => {
    const list: (WalletDisplay & { description: string })[] = [];

    for (const [key, value] of Object.entries(EVM_CONNECTORS_INFO)) {
      const existConnector = connectors.find((c) => c.id === key);

      let description = '';
      if (key === WALLET_IDS.walletConnect) description = 'Scan with WalletConnect to connect';
      else if (key === WALLET_IDS.metaMask) description = 'Connect using browser extension';

      list.push({
        connector: existConnector,
        icon: value.icon,
        isMultipleChain: value.isMultipleChain,
        id: key,
        name: value.name,
        description,
      });
    }

    const preferredOrder = [WALLET_IDS.walletConnect, WALLET_IDS.metaMask];
    list.sort((a, b) => preferredOrder.indexOf(a.id) - preferredOrder.indexOf(b.id));

    return list;
  }, [connectors]);

  const handleConnect = async ({ connectorDisplay }: { connectorDisplay: WalletDisplay }) => {
    try {
      await disconnectAsync();
    } catch {
      // ignore
    }

    try {
      if (!connectorDisplay.connector) return;
      await connectAsync({ connector: connectorDisplay.connector });
      // step advances via the useEffect above
    } catch (error: any) {
      toast.error(parseWalletError(error) || 'Failed to connect wallet');
    }
  };

  const handleSignIn = useCallback(async () => {
    if (!hasHydrated || signInInFlightRef.current) return;

    if (canReuseStoredSession) {
      onOpenChangeAction();
      onLoginSuccess?.();
      return;
    }

    if (!address) return;

    signInInFlightRef.current = true;
    setStep('signing');
    try {
      const lowerAddress = address.toLowerCase();

      const { nonce } = await getAuthNonceRequest({ address: lowerAddress });

      const message = env.AUTH_LOGIN_MESSAGE.replace('{address}', lowerAddress).replace('{nonce}', String(nonce));
      const signature = await signMessageAsync({ message });

      const { token: authToken } = await loginRequest({ address: lowerAddress, nonce, signature });

      const { user } = await getAuthMeRequest(authToken);
      setAuth(authToken, user);

      const hasSetPreferences = !!localStorage.getItem(`forum_prefs_set_${lowerAddress}`);
      if (hasSetPreferences) {
        toast.success('Signed in to QLEAP forum');
        onOpenChangeAction();
        onLoginSuccess?.();
        return;
      }

      setRequireSignature(user.requireSignature);
      setStep('preferences');
    } catch (error: any) {
      setStep('sign');
      toast.error(getEvmMessage(error) || 'Failed to sign in. Please try again.');
    } finally {
      signInInFlightRef.current = false;
    }
  }, [address, canReuseStoredSession, hasHydrated, onLoginSuccess, onOpenChangeAction, setAuth, signMessageAsync]);

  // Reset step when dialog opens
  useEffect(() => {
    if (!open || !hasHydrated) return;

    if (canReuseStoredSession) {
      onOpenChangeAction();
      onLoginSuccess?.();
      return;
    }

    if (isConnected) {
      handleSignIn();
    } else {
      setStep('connect');
    }
  }, [canReuseStoredSession, handleSignIn, hasHydrated, isConnected, onLoginSuccess, onOpenChangeAction, open]);

  // Auto-trigger sign-in once wallet connects
  useEffect(() => {
    if (open && hasHydrated && !canReuseStoredSession && isConnected && step === 'connect') {
      handleSignIn();
    }
  }, [canReuseStoredSession, handleSignIn, hasHydrated, isConnected, open, step]);

  const handleSavePreferences = async () => {
    const storedUser = useForumAuthStore.getState().user;

    if (storedUser && requireSignature !== storedUser.requireSignature) {
      setStep('saving');
      try {
        const signatureTimestamp = Date.now();
        const message = `QLEAP:UPDATE_PREFERENCES\ntimestamp:${signatureTimestamp}`;
        const signature = await signMessageAsync({ message });

        const updated = await updateAuthPreferencesRequest({ requireSignature, signatureTimestamp }, signature);
        setUser(updated);
      } catch (error) {
        toast.error(getEvmMessage(error) || 'Failed to save preference');
        setStep('preferences');
        return;
      }
    }

    const storedAddress = useForumAuthStore.getState().user?.walletAddress;
    if (storedAddress) localStorage.setItem(`forum_prefs_set_${storedAddress.toLowerCase()}`, '1');

    toast.success('Signed in to QLEAP forum');
    onOpenChangeAction();
    onLoginSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent aria-describedby='' className='rounded-xs border-border p-6 sm:max-w-[440px]'>
        {/* ── Step: connect ── */}
        {step === 'connect' && (
          <>
            <DialogHeader className='mb-6 space-y-1.5 text-center'>
              <DialogTitle className='text-center font-bold text-xl'>Sign in to Forum</DialogTitle>
              <p className='text-center text-muted-foreground text-sm'>
                Connect your wallet to participate in discussions
              </p>
            </DialogHeader>

            <div className='flex flex-col gap-3'>
              {supportedConnectors.map((connector) => (
                <ConnectorItem
                  key={connector.id}
                  icon={<connector.icon className='h-8 w-8' />}
                  onClick={() => handleConnect({ connectorDisplay: connector })}
                  checkReady={async () => !!(await connector.connector?.getProvider()) && isReady}
                  name={connector?.connector?.name || connector.name}
                  description={connector.description}
                  isConnecting={isConnecting}
                  isLoading={isConnecting}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Step: sign / signing ── */}
        {(step === 'sign' || step === 'signing') && (
          <>
            <DialogHeader className='mb-4 space-y-3 text-center'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                <svg className='h-6 w-6 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                  />
                </svg>
              </div>
              <DialogTitle className='text-center font-bold text-xl'>Sign in to Forum</DialogTitle>
              <DialogDescription className='text-center text-muted-foreground text-sm'>
                Sign a message with your wallet to verify ownership. This is free and does not require any gas.
              </DialogDescription>
            </DialogHeader>

            {address && (
              <div className='mb-6 rounded-xs border border-border bg-muted/30 p-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Connected wallet</span>
                  <span className='font-mono font-semibold text-foreground'>{truncateAddress(address)}</span>
                </div>
              </div>
            )}

            <div className='flex flex-col gap-3'>
              <Button
                onClick={handleSignIn}
                disabled={step === 'signing'}
                loading={step === 'signing'}
                className='w-full font-semibold'
              >
                {step === 'signing' ? 'Signing in...' : 'Sign in to QLEAP'}
              </Button>
              <Button
                onClick={() => setStep('connect')}
                disabled={step === 'signing'}
                variant='outline'
                className='w-full border-border'
              >
                Use a different wallet
              </Button>
            </div>
          </>
        )}

        {/* ── Step: preferences / saving ── */}
        {(step === 'preferences' || step === 'saving') && (
          <>
            <DialogHeader className='mb-6 space-y-1.5 text-center'>
              <DialogTitle className='text-center font-bold text-xl'>Security preference</DialogTitle>
              <DialogDescription className='text-center text-muted-foreground text-sm'>
                Choose how you want to authorize forum actions. You can change this later.
              </DialogDescription>
            </DialogHeader>

            <div className='mb-6 flex flex-col gap-3'>
              <button
                type='button'
                disabled={step === 'saving'}
                onClick={() => setRequireSignature(false)}
                className={cn(
                  'w-full rounded-xs border p-4 text-left transition-colors',
                  !requireSignature
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border/70 hover:bg-accent/50'
                )}
              >
                <div className='flex items-start gap-3'>
                  <div
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      !requireSignature ? 'border-primary' : 'border-muted-foreground/40'
                    )}
                  >
                    {!requireSignature && <div className='h-2 w-2 rounded-full bg-primary' />}
                  </div>
                  <div>
                    <p className='font-semibold text-foreground text-sm'>
                      Session only <span className='font-normal text-muted-foreground text-xs'>(Recommended)</span>
                    </p>
                    <p className='mt-0.5 text-muted-foreground text-xs leading-relaxed'>
                      Just sign in once — no extra steps when you comment, vote, or create proposals.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type='button'
                disabled={step === 'saving'}
                onClick={() => setRequireSignature(true)}
                className={cn(
                  'w-full rounded-xs border p-4 text-left transition-colors',
                  requireSignature
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-border/70 hover:bg-accent/50'
                )}
              >
                <div className='flex items-start gap-3'>
                  <div
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      requireSignature ? 'border-primary' : 'border-muted-foreground/40'
                    )}
                  >
                    {requireSignature && <div className='h-2 w-2 rounded-full bg-primary' />}
                  </div>
                  <div>
                    <p className='font-semibold text-foreground text-sm'>Sign each action</p>
                    <p className='mt-0.5 text-muted-foreground text-xs leading-relaxed'>
                      Your wallet will ask for approval on each action. Best for shared or high-security environments.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <Button
              onClick={handleSavePreferences}
              disabled={step === 'saving'}
              loading={step === 'saving'}
              className='w-full font-semibold'
            >
              {step === 'saving' ? 'Saving...' : 'Continue'}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
