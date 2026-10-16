"use client";

import { useEffect } from "react";
import { detectAiSource, gtag, track } from "@/lib/analytics";

// Site-wide GA4 events that don't belong to any one component:
// - ai_referral: first landing from ChatGPT / Perplexity / Claude / Gemini etc.
// - contact clicks on tel:, WhatsApp and mailto: links.
export default function AnalyticsEvents() {
    useEffect(() => {
        try {
            const utm = new URLSearchParams(window.location.search).get("utm_source");
            const ai = detectAiSource(document.referrer, utm);
            if (ai && !sessionStorage.getItem("kg_ai_ref")) {
                sessionStorage.setItem("kg_ai_ref", ai);
                gtag("set", "user_properties", { ai_source: ai });
                track("ai_referral", { ai_source: ai, landing_page: window.location.pathname });
            }
        } catch { }

        const onClick = (e: MouseEvent) => {
            const a = (e.target as Element | null)?.closest?.("a");
            const href = a?.getAttribute("href") || "";
            if (href.startsWith("tel:")) track("contact_click", { method: "phone", page: location.pathname });
            else if (/wa\.me|whatsapp\.com/.test(href)) track("contact_click", { method: "whatsapp", page: location.pathname });
            else if (href.startsWith("mailto:")) track("contact_click", { method: "email", page: location.pathname });
        };
        document.addEventListener("click", onClick, { capture: true });
        return () => document.removeEventListener("click", onClick, { capture: true });
    }, []);

    return null;
}
