-- Datum stavby od / do (volitelné, editovatelné)

alter table public.projects
  add column if not exists construction_start date,
  add column if not exists construction_end date;
