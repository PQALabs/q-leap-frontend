'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { PoolDataError } from '@/components/pool-data-status';
import { TooltipProvider } from '@/components/ui/tooltip';
import { fetchRuntimeConfig } from '@/config/runtime-config';
import { config } from '@/lib/wagmi-config';
import { ForumAuthSync } from '@/providers/forum-auth-sync';
import { ProtocolDataProvider } from '@/providers/protocol-data-provider';
import { StaticPoolDataProvider } from '@/providers/static-pool-data-provider';
import { ThemeProvider } from '../providers/theme-provider';

export interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            staleTime: 5 * 1000,
            retry: false,
          },
        },
      })
  );

  const [isMounted, setIsMounted] = useState(false);
  const [configReady, setConfigReady] = useState(false);

  useEffect(() => {
    fetchRuntimeConfig().finally(() => {
      setConfigReady(true);
      setIsMounted(true);
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <ProtocolDataProvider>
              <StaticPoolDataProvider errorPage={<PoolDataError />}>
                {isMounted ? children : <></>}
              </StaticPoolDataProvider>
            </ProtocolDataProvider>
            <ForumAuthSync />
            <ReactQueryDevtools buttonPosition='bottom-left' initialIsOpen={false} />
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </WagmiProvider>
  );
}

export default Providers;
