-- WELCOME20: 20% off when paying in full online (WELCOME10 is now for 50/50 bookings only — see lib/pricing.ts).
-- Once per customer, like WELCOME10. Safe to run more than once.
insert into public.coupons (code, kind, value, applies_to, max_uses, per_customer_limit, note)
values ('WELCOME20', 'percent', 20, '{all}', null, 1, 'Promo strip code: full online payment only, once per customer')
on conflict (code) do nothing;
update public.coupons set note = 'Promo strip code: 50/50 bookings only, once per customer' where code = 'WELCOME10';
