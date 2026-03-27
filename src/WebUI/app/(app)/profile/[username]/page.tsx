'use client';

import { useEffect, useState, use } from 'react';
import { usersApi, postsApi, followsApi } from '@/lib/api';
import PostCard from '@/components/PostCard';
import { Calendar, MapPin, Link as LinkIcon, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Profile({ params }: { params: any }) {
  const router = useRouter();
  const { username } = use(params) as any;
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('pulsenet_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const profileRes = await usersApi.getByUsername(username);
        setProfile(profileRes.data);
        
        const postsRes = await postsApi.getByAuthor(profileRes.data.id || profileRes.data.username);
        setPosts(postsRes.data);
        
        if (currentUser && currentUser.username !== username) {
          const followingsRes = await followsApi.getFollowing(currentUser.id || currentUser.username);
          const isF = followingsRes.data.some((f: any) => f.followeeId === profileRes.data.id);
          setIsFollowing(isF);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || !profile) return;
    try {
      if (isFollowing) {
        await followsApi.unfollow(currentUser.id, profile.id);
      } else {
        await followsApi.follow(currentUser.id, profile.id);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center p-20"><RefreshCcw className="animate-spin text-accent" /></div>;
  if (!profile) return <div className="p-20 text-center">User not found</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-border flex items-center p-2 gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full">
           <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold">{profile.displayName || profile.username}</h1>
          <p className="text-sm text-gray-500">{posts.length} posts</p>
        </div>
      </header>

      <div className="relative">
        <div className="h-48 bg-accent/20 w-full" />
        <div className="absolute -bottom-16 left-4 border-4 border-black rounded-full overflow-hidden w-32 h-32 bg-accent flex items-center justify-center text-4xl font-bold text-white uppercase">
          {profile.username.charAt(0)}
        </div>
        <div className="flex justify-end p-4">
          {currentUser && currentUser.username === username ? (
            <button className="btn-outline">Edit Profile</button>
          ) : (
            <button 
              onClick={handleFollow}
              className={isFollowing ? "btn-outline" : "bg-foreground text-background font-bold px-6 py-2 rounded-full"}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 px-4">
        <h2 className="text-xl font-black">{profile.displayName || profile.username}</h2>
        <p className="text-gray-500">@{profile.username}</p>
        <p className="mt-3 text-foreground whitespace-pre-wrap">{profile.bio || "No bio yet."}</p>
        
        <div className="flex flex-wrap gap-4 mt-3 text-gray-500 text-sm">
          <div className="flex items-center gap-1"><MapPin size={16} /> Somewhere</div>
          <div className="flex items-center gap-1 text-accent"><LinkIcon size={16} /> link.tree/pulse</div>
          <div className="flex items-center gap-1"><Calendar size={16} /> Joined March 2026</div>
        </div>

        <div className="flex gap-4 mt-4">
          <p className="text-foreground font-bold">1.2K <span className="text-gray-500 font-normal">Following</span></p>
          <p className="text-foreground font-bold">4.8K <span className="text-gray-500 font-normal">Followers</span></p>
        </div>
      </div>

      <nav className="flex border-b border-border mt-6">
        {['Posts', 'Replies', 'Highlights', 'Media'].map((tab) => (
          <button key={tab} className="flex-1 py-4 hover:bg-muted font-bold relative group">
            <span className={tab === 'Posts' ? 'text-foreground' : 'text-gray-500'}>{tab}</span>
            {tab === 'Posts' && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-accent rounded-full" />}
          </button>
        ))}
      </nav>

      <div className="flex-1">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
