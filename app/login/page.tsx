import { Suspense } from 'react';
import { CnesVisionLogo } from '@/components/branding/CnesVisionLogo';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-[#f5f5f5] px-4 py-6 sm:px-6">
      <div className="flex w-full max-w-sm flex-col items-center justify-center">
        <CnesVisionLogo large className="mb-8 sm:mb-10" />
        <div className="w-full">
          <Suspense fallback={<p className="text-center text-sm text-zinc-500">Načítám…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
