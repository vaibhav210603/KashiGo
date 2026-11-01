import type { Metadata } from "next";
import ConsultClient from "./ConsultClient";

export const metadata: Metadata = {
    title: "Book a Consultation — Vedic Gurus & Numerology",
    description: "Book a call or an appointment with KashiGo's Vedic gurus or our numerologist. Share your birth details and a photo of your right palm; we call you to fix a time. Pay only if satisfied.",
    alternates: { canonical: "https://kashigo.in/consult" },
};

export default function ConsultPage() {
    return <ConsultClient />;
}
