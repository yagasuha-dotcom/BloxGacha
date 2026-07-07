'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase-client';

export default function DaftarPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.trim(),
      });
      if (profileError) {
        setError('Gagal membuat profil: ' + profileError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-extrabold text-xl">
            Blox<span className="text-accent">Gacha</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <h1 className="font-bold text-lg mb-1">Daftar</h1>

          <input
            type="text"
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            placeholder="Password (minimal 6 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />

          {error && <div className="text-danger text-xs">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-accent text-[#062119] font-bold text-sm disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>

          <div className="text-center text-xs text-text-dim">
            Sudah punya akun?{' '}
            <Link href="/masuk" className="text-accent font-bold">
              Masuk
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
