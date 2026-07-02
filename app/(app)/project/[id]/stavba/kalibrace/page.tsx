import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectKalibraceRedirectPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/project/${id}/stavba`);
}
