"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; r: number; vy: number; vx: number; life: number; max: number; hue: number; phase: number };

// Sparks drifting up off the aarti lamps. Canvas, ~60 particles, pauses offscreen / when hidden.
export default function Embers({ density = 1, className = "" }: { density?: number; className?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
        const ps: P[] = [];
        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth; h = canvas.clientHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        const spawn = (initial = false): P => {
            const max = 260 + Math.random() * 380;
            return {
                x: Math.random() * w,
                y: initial ? Math.random() * h : h + 10,
                r: 0.6 + Math.random() * 2.1,
                vy: 0.25 + Math.random() * 0.75,
                vx: (Math.random() - 0.5) * 0.25,
                life: initial ? Math.random() * max : 0,
                max,
                hue: 22 + Math.random() * 22,
                phase: Math.random() * Math.PI * 2,
            };
        };
        resize();
        const count = Math.round(Math.min(70, (w * h) / 16000) * density);
        for (let i = 0; i < count; i++) ps.push(spawn(true));

        const tick = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = "lighter";
            for (let i = 0; i < ps.length; i++) {
                const p = ps[i];
                p.life++;
                p.y -= p.vy;
                p.x += p.vx + Math.sin((p.life + p.phase * 60) / 40) * 0.25;
                const t = p.life / p.max;
                if (t >= 1 || p.y < -10) { ps[i] = spawn(); continue; }
                const a = Math.sin(t * Math.PI) * 0.9;
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
                g.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${a})`);
                g.addColorStop(0.35, `hsla(${p.hue}, 100%, 55%, ${a * 0.35})`);
                g.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
                ctx.fill();
            }
            raf = requestAnimationFrame(tick);
        };
        const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick); };
        const stop = () => { cancelAnimationFrame(raf); raf = 0; };

        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); else stop(); });
        io.observe(canvas);
        const onVis = () => (document.hidden ? stop() : start());
        document.addEventListener("visibilitychange", onVis);
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        start();
        return () => { stop(); io.disconnect(); ro.disconnect(); document.removeEventListener("visibilitychange", onVis); };
    }, [density]);

    return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
