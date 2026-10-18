"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, useAuth } from "@/components/auth/useAuth";

export type Account = {
    email: string;
    name: string;
    phone: string;
    credits: number;
    admin: boolean;
    ledger: { delta_inr: number; balance_after: number; kind: string; ref: string | null; note: string | null; created_at: string }[];
    rides: { ride_id: string; ride_date: string | null; time_of_day: string; package_id: string; amount: number; credits_used: number; refunded_inr: number; payment_mode: string; payment_status: string }[];
    purchases: { order_ref: string; product: string; amount_inr: number; credits_used: number; refunded_inr: number; provider: string; created_at: string }[];
};

// The logged-in customer's profile from /api/account (null while logged out).
export function useAccount() {
    const { loggedIn, email } = useAuth();
    const [account, setAccount] = useState<Account | null>(null);
    const refresh = useCallback(async () => {
        if (!loggedIn) { setAccount(null); return; }
        const r = await apiGet<Account>("/api/account");
        setAccount(r.ok ? r.data : null);
    }, [loggedIn]);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on login / account change
    useEffect(() => { refresh(); }, [refresh, email]);
    return { account: loggedIn ? account : null, refresh };
}
