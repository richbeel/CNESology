-- Kalibrace trasy: kotva na mapě + posun výkresu v pixelech
alter table public.projects
  add column if not exists calibration_anchor_lat double precision,
  add column if not exists calibration_anchor_lng double precision,
  add column if not exists calibration_offset_x integer not null default 0,
  add column if not exists calibration_offset_y integer not null default 0;

comment on column public.projects.calibration_anchor_lat is 'Zvolený bod stavby na mapě (WGS84)';
comment on column public.projects.calibration_anchor_lng is 'Zvolený bod stavby na mapě (WGS84)';
comment on column public.projects.calibration_offset_x is 'Posun výkresu v px (vodorovně)';
comment on column public.projects.calibration_offset_y is 'Posun výkresu v px (svisle)';
