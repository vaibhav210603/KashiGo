import { Metadata } from "next";
import IndiaTourClient from "./IndiaTourClient";

export const metadata: Metadata = {
  title: "Premium India Tour Guide | KashiGo",
  description: "Get the ultimate premium India Tour guide. An exclusive journey through Delhi, Agra, Jaipur, Udaipur, and Varanasi.",
};

export default function IndiaTourPage() {
  return <IndiaTourClient />;
}
