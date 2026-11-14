import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { EARLY_BIRD_INR, EARLY_BIRD_OPEN, GHAT_PRICE_INR, SEAT_PRICE_START_INR } from "@/lib/devDeepawali";
import DevDeepawaliClient from "./DevDeepawaliClient";

export const metadata: Metadata = {
    title: "Dev Deepawali 2026 Boat Ride, Varanasi — Book Your Seat",
    description:
        "Watch Dev Deepawali (Tue 24 Nov 2026) from the Ganga: the lit ghats, the grand aarti and fireworks over the river. A seat on a KashiGo boat with life jackets and a trusted boatman, paid online — in full or a 50% advance.",
    alternates: { canonical: "https://kashigo.in/dev-deepawali" },
    openGraph: {
        title: "Dev Deepawali on the Ganga — book your seat | KashiGo",
        description: "Tue 24 Nov 2026. The lit ghats, the grand aarti and fireworks over the river, from a KashiGo boat.",
        url: "https://kashigo.in/dev-deepawali",
        images: [{ url: "/dev-deepawali/diya-steps-wide.jpg", width: 2400, height: 1600 }],
    },
};

export default function DevDeepawaliPage() {
    return (
        <>
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "Event",
                name: "Dev Deepawali boat ride on the Ganga — KashiGo",
                startDate: "2026-11-24T17:00:00+05:30",
                endDate: "2026-11-24T20:30:00+05:30",
                eventStatus: "https://schema.org/EventScheduled",
                eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                location: { "@type": "Place", name: "Ghats of Varanasi, on the Ganga", address: { "@type": "PostalAddress", addressLocality: "Varanasi", addressRegion: "Uttar Pradesh", addressCountry: "IN" } },
                image: "https://kashigo.in/dev-deepawali/diya-steps-wide.jpg",
                organizer: { "@type": "Organization", name: "KashiGo", url: "https://kashigo.in" },
                offers: { "@type": "Offer", price: String(EARLY_BIRD_OPEN ? EARLY_BIRD_INR : SEAT_PRICE_START_INR), priceCurrency: "INR", availability: "https://schema.org/LimitedAvailability", url: "https://kashigo.in/dev-deepawali", description: `Per person. Local boatmen on the ghat charge ₹${GHAT_PRICE_INR.toLocaleString("en-IN")}.` },
            }} />
            <DevDeepawaliClient />
        </>
    );
}
