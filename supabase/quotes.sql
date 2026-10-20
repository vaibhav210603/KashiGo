-- Custom quotations made in /admin → Quotes and paid at kashigo.in/quote/<id>.
-- Run once in the Supabase SQL editor. RLS on with no policies: only the server (service-role key) reads or writes it.
create table if not exists public.quotes (
    id text primary key check (id ~ '^KG-Q-[0-9]{6}-[A-Z0-9-]{1,12}$'),
    data jsonb not null,          -- the whole quotation (customer, ride, itinerary, line items) — see src/lib/quotes.ts
    total_inr integer not null check (total_inr > 0),
    created_by text,
    paid_at timestamptz,          -- set when the Razorpay payment is verified
    payment_id text,
    created_at timestamptz not null default now()
);
create index if not exists quotes_created_idx on public.quotes (created_at desc);
alter table public.quotes enable row level security;
