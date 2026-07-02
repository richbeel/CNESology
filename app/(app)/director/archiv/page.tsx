import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BackLink } from '@/components/ui/BackLink';
import { ProjectGrid } from '@/components/projects/ProjectGroup';
import { getSessionProfile } from '@/lib/supabase/server';
import { fetchAllProjects } from '@/lib/projects/queries';

export default async function DirectorArchivPage() {
  const session = await getSessionProfile();
  if (!session) redirect('/login');
  if (session.profile.role !== 'director') redirect('/archiv');

  const projects = await fetchAllProjects();
  const completed = projects
    .filter((p) => p.status === 'completed')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackLink href="/director" label="Zpět na přehled" />
          <h1 className="text-2xl font-semibold">Archiv</h1>
        </div>
        <Link
          href="/director"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-heading transition-colors hover:bg-zinc-50"
        >
          Aktivní projekty
        </Link>
      </div>
      <p className="mt-2 text-muted">Dokončené zakázky ve firmě.</p>

      {completed.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
          V archivu zatím není žádný projekt.
        </p>
      ) : (
        <div className="mt-8">
          <ProjectGrid projects={completed} showOwner />
        </div>
      )}
    </div>
  );
}
