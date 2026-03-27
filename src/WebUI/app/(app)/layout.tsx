'use client';

import Sidebar from '@/components/Sidebar';
import RightSidebar from '@/components/RightSidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('pulsenet_token');
    if (!token) {
      router.push('/login');
    } else {
      setIsReady(true);
    }
  }, [router]);

  if (!isReady) return <div className="min-h-screen bg-black" />;

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Sidebar */}
      <header className="flex-none w-[70px] xl:w-[275px] h-screen sticky top-0 overflow-y-auto">
        <Sidebar />
      </header>

      {/* Main Feed */}
      <main className="flex-1 max-w-[600px] border-r border-border min-h-screen">
        {children}
      </main>

      {/* Right Sidebar */}
      <aside className="hidden lg:flex flex-none w-[350px] xl:w-[400px] h-screen sticky top-0 overflow-y-auto">
        <RightSidebar />
      </aside>
    </div>
  );
}
