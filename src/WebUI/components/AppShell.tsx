"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getSession } from "@/lib/auth";

const tabs = [
  { href: "/home", label: "Pulse" },
  { href: "/explore", label: "Kesfet" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const session = getSession();

  return (
    <div className="min-h-[100svh] bg-app">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <header className="pn-shell flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-300" />
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
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-300 hover:bg-slate-700/40 hover:text-slate-100",
                ].join(" ")}
              >
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session?.username ? (
              <Link
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700/30"
                href={`/u/${encodeURIComponent(session.username)}`}
              >
                @{session.username}
              </Link>
            ) : null}
            <button
              className="btn btn-danger"
              onClick={() => {
                clearToken();
                router.replace("/login");
              }}
            >
              Çıkış
            </button>
          </div>
        </header>

        <main className="mt-4 grid gap-4 md:grid-cols-[1fr_300px]">
          <section className="pn-shell p-4">
            {children}
          </section>
          <aside className="pn-shell p-4">
            <div className="pn-title text-slate-100">PulseNet endpoint matrisi</div>
            <div className="mt-2 space-y-1 text-xs leading-5 pn-muted">
              <div>- Auth: `POST /api/auth/login|register`</div>
              <div>- Users: `GET /api/users/by-username/{`{username}`}`</div>
              <div>- Posts: `GET /api/posts/recent`, `POST /api/posts`</div>
              <div>
                - Follows: `GET /api/follows/followers|following/{`{userId}`}`
              </div>
              <div>- Timeline: `GET /api/timeline/{`{userId}`}`</div>
            </div>
            <div className="mt-4 rounded-xl border border-sky-300/30 bg-sky-300/10 p-3 text-xs text-sky-100">
              UI yenilendi, backend davranisi korunuyor.
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

