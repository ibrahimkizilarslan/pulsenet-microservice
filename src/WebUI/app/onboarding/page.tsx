"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { UserProfile } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const session = getSession();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) router.replace("/login?next=/onboarding");
  }, [session, router]);

  async function submit() {
    setError(null);
    if (!session?.username) {
      setError("JWT içinde username yok. (claim: unique_name)");
      return;
    }

    setBusy(true);
    try {
      const profile = await api<UserProfile>("/api/users/", {
        method: "POST",
        body: JSON.stringify({
          username: session.username,
          displayName: displayName || session.username,
          bio,
        }),
      });
      router.replace(`/u/${encodeURIComponent(profile.username)}`);
    } catch {
      setError("Profil oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100svh] bg-app">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur">
          <div className="text-xs font-semibold text-white/70">Onboarding</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Profilini oluştur
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Users servisi: <span className="font-mono">POST /api/users/</span>
          </p>

          <div className="mt-6 space-y-3">
            <input
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
              placeholder="Görünen ad"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <textarea
              className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-white/20"
              rows={4}
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <button className="btn btn-primary w-full" onClick={submit} disabled={busy}>
              {busy ? "Kaydediliyor..." : "Devam et"}
            </button>
            {error ? <div className="text-xs text-red-300">{error}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

