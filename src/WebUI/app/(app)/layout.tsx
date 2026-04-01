'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { ensureStoredUserHasId } from '@/lib/userProfile';

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
      return;
    }
    void (async () => {
      try {
        await ensureStoredUserHasId();
      } catch {
        /* ignore; pages that need id will retry */
      } finally {
        setIsReady(true);
      }
    })();
  }, [router]);

  if (!isReady) return <div className="min-h-screen bg-black" />;

  const savedUser =
    typeof window !== 'undefined' ? localStorage.getItem('pulsenet_user') : null;
  const user = savedUser ? JSON.parse(savedUser) : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-border bg-black/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            PulseNet
          </Link>
          <div className="flex items-center gap-2">
            {user?.username ? (
              <Link
                href={`/profile/${encodeURIComponent(user.username)}`}
                className="rounded-full px-3 py-1 text-sm text-gray-300 hover:bg-muted"
              >
                @{user.username}
              </Link>
            ) : null}
            <button
              onClick={() => {
                authApi.logout();
                router.replace('/login');
              }}
              className="btn-outline text-sm"
            >
              Cikis
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl border-x border-border min-h-screen">
        {children}
      </main>
    </div>
  );
}
