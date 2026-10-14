-- Booking fields the site now saves. Run once in the Supabase SQL editor.
-- Until this runs, bookings still save (the date is folded into time_of_day) — nothing breaks.

alter table public.orders add column if not exists ride_date date;
alter table public.orders add column if not exists custom_details jsonb;
alter table public.orders add column if not exists coupon text;
alter table public.orders add column if not exists check_notes text;  -- anything the server flagged for a human to check

-- One payment can only ever be attached to one booking (stops reuse of a payment reference).
-- If this fails because duplicates already exist, find them with:
--   select razorpay_payment_id, count(*) from public.orders where razorpay_payment_id is not null group by 1 having count(*) > 1;
create unique index if not exists orders_payment_ref_unique
    on public.orders (razorpay_payment_id) where razorpay_payment_id is not null;
