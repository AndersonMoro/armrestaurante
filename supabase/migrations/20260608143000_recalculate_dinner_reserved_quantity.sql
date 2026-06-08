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
  v_reserved integer;
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

  select coalesce(sum(quantity), 0)
  into v_reserved
  from public.dinner_orders
  where dinner_event_id = p_dinner_event_id
    and status in ('pending', 'paid');

  v_remaining := v_event.total_quantity - v_reserved;

  if p_quantity > v_remaining then
    raise exception 'Quantidade indisponivel. Restam % lugares.', greatest(v_remaining, 0);
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
    reserved_quantity = v_reserved + p_quantity,
    updated_at = now()
  where id = p_dinner_event_id;

  return query select v_order_id, v_voucher_code, 'pending'::text;
end;
$$;

update public.dinner_events de
set
  reserved_quantity = least(de.total_quantity, coalesce(reserved.quantity, 0)),
  updated_at = now()
from (
  select dinner_event_id, sum(quantity)::integer as quantity
  from public.dinner_orders
  where status in ('pending', 'paid')
  group by dinner_event_id
) reserved
where de.id = reserved.dinner_event_id;

update public.dinner_events de
set
  reserved_quantity = 0,
  updated_at = now()
where not exists (
  select 1
  from public.dinner_orders dor
  where dor.dinner_event_id = de.id
    and dor.status in ('pending', 'paid')
);

grant execute on function public.create_dinner_order(uuid, text, text, text, integer, text) to anon, authenticated;
