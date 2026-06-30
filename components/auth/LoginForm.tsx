'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createAuthClient } from '@/lib/supabase/client';
import { loginToEmail } from '@/lib/types/auth';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '';

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createAuthClient(remember);
      const email = loginToEmail(login);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Neplatné přihlašovací jméno nebo heslo.');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const defaultPath = profile?.role === 'director' ? '/director' : '/dashboard';
      const safeNext =
        nextPath.startsWith('/') && !nextPath.startsWith('/login') ? nextPath : defaultPath;

      router.push(safeNext);
      router.refresh();
    } catch {
      setError('Přihlášení se nezdařilo. Zkontrolujte připojení.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Přihlašovací jméno"
        name="username"
        type="text"
        autoComplete="username"
        required
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        placeholder="např. novak"
      />

      <Input
        label="Heslo"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="size-3.5 rounded border-zinc-300 text-blue-800 focus:ring-blue-800"
        />
        Zapamatovat heslo
      </label>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} fullWidth>
        {loading ? 'Přihlašování…' : 'Přihlásit se'}
      </Button>
    </form>
  );
}
