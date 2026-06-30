-- ČNES vision: profily, projekty, sdílení
-- Spusťte v Supabase → SQL Editor

create type public.user_role as enum ('site_manager', 'director');
create type public.project_status as enum ('future', 'active', 'completed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  login_name text not null unique,
  display_name text not null,
  role public.user_role not null default 'site_manager',
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status public.project_status not null default 'future',
  owner_id uuid not null references public.profiles (id) on delete cascade,
  location_hint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_shares (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index projects_owner_id_idx on public.projects (owner_id);
create index projects_status_idx on public.projects (status);
create index project_shares_user_id_idx on public.project_shares (user_id);

create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_projects_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_shares enable row level security;

create or replace function public.is_director()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'director'
  );
$$;

create or replace function public.can_access_project(project_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_director()
    or exists (
      select 1 from public.projects p
      where p.id = project_uuid and p.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.project_shares s
      where s.project_id = project_uuid and s.user_id = auth.uid()
    );
$$;

-- profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id or public.is_director());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- projects
create policy "projects_select"
  on public.projects for select
  using (public.can_access_project(id));

create policy "projects_insert_own"
  on public.projects for insert
  with check (owner_id = auth.uid() and not public.is_director());

create policy "projects_update"
  on public.projects for update
  using (
    public.is_director()
    or owner_id = auth.uid()
    or exists (
      select 1 from public.project_shares s
      where s.project_id = id and s.user_id = auth.uid()
    )
  );

create policy "projects_delete"
  on public.projects for delete
  using (public.is_director() or owner_id = auth.uid());

-- project_shares
create policy "shares_select"
  on public.project_shares for select
  using (public.can_access_project(project_id));

create policy "shares_insert_owner"
  on public.project_shares for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

create policy "shares_delete_owner"
  on public.project_shares for delete
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

-- Ukázková data (volitelné — po vytvoření uživatelů v Auth)
-- Viz README pro vytvoření účtů.
