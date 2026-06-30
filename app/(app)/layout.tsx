import { redirect } from 'next/navigation';
import { AppNav } from '@/components/layout/AppNav';
import { getSessionProfile } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session) redirect('/login');

  return (
    <>
      <AppNav profile={session.profile} />
      <main className="flex-1">{children}</main>
    </>
  );
}
