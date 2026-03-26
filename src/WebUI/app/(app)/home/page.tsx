"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { TimelineEntry } from "@/lib/types";
import { PostComposer } from "@/components/PostComposer";
import { PostCard } from "@/components/PostCard";

export default function HomePage() {
  const session = getSession();
  const userId = session?.userId ?? null;

  const [entries, setEntries] = useState<TimelineEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const list = entries ?? [];
    return [...list].sort(
      (a, b) => new Date(b.postCreatedAt).getTime() - new Date(a.postCreatedAt).getTime(),
    );
  }, [entries]);

  async function load() {
    if (!userId) return;
    setError(null);
    try {
      const data = await api<TimelineEntry[]>(`/api/timeline/${encodeURIComponent(userId)}`);
      setEntries(data);
    } catch {
      setError("Timeline yüklenemedi.");
      setEntries([]);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-white">Home</div>
        <div className="mt-1 text-xs text-white/60">
          Endpoint: <span className="font-mono">GET /api/timeline/{`{userId}`}</span>
        </div>
      </div>

      <PostComposer onCreated={() => load()} />

      {error ? <div className="text-xs text-red-300">{error}</div> : null}

      <div className="space-y-3">
        {sorted.map((e) => (
          <PostCard key={e.id} entry={e} />
        ))}
        {entries && entries.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/70">
            Timeline boş görünüyor. (Bu backend’de timeline entry’leri ayrıca
            oluşturuluyor.)
          </div>
        ) : null}
      </div>
    </div>
  );
}

