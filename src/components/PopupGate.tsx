"use client";

import { usePathname } from "next/navigation";
import GuidePopup from "@/components/GuidePopup";
import NewsletterPopup from "@/components/NewsletterPopup";

// Keep marketing popups off pages where the visitor is already buying.
export default function PopupGate() {
    const pathname = usePathname();
    if (pathname?.startsWith("/shop")) return null;
    return (
        <>
            <GuidePopup />
            <NewsletterPopup />
        </>
    );
}
