create table if not exists public.dinner_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  event_date date not null,
  title text not null,
  description text,
  menu_summary text,
  regular_price text,
  advance_price text not null,
  total_quantity integer not null default 0 check (total_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  purchase_deadline time not null default '17:00',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dinner_events_reserved_lte_total check (reserved_quantity <= total_quantity)
);

create index if not exists dinner_events_restaurant_id_idx on public.dinner_events(restaurant_id);
create index if not exists dinner_events_event_date_idx on public.dinner_events(event_date);

alter table public.dinner_events enable row level security;

drop policy if exists "Public can read active dinner events" on public.dinner_events;
create policy "Public can read active dinner events"
on public.dinner_events
for select
to anon, authenticated
using (active = true);

drop policy if exists "Authenticated users can manage dinner events" on public.dinner_events;
create policy "Authenticated users can manage dinner events"
on public.dinner_events
for all
to authenticated
using (true)
with check (true);
