'use client';

import { 
  Heart, 
  Repeat2, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  User as UserIcon 
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 border-b border-border hover:bg-muted transition-colors cursor-pointer group"
    >
      <div className="flex gap-4">
        {/* Avatar Placeholder */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold uppercase transition-transform hover:scale-105">
            {post.authorUsername?.charAt(0) || post.authorId?.charAt(0) || 'U'}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 group/author">
              <Link 
                href={`/profile/${post.authorUsername || post.authorId}`}
                className="font-bold text-foreground hover:underline transition-all"
              >
                {post.authorDisplayName || post.authorId}
              </Link>
              <span className="text-gray-500 text-sm">@{post.authorUsername || post.authorId}</span>
              <span className="text-gray-500 text-xs text-opacity-70 mx-1">·</span>
              <span className="text-gray-500 text-xs hover:underline">{formatDate(post.createdAt)}</span>
            </div>
            <button className="text-gray-500 hover:text-accent p-1.5 hover:bg-accent hover:bg-opacity-10 rounded-full transition-all">
              <MoreHorizontal size={18} />
            </button>
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

          {/* Post Actions */}
          <div className="mt-4 flex items-center justify-between text-gray-500 max-w-sm">
            <button className="flex items-center gap-2 group/action hover:text-accent transition-all">
              <div className="p-2 group-hover/action:bg-accent group-hover/action:bg-opacity-10 rounded-full transition-all">
                <MessageCircle size={18} className="group-hover/action:scale-110" />
              </div>
              <span className="text-xs group-hover/action:font-medium">12</span>
            </button>
            <button className="flex items-center gap-2 group/action hover:text-emerald-500 transition-all">
              <div className="p-2 group-hover/action:bg-emerald-500 group-hover/action:bg-opacity-10 rounded-full transition-all">
                <Repeat2 size={18} className="group-hover/action:scale-110" />
              </div>
              <span className="text-xs group-hover/action:font-medium">45</span>
            </button>
            <button className="flex items-center gap-2 group/action hover:text-rose-500 transition-all">
              <div className="p-2 group-hover/action:bg-rose-500 group-hover/action:bg-opacity-10 rounded-full transition-all">
                <Heart size={18} className="group-hover/action:scale-110" />
              </div>
              <span className="text-xs group-hover/action:font-medium">189</span>
            </button>
            <button className="flex items-center gap-2 group/action hover:text-accent transition-all">
              <div className="p-2 group-hover/action:bg-accent group-hover/action:bg-opacity-10 rounded-full transition-all">
                <Share size={18} className="group-hover/action:scale-110" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
