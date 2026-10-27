import type { Metadata } from "next";
import CheatSheetClient from "./CheatSheetClient";

export const metadata: Metadata = {
  title: "Free Varanasi Scam Cheat Sheet (PDF) — 9 Scams and the Real Prices",
  description:
    "The 9 scams every first-timer meets in Varanasi and the one-line move that beats each, plus the real prices for boats, taxis and temples. Free PDF from a local. Answer the 5-question trivia to get the full guide for $5.99.",
  keywords: [
    "Varanasi scams",
    "Varanasi scam cheat sheet",
    "Varanasi boat price",
    "Varanasi tourist scams 2026",
    "Varanasi free PDF guide",
  ],
  alternates: { canonical: "https://kashigo.in/scam-cheat-sheet" },
  openGraph: {
    title: "Free Varanasi Scam Cheat Sheet — from a local",
    description: "9 scams, the real prices, and the one-line move for each. Free PDF.",
    url: "https://kashigo.in/scam-cheat-sheet",
    images: [{ url: "/og-guide.jpg", width: 1200, height: 630 }],
    type: "website",
  },
};

export default function ScamCheatSheetPage() {
  return (
    <main className="min-h-screen bg-parchment flex flex-col font-sans overflow-hidden">
      <CheatSheetClient />
    </main>
  );
}
