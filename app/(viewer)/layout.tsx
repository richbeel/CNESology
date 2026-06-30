import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';

export default async function ViewerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  if (!session) redirect('/login');

  return <div className="min-h-dvh">{children}</div>;
}
