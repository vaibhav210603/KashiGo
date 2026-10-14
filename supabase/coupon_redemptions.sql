-- Single-use coupon tracking (e.g. BLISS20). Run once in the Supabase SQL editor.
-- The table has RLS on and no policies, so the anon key can't read or edit it directly;
-- the app only goes through the two functions below.

create table if not exists public.coupon_redemptions (
    code text primary key,
    order_ref text not null,          -- "razorpay:order_…" or "paypal:…" of the checkout holding the code
    claimed_at timestamptz not null default now()
);
alter table public.coupon_redemptions enable row level security;

-- Which order currently holds the code (null = never used).
create or replace function public.coupon_claim_ref(p_code text) returns text
language sql security definer set search_path = public as $$
    select order_ref from coupon_redemptions where code = upper(p_code);
$$;

-- Atomic claim. First use: insert. Retry after an unpaid checkout: hand over from p_prev_ref.
-- Returns false if someone else got there first.
create or replace function public.claim_coupon(p_code text, p_order_ref text, p_prev_ref text default null) returns boolean
language plpgsql security definer set search_path = public as $$
begin
    if p_prev_ref is null then
        insert into coupon_redemptions (code, order_ref) values (upper(p_code), p_order_ref)
        on conflict (code) do nothing;
    else
        update coupon_redemptions set order_ref = p_order_ref, claimed_at = now()
        where code = upper(p_code) and order_ref = p_prev_ref;
    end if;
    return found;
end;
$$;

revoke all on function public.coupon_claim_ref(text) from public;
revoke all on function public.claim_coupon(text, text, text) from public;
grant execute on function public.coupon_claim_ref(text) to anon;
grant execute on function public.claim_coupon(text, text, text) to anon;

-- To make a code usable again: delete from public.coupon_redemptions where code = 'BLISS20';
