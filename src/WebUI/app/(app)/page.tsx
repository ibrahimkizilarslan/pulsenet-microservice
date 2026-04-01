'use client';

import { useCallback, useEffect, useState } from 'react';
import CreatePost from '@/components/CreatePost';
import PostCard, { type PostProps } from '@/components/PostCard';
import { timelineApi, usersApi } from '@/lib/api';
import { ensureStoredUserHasId } from '@/lib/userProfile';
import { RefreshCcw } from 'lucide-react';

type TimelineEntryResponse = {
  postId: string;
  authorId: string;
  content: string;
  postCreatedAt: string;
};

export default function Home() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    try {
      const me = await ensureStoredUserHasId();
      if (!me?.id) {
        setPosts([]);
        return;
      }

      const { data: entries } = await timelineApi.getTimeline(me.id);
      const list = entries as TimelineEntryResponse[];
      const authorIds = [...new Set(list.map((e) => e.authorId))];
      const authorMap = new Map<string, { username: string; displayName?: string }>();

      await Promise.all(
        authorIds.map(async (id) => {
          try {
            const { data } = await usersApi.getById(id);
            authorMap.set(id, {
              username: data.username,
              displayName: data.displayName,
            });
          } catch {
            /* author lookup optional */
          }
        }),
      );

      setPosts(
        list.map((e) => ({
          id: e.postId,
          authorId: e.authorId,
          authorUsername: authorMap.get(e.authorId)?.username,
          authorDisplayName: authorMap.get(e.authorId)?.displayName,
          content: e.content,
          createdAt: e.postCreatedAt,
        })),
      );
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold">Ana AkiS</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <CreatePost onPostCreated={fetchFeed} />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCcw className="animate-spin text-accent" size={24} />
          </div>
        ) : null}

        {!isLoading && posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Gosterilecek gonderi yok.
          </div>
        ) : null}

        {!isLoading && posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
