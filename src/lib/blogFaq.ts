// Pull question-style H2/H3 headings and the paragraph under them out of a post,
// so blog pages can emit FAQPage schema that AI answer engines and Google can quote.
export type Faq = { q: string; a: string };

function plain(md: string) {
    return md
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[*_`>#]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function extractFaqs(content: string, max = 8): Faq[] {
    const faqs: Faq[] = [];
    const lines = content.split("\n");
    for (let i = 0; i < lines.length && faqs.length < max; i++) {
        const m = lines[i].match(/^#{2,3}\s+(.+\?)\s*$/);
        if (!m) continue;
        const para: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
            const l = lines[j];
            if (/^#{1,6}\s/.test(l)) break;
            if (!l.trim()) { if (para.length) break; continue; }
            if (/^\s*(\||<|import |export )/.test(l)) { if (para.length) break; continue; }
            para.push(l.replace(/^\s*[-*]\s+/, ""));
        }
        const a = plain(para.join(" "));
        if (a.length >= 40) faqs.push({ q: plain(m[1]), a: a.length > 600 ? a.slice(0, 597).replace(/\s\S*$/, "") + "…" : a });
    }
    return faqs;
}
