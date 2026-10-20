"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";

// Saves the quotation (rendered with ?pdf=1) as a one-page PDF image, like the hand-made ones.
// Opened from /admin with &download=1, it starts by itself.
export default function PdfDownload({ id, auto }: { id: string; auto: boolean }) {
    const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

    const save = useCallback(async () => {
        const node = document.querySelector<HTMLElement>("[data-quote-doc]");
        if (!node) return;
        setState("busy");
        try {
            await document.fonts.ready;
            // Images below the fold are lazy — wait until every one has loaded so none come out blank.
            await Promise.all([...node.querySelectorAll("img")].filter((img) => !img.complete).map((img) => new Promise((r) => {
                img.loading = "eager";
                img.addEventListener("load", r, { once: true });
                img.addEventListener("error", r, { once: true });
                setTimeout(r, 5000);
            })));
            const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
            const w = node.scrollWidth;
            const h = node.scrollHeight;
            // Safari refuses canvases over ~16.7M pixels, so the scale shrinks for very long pages.
            const ratio = Math.min(2, Math.sqrt(16_000_000 / (w * h)));
            const img = await toJpeg(node, { quality: 0.92, pixelRatio: ratio, backgroundColor: "#070b18", filter: (n) => !(n instanceof HTMLElement && n.dataset.noPdf !== undefined) });
            const pdf = new jsPDF({ unit: "px", format: [w, h], orientation: h > w ? "portrait" : "landscape", hotfixes: ["px_scaling"] });
            pdf.addImage(img, "JPEG", 0, 0, w, h);
            pdf.save(`KashiGo-Quotation-${id}.pdf`);
            setState("done");
        } catch (e) {
            console.error("PDF export failed:", e);
            setState("error");
        }
    }, [id]);

    useEffect(() => {
        if (!auto) return;
        // Give the banner and logo a moment to paint before the snapshot.
        const t = setTimeout(save, 800);
        return () => clearTimeout(t);
    }, [auto, save]);

    return (
        <div data-no-pdf className="fixed top-4 right-4 z-50 flex items-center gap-3 print:hidden">
            {state === "done" && <span className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">PDF saved to your downloads</span>}
            {state === "error" && <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">Couldn&apos;t make the PDF — use Print → Save as PDF</span>}
            <button onClick={save} disabled={state === "busy"} className="h-12 px-6 rounded-full bg-gradient-to-r from-fire to-marigold text-night font-heading font-extrabold shadow-xl inline-flex items-center gap-2 disabled:opacity-70">
                {state === "busy" ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                {state === "busy" ? "Making PDF…" : "Download PDF"}
            </button>
        </div>
    );
}
