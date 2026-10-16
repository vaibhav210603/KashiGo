import { getAllPosts } from "@/lib/blog";

// RSS feed — lets Feedly/aggregators and search engines pick up new guides as they publish.
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
    const items = getAllPosts().map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>https://kashigo.in/blog/${p.slug}</link>
      <guid isPermaLink="true">https://kashigo.in/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KashiGo — Varanasi Travel Guides</title>
    <link>https://kashigo.in/blog</link>
    <atom:link href="https://kashigo.in/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Scam-free Varanasi and India travel guides for foreigners, written by a local born in Varanasi.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
    return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
