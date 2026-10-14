// Everything KashiGo sells digitally, in the order we want people to see it:
// highest value first (bundle), then the most-wanted single titles.
import { SHOP_PRODUCTS, ShopProductId } from "@/lib/products";

export type CatalogItem = {
    key: string;
    name: string;
    blurb: string;
    cover: string;
    usd: number;
    inr: number;
    kind: "Bundle" | "Ebook" | "Audio" | "Guide";
    href: string;
    shopId?: ShopProductId; // sold through the shared checkout (one-tap buy)
};

const fromShop = (id: ShopProductId, kind: CatalogItem["kind"], href: string): CatalogItem => {
    const p = SHOP_PRODUCTS.find((x) => x.id === id)!;
    return { key: id, name: p.name, blurb: p.tagline, cover: p.cover, usd: p.usd, inr: p.inr, kind, href: `${href}#${id}`, shopId: id };
};

export const CATALOG: CatalogItem[] = [
    fromShop("complete-bundle", "Bundle", "/shop"),
    { key: "guide", name: "Varanasi Insider Guide 2026", blurb: "All 84 ghats, 9 scam shields and a local's 2-day itinerary.", cover: "/VARANASi.png", usd: 14.99, inr: 999, kind: "Guide", href: "/guide" },
    fromShop("india-scam-proof", "Ebook", "/ebooks"),
    { key: "india-tour", name: "India Field Guide 2026", blurb: "Delhi, Agra, Jaipur, Udaipur & Varanasi — day by day, scam-free.", cover: "/agra_cover.jpg", usd: 29, inr: 2374, kind: "Guide", href: "/india-tour" },
    fromShop("kashi-unveiled", "Ebook", "/ebooks"),
    fromShop("walk-the-ghats", "Audio", "/audiobooks"),
    fromShop("scam-proof-audiobook", "Audio", "/audiobooks"),
];

export const KIND_STYLE: Record<CatalogItem["kind"], string> = {
    Bundle: "bg-orange-100 text-orange-700",
    Guide: "bg-teal-100 text-teal-700",
    Ebook: "bg-sky-100 text-sky-700",
    Audio: "bg-pink-100 text-pink-700",
};
