create table if not exists public.event_quotes (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  client_name text not null,
  client_contact text,
  event_date date,
  event_type text,
  guest_count integer,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'approved', 'archived')),
  options jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_quotes_restaurant_id_idx on public.event_quotes(restaurant_id);
create index if not exists event_quotes_event_date_idx on public.event_quotes(event_date);

alter table public.event_quotes enable row level security;

drop policy if exists "Authenticated users can read event quotes" on public.event_quotes;
create policy "Authenticated users can read event quotes"
on public.event_quotes
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can manage event quotes" on public.event_quotes;
create policy "Authenticated users can manage event quotes"
on public.event_quotes
for all
to authenticated
using (true)
with check (true);

