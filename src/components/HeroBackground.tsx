"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Canvas layer of glowing embers drifting upward — evokes floating diya
 * lights over the Ganges at night.
 *
 * Perf notes: each ember is a pre-rendered radial-gradient sprite that we
 * stamp with drawImage — NO per-frame canvas shadowBlur (which is what made
 * this expensive). We also pause when the tab is hidden and cap DPR.
 */
export default function HeroBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reduce = useReducedMotion();

    useEffect(() => {
        if (reduce) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const colors = ["#fb923c", "#f59e0b", "#fbbf24", "#fdba74", "#fde68a", "#ffffff"];

        // Pre-render one soft glow sprite per colour (done once, reused forever).
        const SPRITE = 48;
        const sprites = colors.map((color) => {
            const c = document.createElement("canvas");
            c.width = SPRITE;
            c.height = SPRITE;
            const g = c.getContext("2d")!;
            const grad = g.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
            grad.addColorStop(0, color);
            grad.addColorStop(0.25, color);
            grad.addColorStop(1, "rgba(0,0,0,0)");
            g.fillStyle = grad;
            g.beginPath();
            g.arc(SPRITE / 2, SPRITE / 2, SPRITE / 2, 0, Math.PI * 2);
            g.fill();
            return c;
        });

        type Particle = {
            x: number;
            y: number;
            size: number;
            vy: number;
            drift: number;
            phase: number;
            tw: number;
            base: number;
            sprite: HTMLCanvasElement;
        };

        let width = 0;
        let height = 0;
        let particles: Particle[] = [];
        let raf = 0;
        let t = 0;

        const make = (seeded: boolean): Particle => {
            const r = Math.random() * 3.4 + 1;
            return {
                x: Math.random() * width,
                y: seeded ? Math.random() * height : height + 30,
                size: r * 6, // glow diameter drawn from the sprite
                vy: (Math.random() * 0.5 + 0.22) * (r / 3 + 0.6),
                drift: Math.random() * 0.7 + 0.2,
                phase: Math.random() * Math.PI * 2,
                tw: Math.random() * 0.03 + 0.008,
                base: Math.random() * 0.4 + 0.5,
                sprite: sprites[Math.floor(Math.random() * sprites.length)],
            };
        };

        const count = () => {
            // Scale particle count with area, capped for perf.
            return Math.min(80, Math.max(40, Math.round((width * height) / 26000)));
        };

        const init = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            particles = Array.from({ length: count() }, () => make(true));
        };

        const frame = () => {
            t += 1;
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = "lighter";

            for (const p of particles) {
                p.y -= p.vy;
                p.x += Math.sin(t * 0.01 + p.phase) * p.drift * 0.35;

                const twinkle = p.base + Math.sin(t * p.tw + p.phase) * 0.3;
                const fade = Math.min(1, (p.y / height) * 1.6); // dim as they near the top
                ctx.globalAlpha = Math.max(0, Math.min(1, twinkle)) * fade;
                ctx.drawImage(p.sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);

                if (p.y < -30) Object.assign(p, make(false));
            }

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
            raf = requestAnimationFrame(frame);
        };

        const start = () => {
            if (!raf) raf = requestAnimationFrame(frame);
        };
        const stop = () => {
            cancelAnimationFrame(raf);
            raf = 0;
        };

        // Don't burn cycles while the tab is in the background.
        const onVisibility = () => (document.hidden ? stop() : start());

        init();
        start();
        window.addEventListener("resize", init);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            stop();
            window.removeEventListener("resize", init);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [reduce]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />;
}
