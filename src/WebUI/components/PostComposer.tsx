"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { getSession } from "@/lib/auth";
import type { Post } from "@/lib/types";

export function PostComposer({ onCreated }: { onCreated?: (p: Post) => void }) {
  const session = getSession();
  const authorId = session?.userId ?? null;
  const [content, setContent] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tags = useMemo(() => {
    const parts = tagsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length ? parts : null;
  }, [tagsRaw]);

  async function submit() {
    setError(null);
    if (!authorId) {
      setError("Session bulunamadı (JWT).");
      return;
    }
    if (!content.trim()) {
      setError("İçerik boş olamaz.");
      return;
    }

    setBusy(true);
    try {
      const post = await api<Post>("/api/posts/", {
        method: "POST",
        body: JSON.stringify({ authorId, content, tags }),
      });
      setContent("");
      setTagsRaw("");
      onCreated?.(post);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Post oluşturulamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs font-semibold text-white/80">Yeni gönderi</div>
      <textarea
        className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-white/20"
        rows={4}
        placeholder="Ne oluyor?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          className="h-10 w-full rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/20"
          placeholder="Etiketler (virgülle): dotnet, microservices"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
        />
        <button className="btn btn-primary sm:w-[140px]" onClick={submit} disabled={busy}>
          {busy ? "Paylaşılıyor..." : "Paylaş"}
        </button>
      </div>
      {error ? <div className="mt-2 text-xs text-red-300">{error}</div> : null}
    </div>
  );
}

