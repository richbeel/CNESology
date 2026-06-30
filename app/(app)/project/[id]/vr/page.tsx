import { notFound, redirect } from 'next/navigation';
import { BackLink } from '@/components/ui/BackLink';
import { getSessionProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectVrPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionProfile();
  if (!session) redirect('/login');

  const supabase = await createClient();
  const { data: project } = await supabase.from('projects').select('id, name').eq('id', id).single();

  if (!project) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-8">
      <BackLink href={`/project/${id}`} label="Zpět na projekt" />
      <h1 className="mt-2 text-2xl font-semibold">{project.name}</h1>
      <p className="mt-4 text-muted">
        VR režim pro kalibraci a práci ve výkresu připravujeme v další iteraci.
      </p>
    </div>
  );
}
