'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, usersApi } from '@/lib/api';
import Link from 'next/link';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await authApi.login({ username, password });
      localStorage.setItem('pulsenet_token', data.token);

      try {
        const profileRes = await usersApi.getByUsername(data.username);
        localStorage.setItem('pulsenet_user', JSON.stringify(profileRes.data));
      } catch {
        localStorage.setItem('pulsenet_user', JSON.stringify({ username: data.username }));
      }

      router.push('/');
    } catch {
      setError('Giris basarisiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">PulseNet Giris</h1>
        <p className="text-sm text-gray-500 mt-1">/api/auth/login</p>

        <form onSubmit={handleLogin} className="space-y-3 mt-5">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isSubmitting ? 'Giris yapiliyor...' : 'Giris Yap'}
          </button>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        </form>

        <div className="mt-5 text-sm text-gray-500">
          Hesabin yok mu?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Kayit ol
          </Link>
        </div>
      </div>
    </div>
  );
}
