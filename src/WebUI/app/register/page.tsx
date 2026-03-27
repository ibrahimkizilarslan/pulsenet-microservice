'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from '@/lib/api';
import Link from 'next/link';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const authRes = await authApi.register({ username, password });
      localStorage.setItem('pulsenet_token', authRes.data.token);

      const userProfile = {
        username: authRes.data.username,
        displayName: displayName || authRes.data.username,
        bio: bio || '',
      };

      try {
        await usersApi.createProfile(userProfile);
        const profileRes = await usersApi.getByUsername(authRes.data.username);
        localStorage.setItem('pulsenet_user', JSON.stringify(profileRes.data));
      } catch (profileErr) {
        console.error('Failed to create profile:', profileErr);
        localStorage.setItem('pulsenet_user', JSON.stringify({ username: authRes.data.username }));
      }

      router.push('/');
    } catch {
      setError('Kayit basarisiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">PulseNet Kayit</h1>
        <p className="text-sm text-gray-500 mt-1">/api/auth/register + /api/users</p>

        <form onSubmit={handleRegister} className="space-y-3 mt-5">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Gorunen ad"
            className="input-field"
            required
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanici adi"
            className="input-field"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sifre"
            className="input-field"
            required
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio (opsiyonel)"
            className="input-field min-h-24"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isSubmitting ? 'Olusturuluyor...' : 'Kayit Ol'}
          </button>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        </form>

        <div className="mt-5 text-sm text-gray-500">
          Zaten hesabin var mi?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Giris yap
          </Link>
        </div>
      </div>
    </div>
  );
}
