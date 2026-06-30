import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/projects/ProjectCard';
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
  const sorted = [...projects].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  const active = sorted.filter((p) => p.status === 'active');
  const future = sorted.filter((p) => p.status === 'future');
  const completed = sorted.filter((p) => p.status === 'completed');

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

      <Link
        href="/project/new"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-800 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-900 sm:w-auto"
      >
        + Nový projekt
      </Link>

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
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-full bg-orange-400" /> hotové
            </span>
          </span>
        </p>

        {sorted.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
            Zatím nemáte žádný projekt. Vytvořte první tlačítkem výše.
          </p>
        ) : (
          <div className="mt-4 space-y-8">
            {active.length > 0 ? <ProjectGroup title="Probíhající" projects={active} /> : null}
            {future.length > 0 ? <ProjectGroup title="Budoucí" projects={future} /> : null}
            {completed.length > 0 ? (
              <ProjectGroup title="Historické / hotové" projects={completed} />
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectGroup({
  title,
  projects,
}: {
  title: string;
  projects: Awaited<ReturnType<typeof fetchMyProjects>>;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} href={`/project/${project.id}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
