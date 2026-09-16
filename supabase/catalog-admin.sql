-- Execute in Supabase SQL Editor once the project connection is available.
grant update(name,data) on public.products to authenticated;
create policy staff_update_products on public.products for update to authenticated
using ((select private.is_order_staff()))
with check ((select private.is_order_staff()));
