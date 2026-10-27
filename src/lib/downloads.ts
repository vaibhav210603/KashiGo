// Server-only: download links for each paid digital product.
// Files live under an unguessable folder in /public; links are only handed out
// by /api/shop/deliver after the payment has been verified with the provider.

const DL = "/dl/e18268d7b05ea138060802fa";

type File = { label: string; url: string };

const FILES: Record<string, File[]> = {
    guide: [{ label: "Varanasi Insider Guide 2026 (PDF)", url: "/Varanasi_Travel_Guide_2026.pdf" }],
    "india-scam-proof": [
        { label: "India Scam-Proof (PDF)", url: `${DL}/India-Scam-Proof.pdf` },
        { label: "India Scam-Proof (EPUB — Kindle / Apple Books)", url: `${DL}/India-Scam-Proof.epub` },
    ],
    "kashi-unveiled": [
        { label: "Kashi Unveiled (PDF)", url: `${DL}/Kashi-Unveiled.pdf` },
        { label: "Kashi Unveiled (EPUB — Kindle / Apple Books)", url: `${DL}/Kashi-Unveiled.epub` },
    ],
    "walk-the-ghats": [
        { label: "Walk the Ghats — one-file audiobook with chapters (M4B, 27 MB · best on phones)", url: `${DL}/Walk-the-Ghats-Audio-Tour.m4b` },
        { label: "Walk the Ghats — 20 MP3 tracks + listening guide (ZIP, 53 MB)", url: `${DL}/Walk-the-Ghats-Audio-Tour.zip` },
        { label: "Walk the Ghats — route card & script (PDF)", url: `${DL}/Walk-the-Ghats-Companion.pdf` },
    ],
    "scam-proof-audiobook": [
        { label: "India Scam-Proof Audiobook — one file with chapters (M4B, 47 MB · best on phones)", url: `${DL}/India-Scam-Proof-Audiobook.m4b` },
        { label: "India Scam-Proof Audiobook — 17 MP3 chapters + listening guide (ZIP, 75 MB)", url: `${DL}/India-Scam-Proof-Audiobook.zip` },
        { label: "India Scam-Proof — listener's quick reference: scripts, prices, numbers (PDF)", url: `${DL}/India-Scam-Proof-Quick-Reference.pdf` },
    ],
};

FILES["guide-trivia"] = FILES.guide;

FILES["complete-bundle"] = [
    ...FILES.guide,
    ...FILES["india-scam-proof"],
    ...FILES["kashi-unveiled"],
    ...FILES["walk-the-ghats"],
    // The bundle already has the full ebook, so the audiobook's quick-reference extract is left out.
    ...FILES["scam-proof-audiobook"].filter((f) => !f.url.endsWith("Quick-Reference.pdf")),
];

export function getDownloads(product: string, origin = "https://kashigo.in"): File[] | null {
    const f = FILES[product];
    return f ? f.map((x) => ({ label: x.label, url: origin + x.url })) : null;
}
