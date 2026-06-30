import Link from 'next/link';
import type { Profile } from '@/lib/types/auth';
import { signOut } from '@/lib/auth/actions';
import { Button } from '@/components/ui/Button';
import { CnesVisionLogo } from '@/components/branding/CnesVisionLogo';

type AppNavProps = {
  profile: Profile;
};

export function AppNav({ profile }: AppNavProps) {
  const homeHref = profile.role === 'director' ? '/director' : '/dashboard';

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href={homeHref} className="min-w-0 shrink">
          <CnesVisionLogo nav />
        </Link>
        <form action={signOut} className="shrink-0">
          <Button type="submit" variant="outline" size="sm">
            Odhlásit
          </Button>
        </form>
      </div>
    </header>
  );
}
