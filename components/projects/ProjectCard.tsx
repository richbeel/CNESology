import Link from 'next/link';
import type { ProjectWithOwner } from '@/lib/types/project';
import { projectStatusLabel, projectStatusStyles } from '@/lib/types/project';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';

type ProjectCardProps = {
  project: ProjectWithOwner;
  showOwner?: boolean;
  href?: string;
};

export function ProjectCard({ project, showOwner = false, href }: ProjectCardProps) {
  const styles = projectStatusStyles(project.status);
  const content = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold text-heading">{project.name}</h3>
        <ProjectStatusBadge status={project.status} />
      </div>
      {project.location_hint ? <p className="mt-1 text-sm text-muted">{project.location_hint}</p> : null}
      {showOwner && project.owner ? (
        <p className="mt-2 text-xs text-muted">Stavbyvedoucí: {project.owner.display_name}</p>
      ) : null}
      <p className="mt-3 text-xs text-muted/80">
        {projectStatusLabel(project.status)} · aktualizováno{' '}
        {new Date(project.updated_at).toLocaleDateString('cs-CZ')}
      </p>
    </>
  );

  const className = `block rounded-2xl border p-4 transition-colors ${styles.card}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
