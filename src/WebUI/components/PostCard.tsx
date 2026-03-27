'use client';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export interface PostProps {
  id: string;
  authorId: string;
  authorUsername?: string;
  authorDisplayName?: string;
  content: string;
  createdAt: string;
  tags?: string[];
}

export default function PostCard({ post }: { post: PostProps }) {
  return (
    <article className="p-4 border-b border-border">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold uppercase">
            {post.authorUsername?.charAt(0) || post.authorId?.charAt(0) || 'U'}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              <Link 
                href={`/profile/${post.authorUsername || post.authorId}`}
                className="font-bold text-foreground hover:underline"
              >
                {post.authorDisplayName || post.authorId}
              </Link>
              <span className="text-gray-500 text-sm">@{post.authorUsername || post.authorId}</span>
              <span className="text-gray-500 text-xs mx-1">·</span>
              <span className="text-gray-500 text-xs hover:underline">{formatDate(post.createdAt)}</span>
            </div>
          </div>

          <div className="mt-2 text-[15px] leading-6 text-foreground text-opacity-95">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-accent text-[14px] hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
