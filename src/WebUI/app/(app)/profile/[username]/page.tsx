'use client';

import { useEffect, useState } from 'react';
import { usersApi, postsApi, followsApi } from '@/lib/api';
import PostCard from '@/components/PostCard';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { ensureStoredUserHasId } from '@/lib/userProfile';

export default function Profile() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const me = await ensureStoredUserHasId();
        if (me) setCurrentUser(me);

        const profileRes = await usersApi.getByUsername(username);
        setProfile(profileRes.data);

        const postsRes = await postsApi.getByAuthor(profileRes.data.id);
        setPosts(postsRes.data);

        if (me?.id && me.id !== profileRes.data.id) {
          const followingsRes = await followsApi.getFollowing(me.id);
          const isF = followingsRes.data.some((f: any) => f.followeeId === profileRes.data.id);
          setIsFollowing(isF);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [username]);

  const handleFollow = async () => {
    const me = await ensureStoredUserHasId();
    if (!me?.id || !profile) return;
    try {
      if (isFollowing) {
        await followsApi.unfollow(me.id, profile.id);
      } else {
        await followsApi.follow(me.id, profile.id);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center p-20"><RefreshCcw className="animate-spin text-accent" /></div>;
  if (!profile) return <div className="p-20 text-center">User not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 bg-black/90 backdrop-blur-md z-10 border-b border-border flex items-center p-2 gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full">
           <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">{profile.displayName || profile.username}</h1>
          <p className="text-xs text-gray-500">{posts.length} gonderi</p>
        </div>
      </header>

      <div className="relative border-b border-border">
        <div className="h-28 bg-accent/20 w-full" />
        <div className="absolute -bottom-10 left-4 border-4 border-black rounded-full overflow-hidden w-20 h-20 bg-accent flex items-center justify-center text-2xl font-bold text-white uppercase">
          {profile.username.charAt(0)}
        </div>
        <div className="flex justify-end p-3">
          {currentUser?.id && profile?.id && currentUser.id === profile.id ? (
            <button className="btn-outline">Profili Duzenle</button>
          ) : currentUser?.id && profile?.id && currentUser.id !== profile.id ? (
            <button 
              onClick={handleFollow}
              className={isFollowing ? "btn-outline" : "bg-foreground text-background font-bold px-6 py-2 rounded-full"}
            >
              {isFollowing ? 'Takiptesin' : 'Takip Et'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 px-4">
        <h2 className="text-lg font-bold">{profile.displayName || profile.username}</h2>
        <p className="text-gray-500">@{profile.username}</p>
        <p className="mt-3 text-foreground whitespace-pre-wrap">{profile.bio || "Bio yok."}</p>
        
        <div className="mt-4 flex gap-3 text-sm">
          <button
            onClick={async () => {
              const res = await followsApi.getFollowers(profile.id);
              alert(`Followers: ${res.data.length}`);
            }}
            className="btn-outline"
          >
            Followers
          </button>
          <button
            onClick={async () => {
              const res = await followsApi.getFollowing(profile.id);
              alert(`Following: ${res.data.length}`);
            }}
            className="btn-outline"
          >
            Following
          </button>
        </div>
      </div>

      <div className="flex-1">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
