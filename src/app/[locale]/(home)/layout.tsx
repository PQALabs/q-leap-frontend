'use client';

import { DialogConnectWallet } from '@/components/dialog-connect-wallet/DialogConnectWallet';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useIntersectionStore } from '@/stores/use-intersection-store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const targetInView = useIntersectionStore.use.targetInView();
  const setTargetInView = useIntersectionStore.use.setTargetInView();
  const isOpenConnectWallet = targetInView === 'connectWallet';

  const handleHideTargetView = () => {
    setTargetInView('');
  };

  return (
    <MainLayout>
      {children}
      {isOpenConnectWallet && (
        <DialogConnectWallet open={isOpenConnectWallet} onOpenChangeAction={handleHideTargetView} />
      )}
    </MainLayout>
  );
}
