-- Jen reset storage politik (když 002 spadne na „policy already exists“)
-- Spusťte tento soubor, pak znovu celý 002_project_details.sql — nebo stačí jen tento + CREATE část z 002.

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
