import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
    title: "Your account",
    description: "Your KashiGo coins, bookings and purchases.",
    robots: { index: false, follow: false },
    alternates: { canonical: "https://kashigo.in/account" },
};

export default function AccountPage() {
    return <AccountClient />;
}
