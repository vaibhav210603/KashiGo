import type { Metadata } from "next";
import RideConsultClient from "./RideConsultClient";

export const metadata: Metadata = {
    title: "Boat Ride + Talk to a Kashi Guru on Google Meet",
    description: "A private boat ride on the Ganga and a live Google Meet with a Vedic guru or numerologist of Kashi — from ₹3,299. Or a 45-minute consultation on its own for ₹2,999.",
    alternates: { canonical: "https://kashigo.in/ride-and-consult" },
    openGraph: {
        title: "Boat ride + a Kashi guru on Google Meet | KashiGo",
        description: "Your boat ride on the Ganga and a live consultation with a guru — from ₹3,299.",
        url: "https://kashigo.in/ride-and-consult",
        images: [{ url: "/consult/meet-guru-poster.jpg" }],
    },
};

export default function RideAndConsultPage() {
    return <RideConsultClient />;
}
