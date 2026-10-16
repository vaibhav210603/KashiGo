import { Metadata } from "next";
import IndiaTourClient from "./IndiaTourClient";

export const metadata: Metadata = {
  title: "Premium India Tour Guide",
  description: "Get the ultimate premium India Tour guide. An exclusive journey through Delhi, Agra, Jaipur, Udaipur, and Varanasi.",
  alternates: { canonical: "https://kashigo.in/india-tour" },
  openGraph: {
    title: "Premium India Tour Guide | KashiGo",
    url: "https://kashigo.in/india-tour",
    type: "website",
    images: [{ url: "/og-guide.jpg", width: 1024, height: 1024 }],
  },
};

export default function IndiaTourPage() {
  return <IndiaTourClient />;
}
