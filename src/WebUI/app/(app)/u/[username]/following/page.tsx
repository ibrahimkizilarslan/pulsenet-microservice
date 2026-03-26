"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { api } from "@/lib/api";
import type { Follow } from "@/lib/types";

function FollowingInner() {
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const search = useSearchParams();
  const userId = search.get("userId");

  const [rows, setRows] = useState<Follow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setError(null);
      try {
        const data = await api<Follow[]>(
          `/api/follows/following/${encodeURIComponent(userId)}`,
        );
        setRows(data);
      } catch {
        setError("Following yüklenemedi.");
        setRows([]);
      }
    })();
  }, [userId]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-white">Following • @{username}</div>
        <div className="mt-1 text-xs text-white/60">
          Endpoint: <span className="font-mono">GET /api/follows/following/{`{userId}`}</span>
        </div>
      </div>

      {error ? <div className="text-xs text-red-300">{error}</div> : null}

      <div className="space-y-2">
        {(rows ?? []).map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70"
          >
            followeeId: <span className="font-mono">{f.followeeId}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FollowingPage() {
  return (
    <Suspense>
      <FollowingInner />
    </Suspense>
  );
}

