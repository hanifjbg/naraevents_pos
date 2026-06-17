'use client';
import { PosProvider, usePos } from '@/lib/store';
import MainApp from '@/components/views/MainApp';
import LoginView from '@/components/views/LoginView';

function PosApp() {
  const { currentUser } = usePos();
  if (!currentUser) return <LoginView />;
  return <MainApp />;
}

export default function Page() {
  return (
    <PosProvider>
      <PosApp />
    </PosProvider>
  );
}
