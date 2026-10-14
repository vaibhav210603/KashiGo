import { SHOP_PRODUCTS, ShopProductId } from "@/lib/products";

// schema.org Product + Book markup for a set of shop products (format: EBook or AudiobookFormat).
export function productListSchema(ids: ShopProductId[], url: string) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: ids.map((id, i) => {
            const p = SHOP_PRODUCTS.find((x) => x.id === id)!;
            const audio = id === "walk-the-ghats" || id === "scam-proof-audiobook";
            return {
                "@type": "ListItem",
                position: i + 1,
                item: {
                    "@type": audio ? ["Product", "Audiobook"] : ["Product", "Book"],
                    name: p.name,
                    description: p.tagline,
                    image: `https://kashigo.in${p.cover}`,
                    url: `${url}#${p.id}`,
                    brand: { "@type": "Brand", name: "KashiGo" },
                    author: { "@type": "Organization", name: "KashiGo", url: "https://kashigo.in" },
                    inLanguage: "en",
                    ...(audio ? {} : { bookFormat: "https://schema.org/EBook" }),
                    offers: [
                        { "@type": "Offer", price: p.usd, priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${url}#${p.id}` },
                        { "@type": "Offer", price: p.inr, priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${url}#${p.id}` },
                    ],
                },
            };
        }),
    };
}
