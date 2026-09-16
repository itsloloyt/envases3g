-- Private order ledger. Public requests go through the authenticated Edge Function.
create table public.orders (
 id uuid primary key default gen_random_uuid(),
 number bigint generated always as identity unique,
 request_id uuid not null unique,
 request_body jsonb not null,
 created_at timestamptz not null default now(),
 customer_name text not null check (length(customer_name) between 2 and 120),
 phone text not null check (length(phone) between 8 and 30),
 items jsonb not null,
 total numeric(14,2) not null check(total >= 0),
 status text not null default 'nuevo' check(status in ('nuevo','en_contacto','confirmado','completado','cancelado'))
);
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
grant select on public.orders to authenticated;
grant update(status) on public.orders to authenticated;
grant all on public.orders to service_role;
grant usage,select on sequence public.orders_number_seq to service_role;
create index orders_created_at_idx on public.orders(created_at desc);
create index orders_phone_created_idx on public.orders(phone,created_at desc);
create schema if not exists private;
create function private.is_order_staff() returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists(select 1 from auth.users u where u.id=auth.uid() and u.email='envases3g@gmail.com' and u.email_confirmed_at is not null);
$$;
revoke all on function private.is_order_staff() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_order_staff() to authenticated;
create policy staff_read_orders on public.orders for select to authenticated using ((select private.is_order_staff()));
create policy staff_update_orders on public.orders for update to authenticated using ((select private.is_order_staff())) with check ((select private.is_order_staff()));

-- Only the Edge Function's service role can execute this transactional operation.
-- Prices and descriptions are resolved from the canonical catalogue, never from the client.
create function public.create_order(p_request_id uuid,p_name text,p_phone text,p_lines jsonb) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare saved public.orders; line jsonb; product jsonb; variant jsonb; qty integer; unit numeric; amount numeric:=0; items jsonb:='[]'; body jsonb;
begin
 if p_request_id is null or p_name is null or length(trim(p_name)) not between 2 and 120 or p_phone is null or p_phone !~ '^[0-9+ ()-]{8,30}$' or p_lines is null or jsonb_typeof(p_lines)<>'array' then raise exception 'Pedido inválido'; end if;
 if jsonb_array_length(p_lines) not between 1 and 80 then raise exception 'El pedido debe tener entre 1 y 80 productos'; end if;
 body:=jsonb_build_object('name',trim(p_name),'phone',p_phone,'lines',p_lines);
 perform pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
 select * into saved from public.orders where request_id=p_request_id;
 if found then
   if saved.request_body<>body then raise exception 'Identificador de pedido ya utilizado'; end if;
   return jsonb_build_object('number','3G-'||lpad(saved.number::text,6,'0'),'items',saved.items,'total',saved.total);
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_phone,1));
 if (select count(*) from public.orders where phone=p_phone and created_at>now()-interval '1 hour')>=5 then raise exception 'Ya registraste varios pedidos. Contactanos por WhatsApp'; end if;
 if (select count(distinct (v->>'slug',v->>'variantId')) from jsonb_array_elements(p_lines) v)<>jsonb_array_length(p_lines) then raise exception 'Productos duplicados'; end if;
 for line in select value from jsonb_array_elements(p_lines) loop
   if jsonb_typeof(line->'quantity')<>'number' or (line->>'quantity') !~ '^[0-9]{1,4}$' then raise exception 'Cantidad inválida'; end if;
   qty:=(line->>'quantity')::integer;
   select data into product from public.products where slug=line->>'slug';
   if product is null then raise exception 'Producto no encontrado'; end if;
   select value into variant from jsonb_array_elements(product->'variants') where value->>'id'=line->>'variantId';
   if variant is null or not coalesce((variant->>'available')::boolean,false) then raise exception 'La opción elegida no está disponible'; end if;
   if qty is null or qty<greatest(1,(variant->>'minQuantity')::integer) or qty>9999 then raise exception 'Revisá las cantidades mínimas'; end if;
   unit:=round((variant->>'price')::numeric,2);
   if unit is null or unit<0 then raise exception 'Precio no disponible'; end if;
   amount:=amount+unit*qty;
   items:=items||jsonb_build_array(jsonb_build_object('slug',line->>'slug','name',product->>'name','variantId',variant->>'id','variant',variant->>'name','quantity',qty,'unitPrice',unit,'subtotal',unit*qty));
 end loop;
 insert into public.orders(request_id,request_body,customer_name,phone,items,total) values(p_request_id,body,trim(p_name),p_phone,items,amount) returning * into saved;
 return jsonb_build_object('number','3G-'||lpad(saved.number::text,6,'0'),'items',saved.items,'total',saved.total);
end; $$;
revoke all on function public.create_order(uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.create_order(uuid,text,text,jsonb) to service_role;
