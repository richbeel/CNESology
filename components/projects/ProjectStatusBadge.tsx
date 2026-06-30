import type { ProjectStatus } from '@/lib/types/project';
import { projectStatusLabel, projectStatusStyles } from '@/lib/types/project';

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const styles = projectStatusStyles(status);
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}>
      {projectStatusLabel(status)}
    </span>
  );
}
