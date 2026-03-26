"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Post } from "@/lib/types";
import { PostCard } from "@/components/PostCard";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setError(null);
      try {
        const data = await api<Post>(`/api/posts/${encodeURIComponent(id)}`);
        setPost(data);
      } catch {
        setError("Post bulunamadı.");
      }
    })();
  }, [id]);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-white">Post</div>
        <div className="mt-1 text-xs text-white/60">
          Endpoint: <span className="font-mono">GET /api/posts/{`{id}`}</span>
        </div>
      </div>

      {error ? <div className="text-xs text-red-300">{error}</div> : null}
      {post ? <PostCard post={post} /> : null}
    </div>
  );
}

