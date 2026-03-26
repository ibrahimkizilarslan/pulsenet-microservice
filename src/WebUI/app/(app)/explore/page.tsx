"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Post } from "@/lib/types";
import { PostCard } from "@/components/PostCard";

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const list = posts ?? [];
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [posts]);

  async function load() {
    setError(null);
    try {
      const data = await api<Post[]>("/api/posts/recent");
      setPosts(data);
    } catch {
      setError("Recent posts yüklenemedi.");
      setPosts([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-white">Explore</div>
        <div className="mt-1 text-xs text-white/60">
          Endpoint: <span className="font-mono">GET /api/posts/recent</span>
        </div>
      </div>

      {error ? <div className="text-xs text-red-300">{error}</div> : null}

      <div className="space-y-3">
        {sorted.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

