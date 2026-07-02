import Link from 'next/link';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { ProjectDrawing } from '@/components/projects/ProjectDrawing';
import { Button } from '@/components/ui/Button';
import { formatConstructionPeriod } from '@/lib/projects/dates';
import type { ProjectStatus } from '@/lib/types/project';

export type ProjectHubData = {
  id: string;
  name: string;
  location_hint: string | null;
  description: string | null;
  construction_start: string | null;
  construction_end: string | null;
  status: ProjectStatus;
};

type ProjectHubProps = {
  project: ProjectHubData;
  drawing: { url: string; isPdf: boolean } | null;
  onEdit: () => void;
};

export function ProjectHub({ project, drawing, onEdit }: ProjectHubProps) {
  const constructionLabel = formatConstructionPeriod(
    project.construction_start,
    project.construction_end,
  );

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} />
        {project.location_hint ? (
          <span className="text-sm text-muted">{project.location_hint}</span>
        ) : null}
        {constructionLabel ? (
          <span className="text-sm text-muted/80">· {constructionLabel}</span>
        ) : null}
      </div>

      <Link
        href={`/project/${project.id}/stavba`}
        className="group mt-6 block rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">Práce v terénu</p>
            <h2 className="mt-1 text-2xl font-semibold text-zinc-900">Režim stavby</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-600">
              Mapa trasy, body s výškami a verifikace úseků
            </p>
          </div>
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-lg text-white transition-transform group-hover:translate-x-0.5"
            aria-hidden
          >
            →
          </span>
        </div>
      </Link>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900">Výkres zakázky</h3>
            {drawing ? (
              <Link
                href={`/project/${project.id}/drawing`}
                className="text-xs font-medium text-blue-800 hover:underline"
              >
                Celá obrazovka
              </Link>
            ) : null}
          </div>
          <ProjectDrawing drawing={drawing} projectId={project.id} />
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-900">Přehled zakázky</h3>
          <dl className="mt-4 space-y-4 text-sm">
            {project.description ? (
              <div>
                <dt className="font-medium text-zinc-700">Popis</dt>
                <dd className="mt-1 whitespace-pre-wrap text-muted">{project.description}</dd>
              </div>
            ) : (
              <p className="text-muted">Bez popisu.</p>
            )}
            {constructionLabel ? (
              <div>
                <dt className="font-medium text-zinc-700">Období stavby</dt>
                <dd className="mt-1 text-muted">{constructionLabel}</dd>
              </div>
            ) : null}
            {project.location_hint ? (
              <div>
                <dt className="font-medium text-zinc-700">Lokace</dt>
                <dd className="mt-1 text-muted">{project.location_hint}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onEdit}>
          Upravit projekt
        </Button>
      </div>
    </>
  );
}
