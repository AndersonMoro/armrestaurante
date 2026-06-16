alter table public.dinner_events
add column if not exists auto_activate_on_menu boolean not null default false;

create or replace function public.activate_waiting_dinner_events_for_menu()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.active is true then
    update public.dinner_events
    set
      active = true,
      auto_activate_on_menu = false,
      updated_at = now()
    where restaurant_id = new.restaurant_id
      and event_date = new.menu_date
      and auto_activate_on_menu = true;
  end if;

  return new;
end;
$$;

drop trigger if exists activate_waiting_dinner_events_after_menu_saved on public.menus;
create trigger activate_waiting_dinner_events_after_menu_saved
after insert or update of menu_date, active on public.menus
for each row
execute function public.activate_waiting_dinner_events_for_menu();

update public.dinner_events de
set
  active = true,
  auto_activate_on_menu = false,
  updated_at = now()
where de.auto_activate_on_menu = true
  and exists (
    select 1
    from public.menus m
    where m.restaurant_id = de.restaurant_id
      and m.menu_date = de.event_date
      and m.active = true
  );
