create table if not exists public.notification_attempts (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  provider text not null,
  dinner_order_id uuid references public.dinner_orders(id) on delete set null,
  recipient text,
  status_code integer,
  success boolean not null default false,
  response_body text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists notification_attempts_order_idx
on public.notification_attempts(dinner_order_id);

create index if not exists notification_attempts_created_at_idx
on public.notification_attempts(created_at desc);

alter table public.notification_attempts enable row level security;

drop policy if exists "Authenticated users can read notification attempts" on public.notification_attempts;
create policy "Authenticated users can read notification attempts"
on public.notification_attempts
for select
to authenticated
using (true);
