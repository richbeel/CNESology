import { redirect } from 'next/navigation';
import { BackLink } from '@/components/ui/BackLink';
import { ProjectGrid } from '@/components/projects/ProjectGroup';
import { getSessionProfile } from '@/lib/supabase/server';
import { fetchMyProjects } from '@/lib/projects/queries';

export default async function ArchivPage() {
  const session = await getSessionProfile();
  if (!session) redirect('/login');
  if (session.profile.role === 'director') redirect('/director/archiv');

  const projects = await fetchMyProjects(session.userId);
  const completed = projects
    .filter((p) => p.status === 'completed')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3">
        <BackLink href="/dashboard" label="Zpět na projekty" />
        <h1 className="text-2xl font-semibold">Archiv</h1>
      </div>
      <p className="mt-2 text-muted">Dokončené a historické zakázky.</p>

      {completed.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
          V archivu zatím není žádný projekt.
        </p>
      ) : (
        <div className="mt-8">
          <ProjectGrid projects={completed} />
        </div>
      )}
    </div>
  );
}
