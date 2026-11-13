-- Leads CRM: every enquiry (call, WhatsApp, Instagram, website) as one row, managed from /admin → Leads
-- and from the WhatsApp bot (/api/whatsapp). Run once in the Supabase SQL editor.
-- RLS on with no policies: only the server (service-role key) reads or writes it.
create table if not exists public.leads (
    id bigint generated always as identity primary key,   -- the short number workers type in WhatsApp ("23 booked")
    name text not null default '',
    phone text,                    -- E.164, e.g. +919876543210 (src/lib/phone.ts)
    source text not null default 'whatsapp',  -- whatsapp | call | instagram | website | referral | walk_in | other
    interest text not null default '',        -- what they asked about, e.g. "evening aarti boat"
    travel_date date,
    pax integer check (pax is null or pax between 1 and 500),
    notes text not null default '',
    status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'follow_up', 'booked', 'lost')),
    amount_inr integer check (amount_inr is null or amount_inr >= 0),  -- quoted / booked value
    follow_up_on date,             -- next nudge; set automatically when the status changes
    added_by text not null default '',
    history jsonb not null default '[]'::jsonb,  -- [{at, by, text}] — status changes and notes
    bot_msg_ids text[] not null default '{}',     -- WhatsApp ids of the bot's messages about this lead, so a reply to one finds it
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_bot_msg_idx on public.leads using gin (bot_msg_ids);
alter table public.leads enable row level security;
