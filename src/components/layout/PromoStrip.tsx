import Link from "next/link";

const MESSAGE = (
    <>
        <span aria-hidden>🎉</span> Use code <b className="mx-1 rounded bg-white/20 px-1.5 py-0.5 font-mono tracking-wider">WELCOME10</b> for 10% off boat rides, guides &amp; audio tours
        <span aria-hidden className="mx-6 opacity-60">✦</span>
    </>
);

// Slim strip above the header. The text is repeated so the scroll loops seamlessly;
// with reduced motion it sits still (see .promo-track in globals.css).
export default function PromoStrip() {
    return (
        <Link href="/book" aria-label="10% off with code WELCOME10 — book a boat ride"
            className="fixed top-0 inset-x-0 z-[55] h-8 overflow-hidden bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500 text-white text-[13px] font-medium flex items-center">
            <div className="promo-track flex shrink-0 whitespace-nowrap" aria-hidden>
                {Array.from({ length: 8 }, (_, i) => <span key={i} className="inline-flex items-center">{MESSAGE}</span>)}
            </div>
        </Link>
    );
}
