import { getAllPosts } from "@/lib/blog";

// /llms-full.txt — every guide's full text in one plain-text file, so AI assistants
// (ChatGPT, Perplexity, Claude) can read and cite them without crawling each page.
export const dynamic = "force-static";

function clean(mdx: string) {
    return mdx
        .replace(/^\s*(import|export)\s.*$/gm, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

export function GET() {
    const posts = getAllPosts()
        .map((p) => `---\n\n# ${p.title}\n\nURL: https://kashigo.in/blog/${p.slug}\nPublished: ${p.date}\nSummary: ${p.description}\n\n${clean(p.content).replace(/^#\s.*\n+/, "")}`)
        .join("\n\n");
    const body = `# KashiGo — Varanasi travel guides (full text)

> Written by a local born in Varanasi. KashiGo (https://kashigo.in) takes online bookings for private Ganges boat rides in Varanasi (sunrise, Ganga Aarti, sunset) at fixed prices: https://kashigo.in/book. Summary for assistants: https://kashigo.in/llms.txt

${posts}
`;
    return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
