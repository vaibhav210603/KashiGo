import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KashiGo — Varanasi Boat Rides & Travel Guide",
    short_name: "KashiGo",
    description:
      "Book Varanasi boat rides instantly. Get the local scam-free travel guide.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1A3A5C",
    theme_color: "#E8650A",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["travel", "lifestyle"],
    lang: "en",
  };
}
