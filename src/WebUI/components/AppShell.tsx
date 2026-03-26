"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getSession } from "@/lib/auth";

const tabs = [
  { href: "/home", label: "Home" },
  { href: "/explore", label: "Explore" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = getSession();

  return (
    <div className="min-h-[100svh] bg-app">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
          <Link href="/" className="text-sm font-semibold tracking-tight text-white">
            PulseNet
          </Link>

          <nav className="flex items-center gap-2">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  pathname?.startsWith(t.href)
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session?.username ? (
              <Link
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
                href={`/u/${encodeURIComponent(session.username)}`}
              >
                @{session.username}
              </Link>
            ) : null}
            <button
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
              onClick={() => {
                clearToken();
                router.replace("/login");
              }}
            >
              Çıkış
            </button>
          </div>
        </header>

        <main className="mt-4 grid gap-4 md:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
            {children}
          </section>
          <aside className="rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
            <div className="text-xs font-semibold text-white/80">Endpoint uyumu</div>
            <div className="mt-2 text-xs leading-5 text-white/60">
              <div>- Auth: `POST /api/auth/login|register`</div>
              <div>- Users: `GET /api/users/by-username/{`{username}`}`</div>
              <div>- Posts: `GET /api/posts/recent`, `POST /api/posts`</div>
              <div>
                - Follows: `GET /api/follows/followers|following/{`{userId}`}`
              </div>
              <div>- Timeline: `GET /api/timeline/{`{userId}`}`</div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

