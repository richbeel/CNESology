import { createClient } from '@/lib/supabase/server';
import { effectiveProjectStatus } from '@/lib/projects/status';
import type { ProjectWithOwner } from '@/lib/types/project';

const PROJECT_SELECT = `
  id,
  name,
  status,
  owner_id,
  location_hint,
  description,
  drawing_path,
  construction_start,
  construction_end,
  created_at,
  updated_at,
  owner:profiles!projects_owner_id_fkey(display_name, login_name)
`;

type RawProject = Omit<ProjectWithOwner, 'owner'> & {
  owner?: { display_name: string; login_name: string } | { display_name: string; login_name: string }[];
};

function normalizeProject(row: RawProject): ProjectWithOwner {
  const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
  const status = effectiveProjectStatus(row);
  return { ...row, owner, status };
}

export async function fetchMyProjects(userId: string): Promise<ProjectWithOwner[]> {
  const supabase = await createClient();

  const { data: owned } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('owner_id', userId)
    .order('updated_at', { ascending: false });

  const { data: shares } = await supabase
    .from('project_shares')
    .select('project_id')
    .eq('user_id', userId);

  const sharedIds = (shares ?? []).map((s) => s.project_id).filter(Boolean);
  let shared: RawProject[] = [];

  if (sharedIds.length > 0) {
    const { data } = await supabase
      .from('projects')
      .select(PROJECT_SELECT)
      .in('id', sharedIds)
      .order('updated_at', { ascending: false });
    shared = (data ?? []) as RawProject[];
  }

  const merged = new Map<string, ProjectWithOwner>();
  for (const p of [...((owned ?? []) as RawProject[]), ...shared]) {
    merged.set(p.id, normalizeProject(p));
  }

  return [...merged.values()].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

export async function fetchAllProjects(): Promise<ProjectWithOwner[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .order('updated_at', { ascending: false });

  return ((data ?? []) as RawProject[]).map(normalizeProject);
}
