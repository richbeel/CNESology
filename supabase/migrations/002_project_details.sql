-- ČNES vision: popis projektu, výkres, storage
-- Spusťte CELÝ soubor najednou (Run). Lze opakovat.

alter table public.projects
  add column if not exists description text,
  add column if not exists drawing_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-drawings',
  'project-drawings',
  false,
  52428800,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Smaže všechny naše storage politiky (i když už existují z dřívějška)
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname like 'project_drawings_%'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

create policy "project_drawings_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'project-drawings'
    and (storage.foldername(name))[1] = 'projects'
    and public.can_access_project(((storage.foldername(name))[2])::uuid)
  );

create policy "project_drawings_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-drawings'
    and (storage.foldername(name))[1] = 'projects'
    and exists (
      select 1 from public.projects p
      where p.id = ((storage.foldername(name))[2])::uuid
        and p.owner_id = auth.uid()
    )
  );

create policy "project_drawings_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-drawings'
    and (storage.foldername(name))[1] = 'projects'
    and exists (
      select 1 from public.projects p
      where p.id = ((storage.foldername(name))[2])::uuid
        and p.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'project-drawings'
    and (storage.foldername(name))[1] = 'projects'
    and exists (
      select 1 from public.projects p
      where p.id = ((storage.foldername(name))[2])::uuid
        and p.owner_id = auth.uid()
    )
  );

create policy "project_drawings_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-drawings'
    and (storage.foldername(name))[1] = 'projects'
    and exists (
      select 1 from public.projects p
      where p.id = ((storage.foldername(name))[2])::uuid
        and (p.owner_id = auth.uid() or public.is_director())
    )
  );
