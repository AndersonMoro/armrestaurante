create table if not exists public.dinner_orders (
  id uuid primary key default gen_random_uuid(),
  dinner_event_id uuid not null references public.dinner_events(id) on delete cascade,
  buyer_name text not null,
  buyer_whatsapp text not null,
  buyer_email text,
  quantity integer not null check (quantity > 0),
  unit_price text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'used', 'expired')),
  voucher_code text not null unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dinner_orders_event_id_idx on public.dinner_orders(dinner_event_id);
create index if not exists dinner_orders_status_idx on public.dinner_orders(status);

alter table public.dinner_orders enable row level security;

drop policy if exists "Authenticated users can manage dinner orders" on public.dinner_orders;
create policy "Authenticated users can manage dinner orders"
on public.dinner_orders
for all
to authenticated
using (true)
with check (true);

create or replace function public.create_dinner_order(
  p_dinner_event_id uuid,
  p_buyer_name text,
  p_buyer_whatsapp text,
  p_buyer_email text,
  p_quantity integer,
  p_notes text default null
)
returns table (
  order_id uuid,
  voucher_code text,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.dinner_events%rowtype;
  v_today date;
  v_now_time time;
  v_remaining integer;
  v_order_id uuid;
  v_voucher_code text;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantidade invalida.';
  end if;

  if length(trim(coalesce(p_buyer_name, ''))) < 2 then
    raise exception 'Informe o nome.';
  end if;

  if length(trim(coalesce(p_buyer_whatsapp, ''))) < 8 then
    raise exception 'Informe um WhatsApp valido.';
  end if;

  select *
  into v_event
  from public.dinner_events
  where id = p_dinner_event_id
  for update;

  if not found or v_event.active is not true then
    raise exception 'Jantar indisponivel.';
  end if;

  v_today := (now() at time zone 'America/Sao_Paulo')::date;
  v_now_time := (now() at time zone 'America/Sao_Paulo')::time;

  if v_event.event_date < v_today then
    raise exception 'Esse jantar ja passou.';
  end if;

  if v_event.event_date = v_today and v_now_time > v_event.purchase_deadline then
    raise exception 'O horario limite de compra para hoje ja passou.';
  end if;

  v_remaining := v_event.total_quantity - v_event.reserved_quantity;

  if p_quantity > v_remaining then
    raise exception 'Quantidade indisponivel. Restam % lugares.', v_remaining;
  end if;

  v_voucher_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.dinner_orders (
    dinner_event_id,
    buyer_name,
    buyer_whatsapp,
    buyer_email,
    quantity,
    unit_price,
    status,
    voucher_code,
    notes
  )
  values (
    p_dinner_event_id,
    trim(p_buyer_name),
    trim(p_buyer_whatsapp),
    nullif(trim(coalesce(p_buyer_email, '')), ''),
    p_quantity,
    v_event.advance_price,
    'pending',
    v_voucher_code,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  returning id into v_order_id;

  update public.dinner_events
  set
    reserved_quantity = reserved_quantity + p_quantity,
    updated_at = now()
  where id = p_dinner_event_id;

  return query select v_order_id, v_voucher_code, 'pending'::text;
end;
$$;

grant execute on function public.create_dinner_order(uuid, text, text, text, integer, text) to anon, authenticated;
