// Submit every URL in the live sitemap to IndexNow (Bing, Yandex, Seznam, Naver).
// Bing's index powers ChatGPT search and Copilot, so this gets new/changed pages
// in front of them within hours instead of waiting for a crawl.
// Usage: node scripts/indexnow.mjs [url ...]   (no args = whole sitemap)
const HOST = "kashigo.in";
const KEY = "50ed41806833459c3c260d172348841f"; // must match public/<KEY>.txt

async function sitemapUrls() {
    const xml = await fetch(`https://${HOST}/sitemap.xml`).then((r) => r.text());
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const urls = process.argv.length > 2 ? process.argv.slice(2) : await sitemapUrls();
if (!urls.length) { console.error("No URLs to submit"); process.exit(1); }

const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: submitted ${urls.length} URLs → HTTP ${res.status}`);
// 200 = accepted, 202 = accepted pending key check. 403 = key file not live yet.
if (res.status >= 300) { console.error(await res.text()); process.exit(1); }
