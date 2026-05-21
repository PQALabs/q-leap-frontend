'use client';

import { DialogForumLogin } from '@/components/dialog-forum-login/DialogForumLogin';
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
      {isOpenConnectWallet && <DialogForumLogin open={isOpenConnectWallet} onOpenChangeAction={handleHideTargetView} />}
    </div>
  );
}
