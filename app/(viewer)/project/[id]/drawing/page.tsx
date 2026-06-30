import { notFound, redirect } from 'next/navigation';
import { DrawingFullscreenViewer } from '@/components/projects/DrawingFullscreenViewer';
import { getSessionProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { getProjectDrawingUrl } from '@/lib/projects/storage';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDrawingPage({ params }: PageProps) {
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

  const drawing = await getProjectDrawingUrl(project.drawing_path);
  if (!drawing) notFound();

  return (
    <DrawingFullscreenViewer
      url={drawing.url}
      isPdf={drawing.isPdf}
      projectName={project.name}
      backHref={`/project/${id}`}
    />
  );
}
