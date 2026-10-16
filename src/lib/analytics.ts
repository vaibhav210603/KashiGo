// Thin wrapper around GA4's gtag so call sites never crash when GA is blocked.
type Params = Record<string, string | number | boolean | undefined>;
type Gtag = (...args: unknown[]) => void;

export function gtag(...args: unknown[]) {
    try { (window as unknown as { gtag?: Gtag }).gtag?.(...args); } catch { }
}

export function track(event: string, params: Params = {}) {
    gtag("event", event, params);
}

// Referrer hosts of AI assistants / answer engines. GA lumps these into
// "Referral" by default; tagging them lets us report "traffic from ChatGPT".
const AI_SOURCES: [RegExp, string][] = [
    [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "chatgpt"],
    [/(^|\.)perplexity\.ai$/, "perplexity"],
    [/(^|\.)claude\.ai$/, "claude"],
    [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, "gemini"],
    [/(^|\.)copilot\.microsoft\.com$|(^|\.)bing\.com$/, "copilot"],
    [/(^|\.)you\.com$/, "you"],
    [/(^|\.)meta\.ai$/, "meta_ai"],
    [/(^|\.)deepseek\.com$/, "deepseek"],
    [/(^|\.)grok\.com$|(^|\.)x\.ai$/, "grok"],
];

export function detectAiSource(referrer: string, utmSource: string | null): string | null {
    const candidates: string[] = [];
    if (utmSource) candidates.push(utmSource.toLowerCase());
    try { if (referrer) candidates.push(new URL(referrer).hostname.toLowerCase()); } catch { }
    for (const c of candidates) {
        for (const [re, name] of AI_SOURCES) if (re.test(c)) return name;
    }
    return null;
}
