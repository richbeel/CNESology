import { ProjectCard } from '@/components/projects/ProjectCard';
import type { ProjectWithOwner } from '@/lib/types/project';

export function ProjectGrid({ projects, showOwner = false }: { projects: ProjectWithOwner[]; showOwner?: boolean }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} showOwner={showOwner} href={`/project/${project.id}`} />
        </li>
      ))}
    </ul>
  );
}

export function ProjectGroup({
  title,
  projects,
  showOwner = false,
}: {
  title: string;
  projects: ProjectWithOwner[];
  showOwner?: boolean;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="mt-3">
        <ProjectGrid projects={projects} showOwner={showOwner} />
      </div>
    </div>
  );
}
