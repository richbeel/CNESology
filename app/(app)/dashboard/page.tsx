import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProjectGroup } from '@/components/projects/ProjectGroup';
import { getSessionProfile } from '@/lib/supabase/server';
import { fetchMyProjects } from '@/lib/projects/queries';
import type { ProjectStatus } from '@/lib/types/project';

const STATUS_ORDER: Record<ProjectStatus, number> = {
  active: 0,
  future: 1,
  completed: 2,
};

export default async function DashboardPage() {
  const session = await getSessionProfile();
  if (!session) redirect('/login');
  if (session.profile.role === 'director') redirect('/director');

  const projects = await fetchMyProjects(session.userId);
  const sorted = [...projects]
    .filter((p) => p.status !== 'completed')
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

  const active = sorted.filter((p) => p.status === 'active');
  const future = sorted.filter((p) => p.status === 'future');
  const archivedCount = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Vaše projekty</h1>
          <p className="mt-1 text-muted">
            Vítejte, {session.profile.display_name}. Spravujte zakázky a sdílejte je kolegům.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/project/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
        >
          + Nový projekt
        </Link>
        <Link
          href="/archiv"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-heading transition-colors hover:bg-zinc-50"
        >
          Archiv
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Projekty</h2>
        <p className="mt-1 text-sm text-muted">
          <span className="inline-flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-full bg-sky-300" /> budoucí
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-full bg-emerald-400" /> probíhající
            </span>
            {archivedCount > 0 ? (
              <span className="text-muted/80">· {archivedCount} v archivu</span>
            ) : null}
          </span>
        </p>

        {sorted.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
            {archivedCount > 0
              ? 'Žádné aktivní ani budoucí projekty. Hotové najdete v archivu.'
              : 'Zatím nemáte žádný projekt. Vytvořte první tlačítkem výše.'}
          </p>
        ) : (
          <div className="mt-4 space-y-8">
            {active.length > 0 ? <ProjectGroup title="Probíhající" projects={active} /> : null}
            {future.length > 0 ? <ProjectGroup title="Budoucí" projects={future} /> : null}
          </div>
        )}
      </section>
    </div>
  );
}
