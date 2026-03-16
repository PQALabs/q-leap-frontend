'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EVM_CONNECTORS_INFO, WALLET_IDS } from '@/constants/wallets';
import { useMetaMaskAppear } from '@/hooks/use-metamask-appear';
import { useSwitchToQday } from '@/hooks/use-switch-to-qday';
import { parseWalletError } from '@/lib/wallet';
import { useIntersectionStore } from '@/stores/use-intersection-store';
import type { WalletDisplay } from '@/types';
import { ConnectorItem } from './ConnectorItem';

type Props = {
  open?: boolean;
  onOpenChangeAction: () => void;
};

export const DialogConnectWallet = ({ open, onOpenChangeAction }: Props) => {
  const t = useTranslations('connectWallet');
  useMetaMaskAppear();

  const { mutateAsync: connectAsync, isPending: isConnectingEvm } = useConnect();
  const connectors = useConnectors();
  const { mutateAsync: disConnectEvm } = useDisconnect();
  const { chainId, isConnected } = useConnection();

  const { switchToQday, targetChainId, targetChain, isPending: isSwitchingChain } = useSwitchToQday();

  const setTargetInView = useIntersectionStore.use.setTargetInView();
  const [isReady, setReady] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Check if connected but on wrong chain
  const isWrongChain = isConnected && chainId !== targetChainId;

  useEffect(() => {
    // Check if the Ethereum provider (e.g., MetaMask) is available
    if (typeof window !== 'undefined') {
      setReady(true);
    } else {
      setReady(false);
    }
  }, []);

  const supportedConnector: (WalletDisplay & { description: string })[] = useMemo(() => {
    const connectorsInfo: (WalletDisplay & { description: string })[] = [];
    for (const [key, value] of Object.entries(EVM_CONNECTORS_INFO)) {
      const existConnector = connectors.find((connector) => connector.id === key);

      let description = '';
      if (key === WALLET_IDS.walletConnect) {
        description = t('walletConnectDescription');
      } else if (key === WALLET_IDS.metaMask) {
        description = t('metaMaskDescription');
      }

      connectorsInfo.push({
        connector: existConnector,
        icon: value.icon,
        isMultipleChain: value.isMultipleChain,
        id: key,
        name: value.name,
        description,
      });
    }

    const preferredOrder = [WALLET_IDS.walletConnect, WALLET_IDS.metaMask];
    connectorsInfo.sort((a, b) => preferredOrder.indexOf(a.id) - preferredOrder.indexOf(b.id));

    return connectorsInfo;
  }, [connectors]);

  const handleConnect = async ({ connectorDisplay }: { connectorDisplay: WalletDisplay }) => {
    // Disconnect first to prevent "Connector already connected" error
    try {
      await disConnectEvm();
    } catch (e) {
      // Ignore disconnect errors
    }

    try {
      const connector = connectorDisplay.connector;

      if (!connector) {
        return;
      }

      const { accounts = [] } = await connectAsync({
        connector,
      });
      const accountsAddress = accounts[0];

      handleSwitchChain();
      if (!accountsAddress) return;

      // if (!isWrongChain) {
      //   setTargetInView('');
      // }
    } catch (error: any) {
      toast.error(parseWalletError(error) || t('failedConnect'));
      disConnectEvm();
    }
  };

  const handleSwitchChain = async () => {
    setIsSwitching(true);
    try {
      await switchToQday();
      toast.success(t('switchSuccess', { chainName: targetChain.name }));

      setTargetInView('');
    } catch (error: any) {
      console.error('Failed to switch chain:', error);

      // Handle user rejection
      if (error?.code === 4001 || error?.name === 'UserRejectedRequestError') {
        toast.error(t('switchRejected'));
      } else {
        toast.error(t('switchFailed'));
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setTargetInView('');
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={() => {
          onOpenChangeAction();
        }}
      >
        <DialogContent aria-describedby='' className='rounded-xs border-border bg-background p-6 sm:max-w-[440px]'>
          {isWrongChain ? (
            // Wrong Chain UI
            <>
              <DialogHeader className='mb-4 space-y-3 text-center'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10'>
                  <svg className='h-6 w-6 text-warning' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                    />
                  </svg>
                </div>
                <DialogTitle className='text-center font-bold text-xl'>{t('wrongNetwork')}</DialogTitle>
                <DialogDescription className='text-center text-muted-foreground text-sm'>
                  {t('wrongNetworkDescription')}
                  <br />
                  <span className='mt-2 block font-medium text-foreground'>
                    {t('switchTo')} <span className='text-primary'>{targetChain.name}</span>
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className='mb-6 rounded-xs border border-border bg-muted/30 p-4'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>{t('currentChainId')}</span>
                  <span className='font-semibold text-foreground'>{chainId || '—'}</span>
                </div>
                <div className='mt-2 flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>{t('requiredChainId')}</span>
                  <span className='font-semibold text-primary'>{targetChainId}</span>
                </div>
              </div>

              <div className='flex flex-col gap-3'>
                <Button
                  onClick={handleSwitchChain}
                  disabled={isSwitching || isSwitchingChain}
                  loading={isSwitching || isSwitchingChain}
                  className='w-full bg-primary font-semibold hover:bg-primary/90'
                >
                  {isSwitching || isSwitchingChain ? t('switching') : t('switchChain', { chainName: targetChain.name })}
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={isSwitching || isSwitchingChain}
                  variant='outline'
                  className='w-full border-border'
                >
                  {t('cancelDisconnect')}
                </Button>
              </div>
            </>
          ) : (
            // Normal Wallet Connection UI
            <>
              <DialogHeader className='mb-6 space-y-1.5 text-center'>
                <DialogTitle className='text-center font-bold text-xl'>{t('title')}</DialogTitle>
                <p className='text-center text-muted-foreground text-sm'>{t('subtitle')}</p>
              </DialogHeader>

              <div className='flex flex-col gap-3'>
                {supportedConnector.map((connector) => (
                  <ConnectorItem
                    key={connector.id}
                    icon={<connector.icon className='h-8 w-8' />}
                    onClick={() => handleConnect({ connectorDisplay: connector })}
                    checkReady={async () => !!(await connector.connector?.getProvider()) && isReady}
                    name={connector?.connector?.name || connector.name}
                    description={connector.description}
                    isConnecting={isConnectingEvm}
                    isLoading={isConnectingEvm}
                  />
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
