'use client';

import { 
  Image as ImageIcon, 
  MapPin, 
  Smile, 
  Calendar, 
  User as UserIcon, 
  Plus 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { postsApi } from '@/lib/api';
import toast from 'react-hot-toast';

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
      toast.success('Post published!', {
        icon: '🚀',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      if (onPostCreated) onPostCreated();
    } catch (error) {
      toast.error('Failed to post. Check your connection.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 border-b border-border bg-white dark:bg-black">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold uppercase shadow-sm">
            {user?.username?.charAt(0) || 'U'}
          </div>
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-transparent border-none text-xl outline-none placeholder:text-gray-500 min-h-[80px] py-3 resize-none focus:ring-0"
          />
          <div className="flex items-center justify-between border-t border-border mt-2 pt-3">
            <div className="flex items-center gap-1 text-accent">
              <button className="p-2 hover:bg-accent hover:bg-opacity-10 rounded-full transition-all">
                <ImageIcon size={20} />
              </button>
              <button className="p-2 hover:bg-accent hover:bg-opacity-10 rounded-full transition-all">
                <Plus size={20} className="rotate-45" />
              </button>
              <button className="p-2 hover:bg-accent hover:bg-opacity-10 rounded-full transition-all">
                <Smile size={20} />
              </button>
              <button className="p-2 hover:bg-emerald-500 hover:bg-opacity-10 rounded-full transition-all text-emerald-500">
                <MapPin size={20} />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className="bg-accent text-white font-bold py-2 px-6 rounded-full disabled:opacity-50 hover:bg-opacity-90 transition-all shadow-md active:scale-95"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
