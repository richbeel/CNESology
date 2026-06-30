'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { PostgrestError } from '@supabase/supabase-js';
import { getSessionProfile } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { BUCKET, projectDrawingPath } from '@/lib/projects/storage';

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/octet-stream',
]);

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export type CreateProjectState = {
  error?: string;
};

function parseOptionalDate(value: FormDataEntryValue | null): string | null {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
}

function fileExtension(name: string): string | null {
  const ext = name.split('.').pop()?.toLowerCase();
  return ext && ext !== name.toLowerCase() ? ext : null;
}

function isAllowedDrawing(file: File): boolean {
  if (ALLOWED_TYPES.has(file.type)) return true;
  const ext = fileExtension(file.name);
  return ext !== null && ext in EXT_TO_MIME;
}

function drawingContentType(file: File): string {
  if (file.type && file.type !== 'application/octet-stream') return file.type;
  const ext = fileExtension(file.name);
  return (ext && EXT_TO_MIME[ext]) || 'application/octet-stream';
}

function mapInsertError(error: PostgrestError): string {
  const msg = error.message ?? '';

  if (msg.includes('description') || msg.includes('drawing_path')) {
    return 'Chybí migrace databáze. V Supabase SQL Editoru spusťte soubor supabase/migrations/002_project_details.sql.';
  }
  if (msg.includes('construction_')) {
    return 'Chybí migrace databáze. Spusťte supabase/migrations/005_project_construction_dates.sql.';
  }
  if (error.code === '23503' || msg.includes('foreign key')) {
    return 'Váš účet nemá profil v systému. Spusťte npm run create-user nebo doplňte záznam v tabulce profiles.';
  }
  if (error.code === '42501' || msg.toLowerCase().includes('row-level security')) {
    return 'Nemáte oprávnění vytvořit projekt. Přihlaste se jako stavbyvedoucí (site_manager).';
  }
  if (error.code === 'PGRST116') {
    return 'Projekt byl vytvořen, ale nepodařilo se načíst jeho ID. Spusťte migraci 002 nebo zkontrolujte RLS politiky.';
  }

  return `Projekt se nepodařilo vytvořit: ${msg}`;
}

export async function createProject(
  _prev: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const session = await getSessionProfile();
  if (!session) redirect('/login');
  if (session.profile.role === 'director') {
    return { error: 'Ředitel nemůže zakládat nové projekty.' };
  }

  const name = String(formData.get('name') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const constructionStart = parseOptionalDate(formData.get('construction_start'));
  const constructionEnd = parseOptionalDate(formData.get('construction_end'));
  const file = formData.get('drawing');

  if (!name) return { error: 'Vyplňte název projektu.' };
  if (constructionStart && constructionEnd && constructionEnd < constructionStart) {
    return { error: 'Konec stavby nesmí být dříve než začátek stavby.' };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Nahrajte výkres (PDF nebo obrázek).' };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: 'Soubor je příliš velký (max. 50 MB).' };
  }
  if (!isAllowedDrawing(file)) {
    return { error: 'Povolené formáty: PDF, PNG, JPG, WEBP.' };
  }

  const supabase = await createClient();

  const { data: rows, error: insertError } = await supabase
    .from('projects')
    .insert({
      name,
      location_hint: location || null,
      description: description || null,
      construction_start: constructionStart,
      construction_end: constructionEnd,
      owner_id: session.userId,
      status: 'future',
    })
    .select('id');

  const project = rows?.[0];

  if (insertError || !project) {
    return { error: insertError ? mapInsertError(insertError) : 'Projekt se nepodařilo vytvořit.' };
  }

  const path = projectDrawingPath(project.id, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = drawingContentType(file);

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (uploadError) {
    await supabase.from('projects').delete().eq('id', project.id);
    return {
      error: `Výkres se nepodařilo nahrát: ${uploadError.message}. Spusťte migraci 004_storage_upload_rls_fix.sql.`,
    };
  }

  const { error: updateError } = await supabase
    .from('projects')
    .update({ drawing_path: path })
    .eq('id', project.id);

  if (updateError) {
    return {
      error: `Projekt byl vytvořen, ale výkres se nepodařilo propojit: ${updateError.message}`,
    };
  }

  revalidatePath('/dashboard');
  redirect(`/project/${project.id}`);
}

export type UpdateProjectState = {
  error?: string;
};

export async function updateProject(
  _prev: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const session = await getSessionProfile();
  if (!session) redirect('/login');

  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const location = String(formData.get('location') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const constructionStart = parseOptionalDate(formData.get('construction_start'));
  const constructionEnd = parseOptionalDate(formData.get('construction_end'));
  const file = formData.get('drawing');

  if (!id) return { error: 'Chybí identifikátor projektu.' };
  if (!name) return { error: 'Vyplňte název projektu.' };

  if (constructionStart && constructionEnd && constructionEnd < constructionStart) {
    return { error: 'Konec stavby nesmí být dříve než začátek stavby.' };
  }

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return { error: 'Soubor je příliš velký (max. 50 MB).' };
    }
    if (!isAllowedDrawing(file)) {
      return { error: 'Povolené formáty: PDF, PNG, JPG, WEBP.' };
    }
  }

  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from('projects')
    .update({
      name,
      location_hint: location || null,
      description: description || null,
      construction_start: constructionStart,
      construction_end: constructionEnd,
    })
    .eq('id', id);

  if (updateError) {
    if (updateError.message.includes('construction_')) {
      return {
        error: 'Chybí migrace databáze. Spusťte supabase/migrations/005_project_construction_dates.sql.',
      };
    }
    return { error: `Projekt se nepodařilo uložit: ${updateError.message}` };
  }

  if (file instanceof File && file.size > 0) {
    const path = projectDrawingPath(id, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = drawingContentType(file);

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: true,
    });

    if (uploadError) {
      return { error: `Výkres se nepodařilo nahrát: ${uploadError.message}` };
    }

    const { error: pathError } = await supabase
      .from('projects')
      .update({ drawing_path: path })
      .eq('id', id);

    if (pathError) {
      return { error: 'Projekt byl uložen, ale výkres se nepodařilo propojit.' };
    }
  }

  revalidatePath(`/project/${id}`);
  revalidatePath('/dashboard');
  revalidatePath('/director');
  return {};
}
