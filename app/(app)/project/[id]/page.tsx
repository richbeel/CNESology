import { notFound, redirect } from 'next/navigation';
import { ProjectDetailCard } from '@/components/projects/ProjectDetailCard';
import { BackLink } from '@/components/ui/BackLink';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { effectiveProjectStatus } from '@/lib/projects/status';
import { getSessionProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectDrawingUrl } from '@/lib/projects/storage';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionProfile();
  if (!session) redirect('/login');

  const supabase = await createClient();
  const { data: project } = await supabase
    .from('projects')
    .select(
      'id, name, status, location_hint, description, drawing_path, construction_start, construction_end, owner_id',
    )
    .eq('id', id)
    .single();

  if (!project) notFound();

  const backHref = session.profile.role === 'director' ? '/director' : '/dashboard';
  const drawing = await getProjectDrawingUrl(project.drawing_path);
  const status = effectiveProjectStatus(project);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-3 pb-10">
      <div className="flex items-start justify-between gap-3">
        <BackLink href={backHref} label="Zpět na projekty" className="shrink-0" />
        <div className="min-w-0 text-right">
          <ProjectStatusBadge status={status} />
          <h1 className="mt-2 truncate text-xl font-semibold sm:text-2xl">{project.name}</h1>
        </div>
      </div>

      <ProjectDetailCard
        project={{
          ...project,
          status,
        }}
        drawing={drawing}
      />
    </div>
  );
}
