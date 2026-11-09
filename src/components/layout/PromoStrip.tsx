import Link from "next/link";

const MESSAGE = (
    <>
        <span aria-hidden className="mr-2 text-marigold">✦</span> Pay in full online: <b className="mx-1.5 rounded border border-marigold/50 px-1.5 py-0.5 font-mono tracking-wider text-marigold">WELCOME20</b> for 20% off
        <span aria-hidden className="mx-3 opacity-40">·</span> Booking 50/50: <b className="mx-1.5 rounded border border-marigold/50 px-1.5 py-0.5 font-mono tracking-wider text-marigold">WELCOME10</b> for 10% off
        <span aria-hidden className="mx-8 opacity-30">/</span>
    </>
);

// Slim strip above the header. The text is repeated so the scroll loops seamlessly;
// with reduced motion it sits still (see .promo-track in globals.css).
export default function PromoStrip() {
    return (
        <Link href="/book" aria-label="20% off with code WELCOME20 when you pay in full online, or 10% off with WELCOME10 on 50/50 bookings — book a boat ride"
            className="fixed top-0 inset-x-0 z-[55] h-8 overflow-hidden bg-night text-white/80 text-[12px] font-medium tracking-wide border-b border-white/10 flex items-center">
            <div className="promo-track flex shrink-0 whitespace-nowrap" aria-hidden>
                {Array.from({ length: 8 }, (_, i) => <span key={i} className="inline-flex items-center">{MESSAGE}</span>)}
            </div>
        </Link>
    );
}
