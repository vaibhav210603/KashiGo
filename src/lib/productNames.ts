// Human names for product ids, for order lists (account page, admin).
import { BOAT_RIDES, CUSTOM_RIDE } from "@/lib/boatRides";
import { SHOP_PRODUCTS } from "@/lib/products";

export function productName(id: string | null | undefined): string {
    if (!id) return CUSTOM_RIDE.short;
    if (id === "custom-boat") return CUSTOM_RIDE.short;
    if (id === "guide") return "Varanasi Insider Guide";
    if (id === "india-tour") return "India Field Guide";
    return BOAT_RIDES.find((r) => r.id === id)?.short ?? SHOP_PRODUCTS.find((p) => p.id === id)?.name ?? id;
}
