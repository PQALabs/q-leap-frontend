'use client';

import { DialogConnectWallet } from '@/components/dialog-connect-wallet/DialogConnectWallet';
import { Header } from '@/components/layouts/Header';
import { useIntersectionStore } from '@/stores/use-intersection-store';

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  const targetInView = useIntersectionStore.use.targetInView();
  const setTargetInView = useIntersectionStore.use.setTargetInView();
  const isOpenConnectWallet = targetInView === 'connectWallet';

  const handleHideTargetView = () => {
    setTargetInView('');
  };

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Header />
      {children}
      {isOpenConnectWallet && (
        <DialogConnectWallet open={isOpenConnectWallet} onOpenChangeAction={handleHideTargetView} />
      )}
    </div>
  );
}
