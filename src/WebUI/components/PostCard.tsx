"use client";

import Link from "next/link";
import type { Post, TimelineEntry } from "@/lib/types";

export function PostCard({
  post,
  entry,
}: {
  post?: Post | null;
  entry?: TimelineEntry | null;
}) {
  const id = post?.id ?? entry?.postId ?? "unknown";
  const content = post?.content ?? entry?.content ?? "";
  const authorId = post?.authorId ?? entry?.authorId ?? "";
  const ts = post?.createdAt ?? entry?.postCreatedAt ?? null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-white/75">
          AuthorId: <span className="font-mono text-white/60">{authorId}</span>
        </div>
        <Link
          className="text-xs font-semibold text-white/70 hover:text-white"
          href={`/posts/${encodeURIComponent(id)}`}
        >
          Detay
        </Link>
      </div>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white">
        {content}
      </div>
      {ts ? (
        <div className="mt-2 text-[11px] text-white/45">
          {new Date(ts).toLocaleString()}
        </div>
      ) : null}
    </div>
  );
}

