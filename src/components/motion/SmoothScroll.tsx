"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Momentum scrolling on desktop wheels/trackpads (touch keeps native scrolling).
// Skipped entirely for visitors who ask for reduced motion.
export default function SmoothScroll() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const lenis = new Lenis({
            lerp: 0.11,
            anchors: { offset: -96 },
            // Let dialogs (menu, checkout) and anything opted out scroll natively.
            prevent: (node) => !!node.closest?.("[role=dialog], [data-lenis-prevent]"),
        });
        let raf = 0;
        const tick = (t: number) => {
            // Modals lock the page with body overflow:hidden — pause Lenis while they're up.
            const locked = document.body.style.overflow === "hidden";
            if (locked && !lenis.isStopped) lenis.stop();
            else if (!locked && lenis.isStopped) lenis.start();
            lenis.raf(t);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => { cancelAnimationFrame(raf); lenis.destroy(); };
    }, []);
    return null;
}
