alter table public.dinner_orders
  add column if not exists payment_provider text,
  add column if not exists pagarme_payment_link_id text,
  add column if not exists pagarme_payment_url text,
  add column if not exists pagarme_order_code text,
  add column if not exists pagarme_response jsonb,
  add column if not exists paid_at timestamptz;

create index if not exists dinner_orders_pagarme_payment_link_id_idx
on public.dinner_orders(pagarme_payment_link_id);
