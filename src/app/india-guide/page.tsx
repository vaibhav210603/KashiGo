import { Metadata } from "next";
import IndiaGuideClient from "./IndiaGuideClient";

export const metadata: Metadata = {
  title: "The India Field Guide 2026 | KashiGo",
  description: "India for foreigners, made simple. Scam shields, safe-to-eat food guides, day-by-day routes and survival essentials.",
};

export default function IndiaGuidePage() {
  return <IndiaGuideClient />;
}
