'use client';

import { useEffect, useState } from 'react';
import CreatePost from '@/components/CreatePost';
import PostCard from '@/components/PostCard';
import { postsApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Sparkles } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');

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
    <div className="flex flex-col min-h-screen">
      {/* Header Sticky */}
      <header className="sticky top-0 bg-white dark:bg-black/80 backdrop-blur-md z-20 border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-extrabold tracking-tight">Home</h1>
          <button className="p-2 hover:bg-muted rounded-full transition-all text-accent group">
             <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
        
        <div className="flex w-full mt-1">
          <button 
            onClick={() => setActiveTab('for-you')}
            className={`flex-1 py-4 text-sm font-bold transition-all relative group hover:bg-muted ${activeTab === 'for-you' ? 'text-foreground' : 'text-gray-500'}`}
          >
            For you
            {activeTab === 'for-you' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-accent rounded-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-4 text-sm font-bold transition-all relative group hover:bg-muted ${activeTab === 'following' ? 'text-foreground' : 'text-gray-500'}`}
          >
            Following
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-accent rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        <CreatePost onPostCreated={fetchPosts} />

        <div className="min-h-screen">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCcw className="animate-spin text-accent" size={30} />
            </div>
          ) : (
            <AnimatePresence>
              {posts.map((post, idx) => (
                <PostCard key={post.id || idx} post={post} />
              ))}
            </AnimatePresence>
          )}

          {!isLoading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center max-w-sm mx-auto">
              <div className="bg-accent rounded-full p-4 mb-4 text-white">
                 <Sparkles size={40} />
              </div>
              <h2 className="text-2xl font-black mb-2">Welcome to PulseNet</h2>
              <p className="text-gray-500 mb-6">Start by following people or making your first post. What's on your mind?</p>
              <button onClick={fetchPosts} className="btn-primary">
                Refresh Feed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
