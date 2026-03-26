"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import type { AuthResponse } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await api<AuthResponse>("/api/auth/register", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ username, password }),
      });
      setToken(res.token);
      // Profile creation is a separate service (`POST /api/users/`),
      // so we send users to onboarding to create their profile.
      router.replace("/onboarding");
    } catch {
      setError("Kayıt başarısız.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[100svh] bg-app">
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur">
          <div className="text-xs font-semibold text-white/70">PulseNet</div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Kayıt</h1>
          <p className="mt-1 text-sm text-white/60">
            Gateway: <span className="font-mono">/api/auth/register</span>
          </p>

          <div className="mt-6 space-y-3">
            <input
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
              placeholder="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary w-full" onClick={submit} disabled={busy}>
              {busy ? "Oluşturuluyor..." : "Hesap oluştur"}
            </button>
            {error ? <div className="text-xs text-red-300">{error}</div> : null}
          </div>

          <div className="mt-6 text-sm text-white/60">
            Zaten hesabın var mı?{" "}
            <Link className="font-semibold text-white hover:underline" href="/login">
              Giriş yap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

