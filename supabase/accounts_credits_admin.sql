-- Email accounts (email code or Google login), KashiGo coins (credits), database coupons and refunds.
-- Run once in the Supabase SQL editor, after coupon_redemptions.sql and orders_booking_fields.sql.
--
-- Every table here has RLS on and NO policies: the browser (anon key) can't touch them.
-- Only the server reaches them, with the service-role key (SUPABASE_SERVICE_ROLE_KEY).
-- Money is whole rupees. 1 KashiGo coin = ₹1.
--
-- Also needed (Vercel → Settings → Environment Variables):
--   SUPABASE_SERVICE_ROLE_KEY  Supabase → Project Settings → API → service_role (server only, never NEXT_PUBLIC_)
--   ADMIN_EMAILS               who can open /admin, comma-separated, e.g. you@kashigo.in,info.kashigo@gmail.com
-- And Supabase → Authentication: Email provider on (with custom SMTP), Google provider on.

-- ── Profiles: one per email address (lower-case) ──────────────────────────────────────────
create table if not exists public.profiles (
    email text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    user_id uuid unique references auth.users (id) on delete set null,  -- set once they log in
    name text,
    phone text,
    credits_inr integer not null default 0 check (credits_inr >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Every change to a balance, newest last. balance_after makes the history self-checking.
create table if not exists public.credit_ledger (
    id bigint generated always as identity primary key,
    email text not null references public.profiles (email) on update cascade,
    delta_inr integer not null,
    balance_after integer not null,
    kind text not null check (kind in ('refund', 'spend', 'release', 'adjust')),
    ref text,          -- order ref / refund target
    note text,
    created_by text,   -- admin email for refunds and adjustments
    created_at timestamptz not null default now()
);
create index if not exists credit_ledger_email_idx on public.credit_ledger (email, created_at desc);
alter table public.credit_ledger enable row level security;

-- Coins set aside for a checkout that hasn't been confirmed yet. Released if the payment never happens.
create table if not exists public.credit_holds (
    ref text primary key,                 -- "razorpay:order_…", "paypal:…", "credits:…"
    email text not null references public.profiles (email) on update cascade,
    amount_inr integer not null check (amount_inr > 0),
    product text not null,
    status text not null default 'held' check (status in ('held', 'spent', 'released')),
    created_at timestamptz not null default now(),
    settled_at timestamptz
);
create index if not exists credit_holds_email_idx on public.credit_holds (email, status);
alter table public.credit_holds enable row level security;

-- ── Coupons, managed from /admin ───────────────────────────────────────────────────────────
create table if not exists public.coupons (
    code text primary key check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,30}$'),
    kind text not null check (kind in ('percent', 'amount_off', 'fixed_price')),
    value numeric not null check (value > 0),  -- percent: 1–100 · amount_off / fixed_price: rupees
    applies_to text[] not null default '{all}', -- all | boat | shop | guide | india-tour | a product id
    max_uses integer check (max_uses > 0),      -- across everyone; null = unlimited
    per_customer_limit integer check (per_customer_limit > 0), -- null = unlimited
    active boolean not null default true,
    starts_at timestamptz,
    expires_at timestamptz,
    note text,
    created_by text,
    created_at timestamptz not null default now()
);
alter table public.coupons enable row level security;

create table if not exists public.coupon_uses (
    id bigint generated always as identity primary key,
    code text not null references public.coupons (code) on update cascade on delete cascade,
    email text not null,
    order_ref text not null unique,
    status text not null default 'held' check (status in ('held', 'paid', 'released')),
    created_at timestamptz not null default now(),
    paid_at timestamptz
);
create index if not exists coupon_uses_code_idx on public.coupon_uses (code, status);
alter table public.coupon_uses enable row level security;

-- The codes that used to live in the site's source, so nothing changes for customers.
insert into public.coupons (code, kind, value, applies_to, max_uses, per_customer_limit, note) values
    ('WELCOME10',   'percent',     10, '{all}',         null, 1,    'Promo strip code: once per customer'),
    ('BLISS20',     'percent',     20, '{all}',         1,    null, 'Single use'),
    ('LAUNCH40',    'percent',     40, '{shop,guide}',  null, null, null),
    ('INSIDER20',   'percent',     20, '{shop}',        null, null, null),
    ('KASHISECRET', 'percent',     50, '{shop,guide}',  null, null, null),
    ('EXCLUSIVE20', 'percent',     20, '{guide}',       null, null, null),
    ('KASHIGO21',   'fixed_price', 10, '{boat}',        null, null, 'Boat ride for ₹10 (test code)')
on conflict (code) do nothing;

-- Carry over a BLISS20 that was already claimed under the old system.
insert into public.coupon_uses (code, email, order_ref, status, paid_at)
select upper(code), 'legacy', order_ref, 'paid', claimed_at from public.coupon_redemptions
where upper(code) in (select code from public.coupons)
on conflict (order_ref) do nothing;

-- ── Orders: who paid, coins used, refunds ──────────────────────────────────────────────────
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists credits_used integer not null default 0;
alter table public.orders add column if not exists refunded_inr integer not null default 0;
alter table public.orders add column if not exists refunded_at timestamptz;
create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_ride_id_idx on public.orders (ride_id);

create table if not exists public.shop_orders (
    id bigint generated always as identity primary key,
    order_ref text not null unique,
    product text not null,
    customer_email text,
    name text,
    phone text,
    provider text not null,       -- razorpay | paypal | credits
    amount_inr integer not null default 0,   -- cash paid, in rupees (PayPal converted at the site's rate)
    amount_usd numeric,
    credits_used integer not null default 0,
    coupon text,
    refunded_inr integer not null default 0,
    refunded_at timestamptz,
    created_at timestamptz not null default now()
);
create index if not exists shop_orders_email_idx on public.shop_orders (customer_email);
alter table public.shop_orders enable row level security;

-- ── Functions (atomic money moves) ─────────────────────────────────────────────────────────

create or replace function public.ensure_profile(p_email text, p_name text default null, p_phone text default null, p_user_id uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
    insert into profiles (email, name, phone, user_id) values (lower(p_email), nullif(p_name, ''), nullif(p_phone, ''), p_user_id)
    on conflict (email) do update set
        name = coalesce(profiles.name, excluded.name),
        phone = coalesce(excluded.phone, profiles.phone),
        user_id = coalesce(excluded.user_id, profiles.user_id),
        updated_at = now();
end;
$$;

-- Adds (or with a negative amount, removes) coins and writes the ledger line. Returns the new balance.
create or replace function public.credit_add(p_email text, p_amount integer, p_kind text, p_ref text default null, p_note text default null, p_by text default null)
returns integer language plpgsql security definer set search_path = public as $$
declare bal integer;
begin
    perform ensure_profile(p_email);
    update profiles set credits_inr = credits_inr + p_amount, updated_at = now()
    where email = lower(p_email) and credits_inr + p_amount >= 0
    returning credits_inr into bal;
    if bal is null then raise exception 'insufficient credits'; end if;
    insert into credit_ledger (email, delta_inr, balance_after, kind, ref, note, created_by)
    values (lower(p_email), p_amount, bal, p_kind, p_ref, p_note, p_by);
    return bal;
end;
$$;

-- Sets coins aside for a checkout. False if the balance is too low (nothing changes).
create or replace function public.credit_hold(p_email text, p_amount integer, p_ref text, p_product text)
returns boolean language plpgsql security definer set search_path = public as $$
declare bal integer;
begin
    update profiles set credits_inr = credits_inr - p_amount, updated_at = now()
    where email = lower(p_email) and credits_inr >= p_amount
    returning credits_inr into bal;
    if bal is null then return false; end if;
    insert into credit_holds (ref, email, amount_inr, product) values (p_ref, lower(p_email), p_amount, p_product);
    insert into credit_ledger (email, delta_inr, balance_after, kind, ref, note)
    values (lower(p_email), -p_amount, bal, 'spend', p_ref, p_product);
    return true;
end;
$$;

-- Payment confirmed: the held coins are spent for good.
create or replace function public.credit_settle(p_ref text) returns void
language sql security definer set search_path = public as $$
    update credit_holds set status = 'spent', settled_at = now() where ref = p_ref and status = 'held';
$$;

-- Payment never happened: give the held coins back. True if anything was returned.
create or replace function public.credit_release(p_ref text) returns boolean
language plpgsql security definer set search_path = public as $$
declare h credit_holds;
begin
    update credit_holds set status = 'released', settled_at = now()
    where ref = p_ref and status = 'held' returning * into h;
    if h.ref is null then return false; end if;
    perform credit_add(h.email, h.amount_inr, 'release', p_ref, 'Checkout not completed');
    return true;
end;
$$;

-- Whether a code can be used by this customer right now: ok | not_found | inactive | not_started | expired | used_up | customer_limit.
-- Unconfirmed checkouts hold a use for 30 minutes.
create or replace function public.coupon_status(p_code text, p_email text) returns text
language plpgsql security definer set search_path = public as $$
declare c coupons; total integer; mine integer;
begin
    select * into c from coupons where code = upper(p_code);
    if c.code is null then return 'not_found'; end if;
    if not c.active then return 'inactive'; end if;
    if c.starts_at is not null and now() < c.starts_at then return 'not_started'; end if;
    if c.expires_at is not null and now() > c.expires_at then return 'expired'; end if;
    select count(*) filter (where true), count(*) filter (where email = lower(p_email)) into total, mine
    from coupon_uses where code = c.code and (status = 'paid' or (status = 'held' and created_at > now() - interval '30 minutes'));
    if c.max_uses is not null and total >= c.max_uses then return 'used_up'; end if;
    if c.per_customer_limit is not null and mine >= c.per_customer_limit then return 'customer_limit'; end if;
    return 'ok';
end;
$$;

-- Atomically checks and records a use for a checkout. Returns the same statuses as coupon_status.
create or replace function public.coupon_reserve(p_code text, p_email text, p_ref text) returns text
language plpgsql security definer set search_path = public as $$
declare s text;
begin
    perform 1 from coupons where code = upper(p_code) for update;  -- serialise concurrent checkouts per code
    s := coupon_status(p_code, p_email);
    if s <> 'ok' then return s; end if;
    insert into coupon_uses (code, email, order_ref) values (upper(p_code), lower(p_email), p_ref)
    on conflict (order_ref) do nothing;
    return 'ok';
end;
$$;

create or replace function public.coupon_paid(p_ref text) returns void
language sql security definer set search_path = public as $$
    update coupon_uses set status = 'paid', paid_at = now() where order_ref = p_ref and status = 'held';
$$;

create or replace function public.coupon_release(p_ref text) returns void
language sql security definer set search_path = public as $$
    update coupon_uses set status = 'released' where order_ref = p_ref and status = 'held';
$$;

-- Refund an order as coins to the email that booked. Never more than was paid (cash + coins) minus earlier refunds.
-- p_kind: 'boat' (orders.ride_id) or 'shop' (shop_orders.order_ref). Returns the customer's new balance.
create or replace function public.refund_order(p_kind text, p_key text, p_amount integer, p_note text, p_by text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_email text; v_paid integer; v_refunded integer; v_ref text;
begin
    if p_amount <= 0 then raise exception 'refund must be positive'; end if;
    if p_kind = 'boat' then
        select customer_email, round(coalesce(amount, 0))::int + credits_used, refunded_inr, ride_id
        into v_email, v_paid, v_refunded, v_ref from orders where ride_id = p_key for update;
    elsif p_kind = 'shop' then
        select customer_email, amount_inr + credits_used, refunded_inr, order_ref
        into v_email, v_paid, v_refunded, v_ref from shop_orders where order_ref = p_key for update;
    else
        raise exception 'unknown order kind';
    end if;
    if v_ref is null then raise exception 'order not found'; end if;
    if v_email is null then raise exception 'order has no customer email'; end if;
    if v_refunded + p_amount > v_paid then raise exception 'refund exceeds amount paid (% left)', v_paid - v_refunded; end if;
    if p_kind = 'boat' then
        update orders set refunded_inr = refunded_inr + p_amount, refunded_at = now() where ride_id = p_key;
    else
        update shop_orders set refunded_inr = refunded_inr + p_amount, refunded_at = now() where order_ref = p_key;
    end if;
    return credit_add(v_email, p_amount, 'refund', v_ref, p_note, p_by);
end;
$$;

-- Only the server (service role) may call these.
revoke all on function public.ensure_profile(text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.credit_add(text, integer, text, text, text, text) from public, anon, authenticated;
revoke all on function public.credit_hold(text, integer, text, text) from public, anon, authenticated;
revoke all on function public.credit_settle(text) from public, anon, authenticated;
revoke all on function public.credit_release(text) from public, anon, authenticated;
revoke all on function public.coupon_status(text, text) from public, anon, authenticated;
revoke all on function public.coupon_reserve(text, text, text) from public, anon, authenticated;
revoke all on function public.coupon_paid(text) from public, anon, authenticated;
revoke all on function public.coupon_release(text) from public, anon, authenticated;
revoke all on function public.refund_order(text, text, integer, text, text) from public, anon, authenticated;
