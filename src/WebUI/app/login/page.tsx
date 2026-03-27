'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, ChevronRight, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await authApi.login({ username, password });
      localStorage.setItem('pulsenet_token', data.token);
      
      // Fetch user profile
      try {
        const profileRes = await usersApi.getByUsername(data.username);
        localStorage.setItem('pulsenet_user', JSON.stringify(profileRes.data));
      } catch {
        localStorage.setItem('pulsenet_user', JSON.stringify({ username: data.username }));
      }
      
      toast.success(`Welcome back, ${data.username}!`, {
        icon: '👋',
        style: { background: '#333', color: '#fff', borderRadius: '15px' }
      });
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-6 bg-white dark:bg-black overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent opacity-10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500 opacity-5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full max-w-[450px] bg-white dark:bg-black border border-border rounded-3xl p-10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="bg-accent p-4 rounded-2xl mb-6 shadow-xl shadow-accent/20">
             <Fingerprint size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">PulseNet</h1>
          <p className="text-gray-500 text-center font-medium">Capture the pulse of the world.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 text-gray-500">Username</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-4 flex items-center group-focus-within/input:text-accent text-gray-400 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-gray-50 dark:bg-[#16181c] border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-accent focus:bg-transparent outline-none transition-all placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 text-gray-500">Password</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-4 flex items-center group-focus-within/input:text-accent text-gray-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-50 dark:bg-[#16181c] border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-accent focus:bg-transparent outline-none transition-all placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-lg group/btn"
          >
            {isSubmitting ? 'Verifying...' : 'Sign In'}
            <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-border flex flex-col items-center gap-4">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-accent font-bold hover:underline">
              Create one
            </Link>
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Help</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
