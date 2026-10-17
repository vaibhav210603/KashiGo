// Phone numbers are the key of a customer's profile, so every one is stored the same way: E.164 ("+919876543210").
// Safe to import from client and server code.

// Best effort: "+44 7700 900123" stays as it is; a bare 10-digit Indian mobile ("98765 43210", "098765 43210")
// gets +91; "0091…" / "91…" with 12 digits is treated as already having the country code.
export function normalizePhone(raw: string | null | undefined): string | null {
    const s = String(raw ?? "").trim();
    if (!s) return null;
    let digits = s.replace(/\D/g, "");
    if (s.startsWith("+")) return valid(`+${digits}`);
    if (digits.startsWith("00")) return valid(`+${digits.slice(2)}`);
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10 && /^[6-9]/.test(digits)) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    return valid(`+${digits}`);
}

const valid = (p: string) => (/^\+[1-9]\d{6,14}$/.test(p) ? p : null);

// "+919876543210" → "+91 98765 43210" for display; other countries just get a space after the code.
export function formatPhone(p: string | null | undefined): string {
    if (!p) return "";
    if (p.startsWith("+91") && p.length === 13) return `+91 ${p.slice(3, 8)} ${p.slice(8)}`;
    return p;
}
