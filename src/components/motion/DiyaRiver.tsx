"use client";

import { useEffect, useRef } from "react";

// Dev Deepawali night, drawn over the hero photo: diyas floating down the river with their reflections,
// sky lanterns rising past the moon, and stars. Canvas; pauses offscreen / when hidden; one still frame
// for reduced motion.
type Diya = { x: number; y: number; s: number; vx: number; phase: number };
type Lantern = { x: number; y: number; s: number; vy: number; sway: number; phase: number; hue: number };
type Star = { x: number; y: number; r: number; phase: number };

export default function DiyaRiver({ className = "" }: { className?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let w = 0, h = 0, raf = 0, visible = true, t = 0;
        let diyas: Diya[] = [], lanterns: Lantern[] = [], stars: Star[] = [];
        // The river is the bottom ~38% of the frame; diyas further down are nearer, so bigger and faster.
        const riverTop = () => h * 0.62;
        const newDiya = (x?: number): Diya => {
            const depth = Math.random();
            return { x: x ?? -20, y: riverTop() + depth * (h - riverTop()) * 0.92, s: 0.55 + depth * 1.1, vx: 0.12 + depth * 0.35, phase: Math.random() * 6.28 };
        };
        const newLantern = (initial: boolean): Lantern => ({
            x: Math.random() * w, y: initial ? h * (0.15 + Math.random() * 0.7) : h * 0.75 + Math.random() * h * 0.2,
            s: (0.6 + Math.random() * 0.9) * (w < 640 ? 0.6 : 1), vy: 0.18 + Math.random() * 0.3, sway: 8 + Math.random() * 16, phase: Math.random() * 6.28, hue: 18 + Math.random() * 24,
        });
        const setup = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth; h = canvas.clientHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const small = w < 640;
            diyas = Array.from({ length: small ? 12 : 24 }, () => newDiya(Math.random() * w));
            lanterns = Array.from({ length: small ? 5 : 10 }, () => newLantern(true));
            stars = Array.from({ length: small ? 40 : 90 }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.45, r: 0.4 + Math.random() * 1.1, phase: Math.random() * 6.28 }));
        };

        const glow = (x: number, y: number, r: number, color: string, a: number) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, color.replace("A", String(a)));
            g.addColorStop(1, color.replace("A", "0"));
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
        };

        const drawDiya = (d: Diya) => {
            const flick = 0.8 + Math.sin(t * 0.21 + d.phase) * 0.12 + Math.sin(t * 0.57 + d.phase * 2) * 0.08;
            const bob = Math.sin(t * 0.03 + d.phase) * 1.4 * d.s;
            const x = d.x, y = d.y + bob, s = d.s;
            // Reflection: a soft streak of light on the water below the lamp.
            ctx.globalCompositeOperation = "lighter";
            const rg = ctx.createLinearGradient(x, y, x, y + 34 * s);
            rg.addColorStop(0, `rgba(255,170,60,${0.35 * flick})`);
            rg.addColorStop(1, "rgba(255,140,40,0)");
            ctx.fillStyle = rg;
            ctx.fillRect(x - 2.2 * s, y + 2 * s, 4.4 * s, 34 * s);
            glow(x, y - 4 * s, 26 * s * flick, "rgba(255,150,40,A)", 0.45);
            // Clay lamp
            ctx.globalCompositeOperation = "source-over";
            ctx.fillStyle = "#6b2d12";
            ctx.beginPath(); ctx.ellipse(x, y, 7 * s, 2.6 * s, 0, 0, Math.PI); ctx.fill();
            ctx.fillStyle = "#c2541f";
            ctx.beginPath(); ctx.ellipse(x, y, 7 * s, 1.4 * s, 0, 0, 6.283); ctx.fill();
            // Flame
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = `rgba(255,214,120,${0.95 * flick})`;
            ctx.beginPath();
            ctx.moveTo(x - 1.8 * s, y - 1 * s);
            ctx.quadraticCurveTo(x, y - 11 * s * flick, x + 1.8 * s, y - 1 * s);
            ctx.closePath(); ctx.fill();
        };

        const drawLantern = (l: Lantern) => {
            const x = l.x + Math.sin(t * 0.012 + l.phase) * l.sway, y = l.y, s = l.s;
            const fade = Math.min(1, Math.max(0, (y - h * 0.02) / (h * 0.25)));
            const flick = 0.85 + Math.sin(t * 0.15 + l.phase) * 0.15;
            ctx.globalCompositeOperation = "lighter";
            glow(x, y, 34 * s, `hsla(${l.hue},100%,58%,A)`, 0.35 * fade * flick);
            ctx.globalCompositeOperation = "source-over";
            const bw = 9 * s, bh = 13 * s;
            const g = ctx.createLinearGradient(x, y - bh, x, y + bh);
            g.addColorStop(0, `hsla(${l.hue},95%,60%,${0.85 * fade})`);
            g.addColorStop(1, `hsla(${l.hue + 12},100%,78%,${0.95 * fade * flick})`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(x - bw * 0.8, y - bh); ctx.lineTo(x + bw * 0.8, y - bh);
            ctx.quadraticCurveTo(x + bw * 1.15, y, x + bw * 0.6, y + bh);
            ctx.lineTo(x - bw * 0.6, y + bh);
            ctx.quadraticCurveTo(x - bw * 1.15, y, x - bw * 0.8, y - bh);
            ctx.fill();
        };

        const frame = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = "lighter";
            for (const st of stars) {
                const a = 0.25 + (Math.sin(t * 0.02 + st.phase) + 1) * 0.3;
                ctx.fillStyle = `rgba(255,240,215,${a})`;
                ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill();
            }
            for (const l of lanterns) drawLantern(l);
            // Water shimmer: thin bands of moonlight sliding across the river.
            ctx.globalCompositeOperation = "lighter";
            for (let i = 0; i < 9; i++) {
                const y = riverTop() + ((i * 47 + t * 0.15) % (h - riverTop()));
                const x = ((i * 211 + t * (0.3 + i * 0.05)) % (w + 300)) - 150;
                ctx.fillStyle = "rgba(255,225,170,0.05)";
                ctx.fillRect(x, y, 120 + i * 14, 1.2);
            }
            [...diyas].sort((a, b) => a.y - b.y).forEach(drawDiya);
        };

        const step = () => {
            t++;
            for (let i = 0; i < diyas.length; i++) {
                diyas[i].x += diyas[i].vx;
                if (diyas[i].x > w + 30) diyas[i] = newDiya();
            }
            for (let i = 0; i < lanterns.length; i++) {
                lanterns[i].y -= lanterns[i].vy;
                if (lanterns[i].y < -40) lanterns[i] = newLantern(false);
            }
            frame();
            raf = visible ? requestAnimationFrame(step) : 0;
        };

        setup();
        if (still) { t = 40; frame(); }
        else raf = requestAnimationFrame(step);

        const onResize = () => { setup(); if (still) frame(); };
        window.addEventListener("resize", onResize);
        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting && !document.hidden;
            if (visible && !raf && !still) raf = requestAnimationFrame(step);
        });
        io.observe(canvas);
        const onVis = () => { visible = !document.hidden; if (visible && !raf && !still) raf = requestAnimationFrame(step); };
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
