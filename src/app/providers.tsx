'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type ReactNode, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { PoolDataError } from '@/components/pool-data-status';
import { TooltipProvider } from '@/components/ui/tooltip';
import { config } from '@/lib/wagmi-config';
import { DynamicPoolDataProvider } from '@/providers/dynamic-pool-data-provider';
import { ProtocolDataProvider } from '@/providers/protocol-data-provider';
import { StaticPoolDataProvider } from '@/providers/static-pool-data-provider';
import { ThemeProvider } from '../providers/theme-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5 * 1000,
      retry: false,
    },
  },
});

export interface ProvidersProps {
  children: ReactNode;
}

function Providers({ children }: ProvidersProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <ProtocolDataProvider>
            <StaticPoolDataProvider errorPage={<PoolDataError />}>
              <DynamicPoolDataProvider>
                <TooltipProvider>{isMounted ? children : <></>}</TooltipProvider>
              </DynamicPoolDataProvider>
            </StaticPoolDataProvider>
          </ProtocolDataProvider>
          <ReactQueryDevtools buttonPosition='bottom-left' initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </WagmiProvider>
  );
}

export default Providers;
