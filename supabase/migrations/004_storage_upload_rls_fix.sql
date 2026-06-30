-- Oprava uploadu výkresu: kontrola vlastnictví projektu mimo RLS storage politiky

create or replace function public.project_id_from_drawing_path(object_name text)
returns uuid
language sql
stable
set search_path = public, storage
as $$
  select nullif((storage.foldername(object_name))[2], '')::uuid;
$$;

create or replace function public.can_upload_project_drawing(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = public.project_id_from_drawing_path(object_name)
      and p.owner_id = auth.uid()
  );
$$;

create or replace function public.can_read_project_drawing(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public, storage
as $$
  select public.can_access_project(public.project_id_from_drawing_path(object_name));
$$;

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
    and public.can_read_project_drawing(name)
  );

create policy "project_drawings_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-drawings'
    and (storage.foldername(name))[1] = 'projects'
    and public.can_upload_project_drawing(name)
  );

create policy "project_drawings_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-drawings'
    and public.can_upload_project_drawing(name)
  )
  with check (
    bucket_id = 'project-drawings'
    and public.can_upload_project_drawing(name)
  );

create policy "project_drawings_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-drawings'
    and (
      public.can_upload_project_drawing(name)
      or public.is_director()
    )
  );
