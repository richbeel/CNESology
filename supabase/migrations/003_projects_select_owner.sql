-- Oprava: vlastník musí vidět právě vytvořený projekt (RETURNING po INSERT)

drop policy if exists "projects_select_owner" on public.projects;

create policy "projects_select_owner"
  on public.projects for select
  using (owner_id = auth.uid());
