import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { getSessionProfile } from '@/lib/supabase/server';
import { fetchAllProjects } from '@/lib/projects/queries';

export default async function DirectorPage() {
  const session = await getSessionProfile();
  if (!session) redirect('/login');
  if (session.profile.role !== 'director') redirect('/dashboard');

  const projects = await fetchAllProjects();
  const activeProjects = projects.filter((p) => p.status !== 'completed');
  const active = projects.filter((p) => p.status === 'active').length;
  const future = projects.filter((p) => p.status === 'future').length;
  const completed = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Přehled všech projektů</h1>
      <p className="mt-1 text-muted">Ředitelský účet — průběh zakázek ve firmě.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Probíhající" value={active} tone="emerald" />
        <StatCard label="Budoucí" value={future} tone="sky" />
        <StatCard label="Hotové" value={completed} tone="orange" />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Projekty</h2>
          <Link
            href="/director/archiv"
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-heading transition-colors hover:bg-zinc-50"
          >
            Archiv
          </Link>
        </div>

        {activeProjects.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-muted">
            {completed > 0
              ? 'Žádné aktivní ani budoucí projekty. Hotové najdete v archivu.'
              : 'Zatím nejsou evidovány žádné projekty.'}
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} showOwner href={`/project/${project.id}`} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'emerald' | 'sky' | 'orange';
}) {
  const bg =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50'
      : tone === 'sky'
        ? 'border-sky-200 bg-sky-50'
        : 'border-orange-200 bg-orange-50';

  return (
    <div className={`rounded-2xl border bg-surface p-4 ${bg}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-heading">{value}</p>
    </div>
  );
}
