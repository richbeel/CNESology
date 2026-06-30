import { createClient } from '@/lib/supabase/server';

const BUCKET = 'project-drawings';

export function projectDrawingPath(projectId: string, fileName: string): string {
  const ext = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : 'pdf';
  return `projects/${projectId}/drawing.${ext}`;
}

export async function getProjectDrawingUrl(
  drawingPath: string | null,
): Promise<{ url: string; isPdf: boolean } | null> {
  if (!drawingPath) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(drawingPath, 3600);

  if (error || !data?.signedUrl) return null;

  const isPdf = drawingPath.toLowerCase().endsWith('.pdf');
  return { url: data.signedUrl, isPdf };
}

export { BUCKET };
