'use client';

import { 
  Search, 
  Settings, 
  MoreHorizontal, 
  TrendingUp, 
  UserPlus 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Trend = ({ category, title, posts }: { category: string, title: string, posts: string }) => (
  <div className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
    <div className="flex items-center justify-between text-gray-500 text-xs text-opacity-80">
      <span>{category} · Trending</span>
      <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:bg-opacity-10 rounded-full">
        <MoreHorizontal size={14} />
      </button>
    </div>
    <p className="font-bold text-[15px] mt-0.5 text-foreground leading-tight">{title}</p>
    <p className="text-gray-500 text-xs mt-1">{posts} posts</p>
  </div>
);

const UserToFollow = ({ name, username }: { name: string, username: string }) => (
  <div className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm uppercase">
        {name.charAt(0)}
      </div>
      <div>
        <p className="font-bold text-sm text-foreground hover:underline">{name}</p>
        <p className="text-gray-500 text-sm">@{username}</p>
      </div>
    </div>
    <button className="bg-foreground text-background font-bold px-4 py-1.5 rounded-full text-sm hover:opacity-90 transition-all active:scale-95">
      Follow
    </button>
  </div>
);

export default function RightSidebar() {
  return (
    <div className="hidden lg:flex flex-col gap-4 py-3 px-6 h-full border-l border-border sticky top-0 overflow-y-auto">
      {/* Search Bar */}
      <div className="sticky top-0 bg-white dark:bg-black py-2 z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none group-focus-within:text-accent text-gray-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search PulseNet"
            className="w-full bg-gray-100 dark:bg-[#16181c] border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-1 focus:ring-accent focus:bg-transparent outline-none transition-all placeholder:text-gray-500 text-sm"
          />
        </div>
      </div>

      {/* Subscribe Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-100 dark:bg-[#16181c] rounded-2xl p-4 border border-border/10"
      >
        <h2 className="font-extrabold text-xl mb-2 text-foreground">Subscribe to Premium</h2>
        <p className="text-sm mb-4 leading-normal text-foreground text-opacity-80">
          Subscribe to unlock new features and if eligible, receive a share of ads revenue.
        </p>
        <button className="bg-accent text-white font-bold px-5 py-2 rounded-full hover:bg-opacity-90 transition-all active:scale-95">
          Get Verified
        </button>
      </motion.div>

      {/* What's Happening */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-100 dark:bg-[#16181c] rounded-2xl overflow-hidden border border-border/10"
      >
        <h2 className="font-extrabold text-xl p-4 text-foreground">What's happening</h2>
        <Trend category="Technology" title="PulseNet Microservices" posts="12.5K" />
        <Trend category="Gaming" title="Elden Ring DLC" posts="84.2K" />
        <Trend category="Entertainment" title="New Netflix Series" posts="4.1K" />
        <Trend category="Sports" title="Champions League" posts="156K" />
        <button className="w-full text-left p-4 text-accent text-sm hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          Show more
        </button>
      </motion.div>

      {/* Who to follow */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-100 dark:bg-[#16181c] rounded-2xl overflow-hidden border border-border/10"
      >
        <h2 className="font-extrabold text-xl p-4 text-foreground">Who to follow</h2>
        <UserToFollow name="Google DeepMind" username="DeepMind" />
        <UserToFollow name="Next.js" username="nextjs" />
        <UserToFollow name="Vercel" username="vercel" />
        <button className="w-full text-left p-4 text-accent text-sm hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          Show more
        </button>
      </motion.div>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 text-gray-500 text-[13px] leading-tight text-opacity-70">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Cookie Policy</a>
        <a href="#" className="hover:underline">Accessibility</a>
        <a href="#" className="hover:underline">Ads info</a>
        <a href="#" className="hover:underline">More...</a>
        <span>© 2026 PulseNet, Inc.</span>
      </div>
    </div>
  );
}
