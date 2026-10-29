import type { Metadata } from "next";
import ThankYouClient from "./ThankYouClient";

export const metadata: Metadata = {
    title: "Thank you",
    description: "Your KashiGo order is confirmed.",
    robots: { index: false, follow: false },
};

export default function ThankYouPage() {
    return <ThankYouClient />;
}
