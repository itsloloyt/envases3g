-- Apply once to a new Envases 3G Supabase project.
create table public.products (
 slug text primary key,
 category text not null,
 name text not null,
 data jsonb not null,
 imported_at timestamptz not null default now()
);
alter table public.products enable row level security;
grant select on public.products to anon, authenticated;
create policy "Public catalog is readable" on public.products for select to anon, authenticated using (true);
create index products_category_idx on public.products(category);

create table public.inquiries (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 name text not null check (char_length(name) between 2 and 120),
 email text not null check (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 phone text check (char_length(phone) <= 40),
 type text not null check (type in ('consulta','mayorista','arrepentimiento')),
 order_number text check (char_length(order_number) <= 80),
 message text not null check (char_length(message) between 10 and 5000),
 consent boolean not null check (consent = true),
 check (type = 'consulta' or (phone is not null and char_length(phone) > 0)),
 check (type <> 'arrepentimiento' or (order_number is not null and char_length(order_number) > 0))
);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant insert (name,email,phone,type,order_number,message,consent) on public.inquiries to anon, authenticated;
create policy "Visitors can submit inquiries" on public.inquiries for insert to anon, authenticated with check (consent = true);
-- No public SELECT / UPDATE / DELETE: inquiries are visible only to the project operator.
create index inquiries_created_at_idx on public.inquiries(created_at desc);
