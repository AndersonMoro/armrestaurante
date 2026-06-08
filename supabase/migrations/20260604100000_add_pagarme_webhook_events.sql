alter table public.dinner_orders
  add column if not exists pagarme_charge_id text,
  add column if not exists payment_method text,
  add column if not exists payment_status text,
  add column if not exists payment_failed_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists webhook_last_event text,
  add column if not exists webhook_last_payload jsonb;

create index if not exists dinner_orders_pagarme_order_code_idx
on public.dinner_orders(pagarme_order_code);

create index if not exists dinner_orders_pagarme_charge_id_idx
on public.dinner_orders(pagarme_charge_id);

create table if not exists public.pagarme_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text,
  event_type text not null,
  pagarme_order_id text,
  pagarme_order_code text,
  pagarme_charge_id text,
  dinner_order_id uuid references public.dinner_orders(id) on delete set null,
  processed boolean not null default false,
  processing_error text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists pagarme_webhook_events_event_type_idx
on public.pagarme_webhook_events(event_type);

create index if not exists pagarme_webhook_events_order_code_idx
on public.pagarme_webhook_events(pagarme_order_code);

create unique index if not exists pagarme_webhook_events_event_id_unique_idx
on public.pagarme_webhook_events(event_id)
where event_id is not null;

alter table public.pagarme_webhook_events enable row level security;

drop policy if exists "Authenticated users can read pagarme webhook events" on public.pagarme_webhook_events;
create policy "Authenticated users can read pagarme webhook events"
on public.pagarme_webhook_events
for select
to authenticated
using (true);
