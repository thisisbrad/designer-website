/**
 * Server-side handling of the attribution blob that rides along with a form
 * submission.
 *
 * This arrives from the browser, so it is untrusted input on a public endpoint:
 * anything stored or emailed from it has to be bounded in key count, key shape
 * and value length, or the lead log becomes a place to inject arbitrary text.
 * The whitelist below is deliberately narrow — unknown keys are dropped rather
 * than sanitised, because there is no legitimate sender of them.
 */

/** The fields attributionPayload() can produce, without the first_/last_ prefix. */
const TOUCH_FIELDS = [
  "source",
  "medium",
  "campaign",
  "term",
  "content",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "referrer",
  "landing_page",
  "at",
] as const;

const ALLOWED_KEYS = new Set(
  (["first", "last"] as const).flatMap((prefix) =>
    TOUCH_FIELDS.map((field) => `${prefix}_${field}`)
  )
);

const MAX_VALUE_LENGTH = 300;

export type LeadAttribution = Record<string, string>;

/** Pull a safe, whitelisted attribution object out of an untrusted request body. */
export function parseAttribution(body: unknown): LeadAttribution {
  if (typeof body !== "object" || body === null) return {};

  const raw = (body as Record<string, unknown>).attribution;
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return {};

  const out: LeadAttribution = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (typeof value !== "string") continue;

    // Strip control characters so a value cannot forge new lines in the
    // notification email or break a JSONL record.
    const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
    if (clean) out[key] = clean.slice(0, MAX_VALUE_LENGTH);
  }
  return out;
}

/**
 * Render attribution as plain-text lines for the notification email.
 * Returns an empty array for a direct, untagged visit, so the email stays
 * short when there is nothing interesting to say.
 */
export function formatAttribution(attribution: LeadAttribution): string[] {
  const describe = (prefix: "first" | "last", label: string) => {
    const get = (field: string) => attribution[`${prefix}_${field}`];

    const source = get("source");
    const medium = get("medium");
    if (!source && !medium) return null;

    const parts = [`${label}: ${source ?? "?"} / ${medium ?? "?"}`];

    const campaign = get("campaign");
    if (campaign) parts.push(`campaign "${campaign}"`);

    const term = get("term");
    if (term) parts.push(`term "${term}"`);

    const clickId = get("gclid") ?? get("gbraid") ?? get("wbraid") ?? get("msclkid");
    if (clickId) parts.push(`click id ${clickId}`);

    const landing = get("landing_page");
    if (landing) parts.push(`landed on ${landing}`);

    return parts.join(" · ");
  };

  const lines = [
    describe("first", "First touch"),
    describe("last", "This visit"),
  ].filter((line): line is string => line !== null);

  if (!lines.length) return [];
  return ["", "— How they found you —", ...lines];
}
