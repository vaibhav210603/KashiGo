// SEO health check for the live site. Run by .github/workflows/seo-monitor.yml on a
// schedule; exits non-zero (so GitHub emails you) when anything that hurts ranking or
// AI-assistant visibility breaks. Usage: node scripts/seo-check.mjs [baseUrl]
const BASE = (process.argv[2] || "https://kashigo.in").replace(/\/$/, "");
const AI_BOTS = ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended", "Bingbot"];
const SLOW_MS = 3000;

const errors = [];
const warnings = [];
const fail = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

async function get(url, opts = {}) {
    const t = Date.now();
    try {
        const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(20000), ...opts });
        const body = opts.method === "HEAD" ? "" : await res.text();
        return { status: res.status, body, ms: Date.now() - t, headers: res.headers };
    } catch (e) {
        return { status: 0, body: "", ms: Date.now() - t, error: String(e) };
    }
}

const meta = (html, re) => html.match(re)?.[1]?.trim();

function checkPage(url, html) {
    const title = meta(html, /<title[^>]*>([^<]*)<\/title>/i);
    const desc = meta(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i);
    const canonical = meta(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i);
    const h1s = (html.match(/<h1[\s>]/gi) || []).length;

    if (!title) fail(`${url}: missing <title>`);
    else if (title.length > 70) warn(`${url}: title is ${title.length} chars (Google truncates ~60)`);
    if (!desc) fail(`${url}: missing meta description`);
    else if (desc.length < 70 || desc.length > 170) warn(`${url}: meta description is ${desc.length} chars (aim 120–160)`);
    if (!canonical) warn(`${url}: no canonical link`);
    else if (canonical.replace(/\/$/, "") !== url.replace(/\/$/, "").replace(BASE, "https://kashigo.in")) warn(`${url}: canonical points to ${canonical}`);
    if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html)) fail(`${url}: page is NOINDEX`);
    if (h1s === 0) warn(`${url}: no <h1>`);
    if (!/property="og:image"/.test(html)) warn(`${url}: no og:image`);

    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
        try { JSON.parse(m[1]); } catch { fail(`${url}: invalid JSON-LD`); }
    }
    return [...html.matchAll(/href="(\/[^"#?]*)/g)].map((m) => m[1]).filter((p) => !p.startsWith("/_next") && !p.startsWith("/dl/"));
}

// 1. robots.txt must allow search + AI crawlers and point at the sitemap.
const robots = await get(`${BASE}/robots.txt`);
if (robots.status !== 200) fail(`robots.txt → HTTP ${robots.status}`);
else {
    if (!/Sitemap:/i.test(robots.body)) fail("robots.txt has no Sitemap line");
    for (const bot of AI_BOTS) if (!robots.body.includes(bot)) warn(`robots.txt doesn't mention ${bot}`);
    if (/User-Agent:\s*\*\s*\nDisallow:\s*\/\s*$/im.test(robots.body)) fail("robots.txt blocks everything");
}

// 2. AI-assistant text files.
for (const path of ["/llms.txt", "/llms-full.txt"]) {
    const r = await get(`${BASE}${path}`);
    if (r.status !== 200 || r.body.length < 500) fail(`${path} → HTTP ${r.status}, ${r.body.length} bytes`);
}

// 3. Every sitemap URL: 200, fast, with sane metadata.
const sm = await get(`${BASE}/sitemap.xml`);
const urls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim().replace("https://kashigo.in", BASE));
if (sm.status !== 200 || urls.length < 5) fail(`sitemap.xml → HTTP ${sm.status}, ${urls.length} URLs`);

const internal = new Set();
for (const url of urls) {
    const r = await get(url);
    if (r.status !== 200) { fail(`${url} → HTTP ${r.status}${r.error ? " " + r.error : ""}`); continue; }
    if (r.ms > SLOW_MS) warn(`${url}: slow response ${r.ms}ms`);
    checkPage(url, r.body).forEach((p) => internal.add(p));
}

// 4. Broken internal links found on those pages.
const known = new Set(urls.map((u) => new URL(u).pathname.replace(/\/$/, "") || "/"));
for (const p of internal) {
    const path = p.replace(/\/$/, "") || "/";
    if (known.has(path) || /\.(png|jpe?g|svg|gif|mp4|pdf|ico|webp|txt|xml|webmanifest)$/i.test(path)) continue;
    known.add(path);
    const r = await get(`${BASE}${path}`, { method: "HEAD" });
    if (r.status >= 400 || r.status === 0) fail(`broken internal link ${path} → HTTP ${r.status}`);
}

// 5. Key conversion page must render the booking flow, not an error.
const book = await get(`${BASE}/book`);
if (!/TouristTrip/.test(book.body)) warn("/book is missing its TouristTrip schema");

console.log(`Checked ${urls.length} sitemap URLs + ${known.size - urls.length} extra internal links on ${BASE}`);
warnings.forEach((w) => console.log(`WARN  ${w}`));
errors.forEach((e) => console.log(`ERROR ${e}`));
if (process.env.GITHUB_STEP_SUMMARY) {
    const fs = await import("node:fs");
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
        `## SEO check: ${errors.length} errors, ${warnings.length} warnings\n\n` +
        [...errors.map((e) => `- ❌ ${e}`), ...warnings.map((w) => `- ⚠️ ${w}`)].join("\n") + "\n");
}
process.exit(errors.length ? 1 : 0);
