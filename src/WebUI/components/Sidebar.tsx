'use client';

import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  List, 
  Bookmark, 
  CheckCircle, 
  User, 
  MoreHorizontal, 
  LogOut 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  href, 
  active 
}: { 
  icon: any, 
  label: string, 
  href: string, 
  active?: boolean 
}) => {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-4 p-3 rounded-full transition-all hover:bg-muted group w-fit xl:w-full",
        active && "font-bold"
      )}
    >
      <Icon size={26} className={cn("text-foreground", active && "text-accent fill-accent")} />
      <span className="hidden xl:block text-xl">{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pulsenet_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    authApi.logout();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full py-4 px-2 xl:px-4 border-r border-border">
      <Link href="/" className="mb-4 ml-3 flex items-center gap-2">
        <div className="bg-accent p-2 rounded-lg">
          <span className="text-white font-black text-2xl tracking-tighter">P</span>
        </div>
        <span className="hidden xl:block font-extrabold text-2xl tracking-tight text-accent">PulseNet</span>
      </Link>

      <nav className="flex flex-col space-y-2 mt-4">
        <SidebarItem icon={Home} label="Home" href="/" active={pathname === '/'} />
        <SidebarItem icon={Search} label="Explore" href="/explore" active={pathname === '/explore'} />
        <SidebarItem icon={Bell} label="Notifications" href="/notifications" />
        <SidebarItem icon={Mail} label="Messages" href="/messages" />
        <SidebarItem icon={Bookmark} label="Bookmarks" href="/bookmarks" />
        {user && (
          <SidebarItem icon={User} label="Profile" href={`/profile/${user.username}`} active={pathname.startsWith('/profile')} />
        )}
      </nav>

      <div className="mt-8 mb-4 xl:w-full flex justify-center xl:justify-start">
        <button className="bg-accent text-white font-bold p-3 xl:py-3 xl:px-6 rounded-full w-fit xl:w-full text-lg shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
          <span className="xl:hidden">+</span>
          <span className="hidden xl:inline">Post</span>
        </button>
      </div>

      <div className="mt-auto flex items-center justify-between xl:w-full p-3 rounded-full hover:bg-muted transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold uppercase">
            {user?.username?.charAt(0) || 'U'}
          </div>
          <div className="hidden xl:block">
            <p className="font-bold text-sm truncate">{user?.displayName || user?.username || 'Guest'}</p>
            <p className="text-gray-500 text-xs text-opacity-80">@{user?.username || 'user'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="hidden xl:block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
          <LogOut size={18} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}
