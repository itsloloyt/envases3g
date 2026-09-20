-- Execute in Supabase SQL Editor once the project connection is available.
grant update(name,data) on public.products to authenticated;
create or replace function private.is_order_staff() returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists(
    select 1 from auth.users u
    where u.id = auth.uid()
      and u.email in ('envases3g@gmail.com', 'itsloloyt@gmail.com')
      and u.email_confirmed_at is not null
  );
$$;

create policy staff_update_products on public.products for update to authenticated
using ((select private.is_order_staff()))
with check ((select private.is_order_staff()));
