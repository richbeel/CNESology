import { notFound, redirect } from 'next/navigation';
import { ProjectStavbaWorkspace } from '@/components/projects/ProjectStavbaWorkspace';
import { getSessionProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectStavbaPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionProfile();
  if (!session) redirect('/login');

  const supabase = await createClient();
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, drawing_path')
    .eq('id', id)
    .single();

  if (!project) notFound();

  return (
    <ProjectStavbaWorkspace
      projectId={project.id}
      projectName={project.name}
      hasDrawing={Boolean(project.drawing_path)}
    />
  );
}
