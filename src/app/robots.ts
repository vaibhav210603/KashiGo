import { MetadataRoute } from "next";

// AI assistants (ChatGPT search, Perplexity, Claude, Gemini) are explicitly welcome:
// they're how many travellers now find "book a boat ride in Varanasi".
const AI_CRAWLERS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // /_next/ must stay crawlable — Google needs the CSS/JS to render pages.
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/dl/"] },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: ["/api/", "/dl/"] },
    ],
    sitemap: "https://kashigo.in/sitemap.xml",
    host: "https://kashigo.in",
  };
}
