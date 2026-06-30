import { notFound, redirect } from 'next/navigation';
import { ProjectDetailCard } from '@/components/projects/ProjectDetailCard';
import { BackLink } from '@/components/ui/BackLink';
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
      'id, name, location_hint, description, drawing_path, construction_start, construction_end, owner_id',
    )
    .eq('id', id)
    .single();

  if (!project) notFound();

  const backHref = session.profile.role === 'director' ? '/director' : '/dashboard';
  const drawing = await getProjectDrawingUrl(project.drawing_path);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-3 pb-8">
      <div className="flex items-center justify-between gap-3">
        <BackLink href={backHref} label="Zpět na projekty" className="shrink-0" />
        <h1 className="min-w-0 truncate text-right text-xl font-semibold sm:text-2xl">{project.name}</h1>
      </div>

      <ProjectDetailCard project={project} drawing={drawing} />
    </div>
  );
}
