import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script, Playfair_Display, Outfit } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import Script from "next/script";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kashigo.in"),

  title: {
    default: "KashiGo — Varanasi Boat Rides & Travel Guide for Foreigners",
    template: "%s | KashiGo Varanasi",
  },

  description:
    "Book Varanasi boat rides for sunrise, Ganga Aarti & sunset. Get the complete scam-free Varanasi travel guide written by a local born in the city. Trusted by foreign travelers.",

  keywords: [
    "Varanasi boat ride booking",
    "Ganga Aarti boat ride Varanasi",
    "Varanasi travel guide foreigners",
    "Varanasi scam free guide",
    "Varanasi sunrise boat ride",
    "things to do Varanasi foreigners",
    "KashiGo Varanasi",
    "Varanasi local guide 2026",
    "Kashi boat ride Ganges",
    "book boat Varanasi online",
  ],

  authors: [{ name: "KashiGo", url: "https://kashigo.in" }],
  creator: "KashiGo",
  publisher: "KashiGo",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kashigo.in",
    siteName: "KashiGo",
    title: "KashiGo — Varanasi Boat Rides & Travel Guide",
    description:
      "Book Varanasi boat rides. Get the scam-free local's travel guide. Written by someone born in Varanasi.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KashiGo — Varanasi Boat Rides and Travel Guide for Foreigners",
        type: "image/jpeg",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "KashiGo — Varanasi Boat Rides & Travel Guide",
    description:
      "Book Varanasi boat rides. Get the scam-free local's travel guide. Written by someone born in Varanasi.",
    images: ["/og-image.jpg"],
  },

  alternates: {
    canonical: "https://kashigo.in",
  },

  category: "travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FERJSDDQ3J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FERJSDDQ3J');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${playfair.variable} ${outfit.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
