'use client';

import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api';

export default function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pulsenet_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      // Extract hashtags
      const tags = content.match(/#(\w+)/g)?.map(t => t.replace('#', '')) || [];
      
      await postsApi.create({
        content,
        authorId: user.id || user.username,
        tags
      });
      
      setContent('');
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-b border-border bg-black">
      <div className="flex gap-4">
        <div className="flex-shrink-0 hidden sm:block">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold uppercase">
            {user?.username?.charAt(0) || 'U'}
          </div>
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ne dusunuyorsun?"
            className="w-full bg-transparent border border-border rounded-xl p-3 text-base outline-none placeholder:text-gray-500 min-h-[92px] resize-none"
          />
          <div className="flex items-center justify-end mt-3">
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Paylasiliyor...' : 'Paylas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
