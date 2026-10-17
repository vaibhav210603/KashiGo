"use client";

import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

// The phone-OTP session, shared by every component. `undefined` until the stored session has been read.
let session: Session | null | undefined;
const listeners = new Set<() => void>();
let started = false;

function start() {
    if (started || typeof window === "undefined") return;
    started = true;
    const sb = supabaseBrowser();
    if (!sb) { session = null; return; }
    sb.auth.getSession().then(({ data }) => { session = data.session; listeners.forEach((l) => l()); });
    sb.auth.onAuthStateChange((_e, s) => { session = s; listeners.forEach((l) => l()); });
}

const subscribe = (fn: () => void) => { start(); listeners.add(fn); return () => { listeners.delete(fn); }; };

export function useAuth() {
    const s = useSyncExternalStore(subscribe, () => session, () => undefined);
    const phone = s?.user?.phone ? `+${s.user.phone.replace(/^\+/, "")}` : null;
    return { ready: s !== undefined, loggedIn: !!s, phone, signOut: () => supabaseBrowser()?.auth.signOut() };
}

// Headers for our API routes: JSON plus the current access token when logged in.
export async function authHeaders(): Promise<Record<string, string>> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const { data } = (await supabaseBrowser()?.auth.getSession()) ?? { data: { session: null } };
    if (data.session?.access_token) h.Authorization = `Bearer ${data.session.access_token}`;
    return h;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON from our own API routes
export async function apiPost<T = any>(url: string, body: unknown, method = "POST"): Promise<{ ok: boolean; status: number; data: T }> {
    const res = await fetch(url, { method, headers: await authHeaders(), body: JSON.stringify(body) });
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({}) as T) };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON from our own API routes
export async function apiGet<T = any>(url: string): Promise<{ ok: boolean; status: number; data: T }> {
    const res = await fetch(url, { headers: await authHeaders() });
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({}) as T) };
}
