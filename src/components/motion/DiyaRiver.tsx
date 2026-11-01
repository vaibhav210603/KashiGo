"use client";

import { useEffect, useRef } from "react";

// Dev Deepawali night over the hero photo: diyas floating down the river and sky lanterns rising.
// Kept light for phones: every glow is a sprite drawn once and stamped with drawImage, it runs at 30fps
// with a capped pixel ratio, and it stops when offscreen or hidden. Reduced motion gets one still frame.
type Diya = { x: number; y: number; s: number; vx: number; phase: number };
type Lantern = { x: number; y: number; s: number; vy: number; sway: number; phase: number };

const sprite = (size: number, draw: (c: CanvasRenderingContext2D, size: number) => void) => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    draw(c.getContext("2d")!, size);
    return c;
};

const glowSprite = (rgb: string) => sprite(64, (c, n) => {
    const g = c.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0, `rgba(${rgb},0.85)`);
    g.addColorStop(0.35, `rgba(${rgb},0.3)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, n, n);
});

// A clay lamp with its flame, 32×32, flame tip at the top centre.
const diyaSprite = () => sprite(32, (c) => {
    c.fillStyle = "#6b2d12";
    c.beginPath(); c.ellipse(16, 22, 13, 5, 0, 0, Math.PI); c.fill();
    c.fillStyle = "#c2541f";
    c.beginPath(); c.ellipse(16, 22, 13, 2.6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#ffd88a";
    c.beginPath(); c.moveTo(13, 21); c.quadraticCurveTo(16, 2, 19, 21); c.closePath(); c.fill();
});

const lanternSprite = () => sprite(32, (c) => {
    const g = c.createLinearGradient(0, 4, 0, 30);
    g.addColorStop(0, "#ff9a3c");
    g.addColorStop(1, "#ffe08a");
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(9, 4); c.lineTo(23, 4); c.quadraticCurveTo(28, 17, 21, 29); c.lineTo(11, 29); c.quadraticCurveTo(4, 17, 9, 4);
    c.fill();
});

export default function DiyaRiver({ className = "" }: { className?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const warm = glowSprite("255,150,40"), diya = diyaSprite(), lantern = lanternSprite();

        let w = 0, h = 0, raf = 0, visible = true, t = 0, last = 0;
        let diyas: Diya[] = [], lanterns: Lantern[] = [];
        const riverTop = () => h * 0.66;
        const newDiya = (x?: number): Diya => {
            const depth = Math.random();
            return { x: x ?? -20, y: riverTop() + depth * (h - riverTop()) * 0.9, s: 0.5 + depth * 0.7, vx: 0.25 + depth * 0.6, phase: Math.random() * 6.28 };
        };
        const newLantern = (initial: boolean): Lantern => ({
            x: Math.random() * w, y: initial ? h * (0.1 + Math.random() * 0.6) : h * 0.7 + Math.random() * h * 0.2,
            s: (0.5 + Math.random() * 0.6) * (w < 640 ? 0.75 : 1), vy: 0.35 + Math.random() * 0.5, sway: 6 + Math.random() * 12, phase: Math.random() * 6.28,
        });
        const setup = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = canvas.clientWidth; h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const small = w < 640;
            diyas = Array.from({ length: small ? 9 : 18 }, () => newDiya(Math.random() * w)).sort((a, b) => a.y - b.y);
            lanterns = Array.from({ length: small ? 4 : 8 }, () => newLantern(true));
        };

        const frame = () => {
            ctx.clearRect(0, 0, w, h);
            for (const l of lanterns) {
                const x = l.x + Math.sin(t * 0.02 + l.phase) * l.sway, s = l.s * 32;
                const fade = Math.min(1, Math.max(0, l.y / (h * 0.25)));
                ctx.globalAlpha = 0.45 * fade;
                ctx.globalCompositeOperation = "lighter";
                ctx.drawImage(warm, x - s * 1.5, l.y - s * 1.5, s * 3, s * 3);
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = 0.9 * fade;
                ctx.drawImage(lantern, x - s / 2, l.y - s / 2, s, s);
            }
            for (const d of diyas) {
                const flick = 0.85 + Math.sin(t * 0.35 + d.phase) * 0.15;
                const y = d.y + Math.sin(t * 0.05 + d.phase) * 1.5 * d.s, s = d.s * 32;
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = 0.55 * flick;
                ctx.drawImage(warm, d.x - s, y - s * 1.1, s * 2, s * 2);
                ctx.globalAlpha = 0.25 * flick; // reflection streak
                ctx.drawImage(warm, d.x - s * 0.15, y + s * 0.1, s * 0.3, s * 1.2);
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = 1;
                ctx.drawImage(diya, d.x - s / 2, y - s * 0.7, s, s);
            }
            ctx.globalAlpha = 1;
        };

        const step = (now: number) => {
            raf = visible ? requestAnimationFrame(step) : 0;
            if (now - last < 33) return; // ~30fps is plenty for slow drift, and halves the work
            last = now;
            t++;
            for (let i = 0; i < diyas.length; i++) {
                diyas[i].x += diyas[i].vx;
                if (diyas[i].x > w + 30) { diyas[i] = newDiya(); diyas.sort((a, b) => a.y - b.y); }
            }
            for (let i = 0; i < lanterns.length; i++) {
                lanterns[i].y -= lanterns[i].vy;
                if (lanterns[i].y < -40) lanterns[i] = newLantern(false);
            }
            frame();
        };

        setup();
        if (still) { t = 40; frame(); }
        else raf = requestAnimationFrame(step);

        const onResize = () => { setup(); if (still) frame(); };
        window.addEventListener("resize", onResize);
        const resume = () => { if (visible && !raf && !still) raf = requestAnimationFrame(step); };
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; resume(); });
        io.observe(canvas);
        const onVis = () => { visible = !document.hidden; resume(); };
        document.addEventListener("visibilitychange", onVis);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("visibilitychange", onVis);
            io.disconnect();
        };
    }, []);

    return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
