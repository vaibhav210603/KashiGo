// Shared class strings for the "Ganga after dark" look. Kept out of client modules so server pages can import them.

// Primary CTA: marigold → fire → ember pill with a hover sheen.
export const FIRE_BTN =
    "btn-sheen group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-marigold via-fire to-ember px-7 font-semibold text-night shadow-[0_10px_40px_-10px_rgba(255,122,26,0.8)] transition-shadow hover:shadow-[0_10px_50px_-6px_rgba(255,122,26,1)] disabled:opacity-60";

// Secondary pill on night backgrounds.
export const GHOST_BTN_DARK =
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-night";

// Secondary pill on parchment.
export const GHOST_BTN_LIGHT =
    "inline-flex items-center justify-center gap-2 rounded-full border border-night/20 px-7 font-medium text-night transition-colors hover:bg-night hover:text-parchment";

// A paper card sitting on parchment.
export const PAPER_CARD = "rounded-[1.75rem] border border-night/10 bg-[#fffaf0] shadow-[0_20px_50px_-35px_rgba(60,30,0,0.45)]";

// Section headline on parchment (pair with an italic `text-fire-deep` phrase).
export const H2_LIGHT = "font-display font-light text-night tracking-[-0.02em] leading-[1.02]";

// Underlined inline link on parchment.
export const LINK_LIGHT = "font-semibold text-night underline decoration-marigold decoration-2 underline-offset-4 transition-colors hover:text-fire";

// Splits a long headline so its last words can carry the italic fire.
export function splitTitle(text: string, tail = 2) {
    const words = text.trim().split(/\s+/);
    if (words.length <= tail + 1) return { title: text, highlight: undefined };
    return { title: words.slice(0, -tail).join(" "), highlight: words.slice(-tail).join(" ") };
}
