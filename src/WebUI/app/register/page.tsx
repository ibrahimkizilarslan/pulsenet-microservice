'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Lock, Sparkles, ChevronRight, UserCircle, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Register in Auth Service
      const authRes = await authApi.register({ username, password });
      localStorage.setItem('pulsenet_token', authRes.data.token);
      
      // 2. Create profile in Users Service
      const userProfile = { 
        id: authRes.data.id, 
        username: authRes.data.username, 
        displayName: displayName || authRes.data.username 
      };
      
      try {
        await usersApi.createProfile(userProfile);
        localStorage.setItem('pulsenet_user', JSON.stringify(userProfile));
      } catch (profileErr) {
        console.error('Failed to create profile:', profileErr);
        localStorage.setItem('pulsenet_user', JSON.stringify({ username: authRes.data.username }));
      }
      
      toast.success("Account created! Welcome to PulseNet.");
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-6 bg-white dark:bg-black overflow-hidden relative">
       {/* Background Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500 opacity-10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent opacity-5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white dark:bg-black border border-border rounded-3xl p-10 shadow-2xl relative z-10 overflow-hidden"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-emerald-500 p-4 rounded-2xl mb-6 shadow-xl shadow-emerald-500/20">
             <KeyRound size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Join PulseNet</h1>
          <p className="text-gray-500 font-medium">Create an account and start connecting Today.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
           <div className="space-y-2">
            <label className="text-sm font-bold ml-1 text-gray-500">Display Name</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-4 flex items-center group-focus-within/input:text-accent text-gray-400 transition-colors">
                <UserCircle size={18} />
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full bg-gray-50 dark:bg-[#16181c] border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-accent focus:bg-transparent outline-none transition-all placeholder:text-gray-500"
                required
              />
            </div>
          </div>

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
                placeholder="@username"
                className="w-full bg-gray-50 dark:bg-[#16181c] border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-accent focus:bg-transparent outline-none transition-all placeholder:text-gray-500 font-mono"
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
                placeholder="Must be at least 8 characters"
                className="w-full bg-gray-50 dark:bg-[#16181c] border border-border rounded-2xl py-4 pl-12 pr-4 focus:ring-1 focus:ring-accent focus:bg-transparent outline-none transition-all placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50 text-lg group/btn mt-4"
          >
            {isSubmitting ? 'Creating...' : 'Create Account'}
            <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-4">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-bold hover:underline transition-all">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
