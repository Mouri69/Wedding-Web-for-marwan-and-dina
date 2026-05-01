create table if not exists public.timeline_status (
  id int primary key,
  current_event text null,
  updated_at timestamptz not null default now()
);

insert into public.timeline_status (id, current_event)
values (1, null)
on conflict (id) do nothing;
