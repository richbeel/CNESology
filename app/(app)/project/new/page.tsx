import { redirect } from 'next/navigation';
import { NewProjectForm } from '@/components/projects/NewProjectForm';
import { BackLink } from '@/components/ui/BackLink';
import { getSessionProfile } from '@/lib/supabase/server';

export default async function NewProjectPage() {
  const session = await getSessionProfile();
  if (!session) redirect('/login');
  if (session.profile.role === 'director') redirect('/director');

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-3 pb-8">
      <BackLink href="/dashboard" label="Zpět na projekty" />
      <h1 className="mt-2 text-2xl font-semibold">Nový projekt</h1>
      <p className="mt-2 text-muted">
        Vyplňte údaje a nahrajte koordinační situaci. Po vytvoření projekt ověříte na detailu.
      </p>
      <NewProjectForm />
    </div>
  );
}
