'use client';

import { useEffect, useState } from 'react';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import { postsApi } from '@/lib/api';
import { RefreshCcw } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data } = await postsApi.getRecent();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold">Ana AkiS</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <CreatePost onPostCreated={fetchPosts} />

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

        {!isLoading && posts.map((post, idx) => (
          <PostCard key={post.id || idx} post={post} />
        ))}
      </div>
    </div>
  );
}
