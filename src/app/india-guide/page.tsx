import { Metadata } from "next";
import IndiaGuideClient from "./IndiaGuideClient";

export const metadata: Metadata = {
  title: "The India Field Guide 2026",
  description: "India for foreigners, made simple. Scam shields, safe-to-eat food guides, day-by-day routes and survival essentials.",
  alternates: { canonical: "https://kashigo.in/india-guide" },
  openGraph: {
    title: "The India Field Guide 2026 | KashiGo",
    url: "https://kashigo.in/india-guide",
    type: "website",
    images: [{ url: "/og-guide.jpg", width: 1024, height: 1024 }],
  },
};

export default function IndiaGuidePage() {
  return <IndiaGuideClient />;
}
