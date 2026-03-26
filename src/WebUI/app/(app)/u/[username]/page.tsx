"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Post, UserProfile } from "@/lib/types";
import { PostCard } from "@/components/PostCard";

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    (async () => {
      setError(null);
      try {
        const p = await api<UserProfile>(
          `/api/users/by-username/${encodeURIComponent(username)}`,
        );
        setProfile(p);
        const authored = await api<Post[]>(
          `/api/posts/by-author/${encodeURIComponent(p.id)}`,
        );
        setPosts(authored);
      } catch {
        setError("Profil yüklenemedi.");
        setProfile(null);
        setPosts(null);
      }
    })();
  }, [username]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">
            {profile?.displayName ?? `@${username ?? ""}`}
          </div>
          <div className="mt-1 text-xs text-white/60">
            <span className="font-mono">GET /api/users/by-username/{`{username}`}</span>
          </div>
        </div>

        {profile ? (
          <div className="flex items-center gap-2">
            <Link
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
              href={`/u/${encodeURIComponent(profile.username)}/followers?userId=${encodeURIComponent(profile.id)}`}
            >
              Followers
            </Link>
            <Link
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
              href={`/u/${encodeURIComponent(profile.username)}/following?userId=${encodeURIComponent(profile.id)}`}
            >
              Following
            </Link>
          </div>
        ) : null}
      </div>

      {error ? <div className="text-xs text-red-300">{error}</div> : null}

      {profile ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs font-semibold text-white/70">@{profile.username}</div>
          <div className="mt-1 text-sm text-white/85">{profile.bio || "—"}</div>
          <div className="mt-2 text-[11px] text-white/45 font-mono">id: {profile.id}</div>
        </div>
      ) : null}

      <div className="space-y-3">
        {(posts ?? []).map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}

