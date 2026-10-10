-- Execute uma vez no SQL Editor do Supabase. Nenhuma tabela é pública.
begin;

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  checkout_url text check (checkout_url is null or checkout_url like 'https://%'),
  is_platform boolean not null default false,
  active boolean not null default true
);
create table if not exists public.product_contents (
  product_id text primary key references public.products(id),
  content_url text check (content_url is null or content_url like 'https://%'),
  storage_path text,
  check ((content_url is not null)::int + (storage_path is not null)::int = 1)
);
create table if not exists public.product_provider_ids (
  provider text not null,
  external_id text not null,
  product_id text not null references public.products(id),
  primary key (provider, external_id, product_id)
);
create table if not exists public.purchases (
  provider text not null,
  order_id text not null,
  product_id text not null references public.products(id),
  email text not null check (email = lower(trim(email))),
  status text not null check (status in ('approved', 'refunded', 'chargeback')),
  occurred_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (provider, order_id, product_id)
);
create index if not exists purchases_access_idx on public.purchases(email, status);
create table if not exists public.access_sessions (
  token_hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table if not exists public.access_attempts (
  key text primary key,
  attempts integer not null default 1,
  created_at timestamptz not null default now()
);
create table if not exists public.webhook_inbox (
  id text primary key,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.products enable row level security;
alter table public.product_contents enable row level security;
alter table public.product_provider_ids enable row level security;
alter table public.purchases enable row level security;
alter table public.access_sessions enable row level security;
alter table public.access_attempts enable row level security;
alter table public.webhook_inbox enable row level security;
revoke all on public.products, public.product_contents, public.product_provider_ids,
  public.purchases, public.access_sessions, public.access_attempts, public.webhook_inbox from anon, authenticated;
grant all on public.products, public.product_contents, public.product_provider_ids,
  public.purchases, public.access_sessions, public.access_attempts, public.webhook_inbox to service_role;

create or replace function public.access_rate_limit(p_key text)
returns integer language plpgsql security definer set search_path = public as $$
declare count integer;
begin
  insert into access_attempts(key) values (p_key)
    on conflict (key) do update set attempts = access_attempts.attempts + 1
    returning attempts into count;
  delete from access_attempts where created_at < now() - interval '1 day';
  delete from access_sessions where expires_at < now();
  return count;
end;
$$;

create or replace function public.apply_purchase_event(p_receipt text, p_event jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare external text; target text; current_status text;
begin
  -- Bloqueia a linha: eventos repetidos são processados uma única vez.
  select id into target from webhook_inbox where id = p_receipt and processed_at is null for update;
  if not found then return; end if;
  if p_event->>'status' not in ('approved', 'refunded', 'chargeback') then
    raise exception 'Invalid status';
  end if;
  for external in select jsonb_array_elements_text(p_event->'external_product_ids') loop
    if not exists (select 1 from product_provider_ids where provider = 'zuptos' and external_id = external) then
      raise exception 'Unmapped product';
    end if;
    for target in select product_id from product_provider_ids where provider = 'zuptos' and external_id = external loop
      insert into purchases(provider, order_id, product_id, email, status, occurred_at)
        values ('zuptos', p_event->>'order_id', target, lower(trim(p_event->>'email')),
          p_event->>'status', (p_event->>'occurred_at')::timestamptz)
        on conflict (provider, order_id, product_id) do update
          set status = excluded.status, occurred_at = excluded.occurred_at, updated_at = now()
          -- Um pedido revogado nunca é reativado por uma confirmação atrasada.
          where purchases.email = excluded.email
            and (excluded.status in ('refunded', 'chargeback')
              or (purchases.status = 'approved' and excluded.occurred_at >= purchases.occurred_at));
      if exists (select 1 from purchases where provider = 'zuptos' and order_id = p_event->>'order_id'
        and product_id = target and email <> lower(trim(p_event->>'email'))) then
        raise exception 'Order email mismatch';
      end if;
    end loop;
  end loop;
  update webhook_inbox set processed_at = now() where id = p_receipt;
end;
$$;
revoke all on function public.access_rate_limit(text), public.apply_purchase_event(text, jsonb) from public, anon, authenticated;
grant execute on function public.access_rate_limit(text), public.apply_purchase_event(text, jsonb) to service_role;

insert into public.products(id, name, description, is_platform)
values ('radio-modao', 'Rádio Modão', 'Acesso à plataforma Rádio Modão.', true)
on conflict (id) do nothing;
commit;
