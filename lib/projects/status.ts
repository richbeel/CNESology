import type { ProjectStatus } from '@/lib/types/project';

/** Dnešní datum v lokální časové zóně (YYYY-MM-DD). */
export function todayIsoLocal(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Stav zakázky podle období stavby (porovnání kalendářních dat, ne času).
 * - před začátkem → budoucí
 * - po konci → hotový
 * - jinak → probíhající
 * Bez dat → probíhající (zakázka už existuje v systému).
 */
export function deriveProjectStatus(
  constructionStart: string | null | undefined,
  constructionEnd: string | null | undefined,
  now: Date = new Date(),
): ProjectStatus {
  const today = todayIsoLocal(now);

  if (constructionEnd && constructionEnd < today) {
    return 'completed';
  }
  if (constructionStart && constructionStart > today) {
    return 'future';
  }
  return 'active';
}

export function effectiveProjectStatus(project: {
  status: ProjectStatus;
  construction_start: string | null;
  construction_end: string | null;
}): ProjectStatus {
  return deriveProjectStatus(project.construction_start, project.construction_end);
}
