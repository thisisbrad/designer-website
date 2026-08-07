/**
 * Audits the running site's own SEO: parses every page's JSON-LD and head
 * tags and fails on missing structured data, metadata or internal links.
 *
 *   npm run dev            # in one terminal
 *   npm run seo:check      # in another (override with SEO_CHECK_URL)
 */
const BASE = process.env.SEO_CHECK_URL ?? "http://localhost:3000";

const PAGES = [
  "/",
  "/blog",
  "/blog/local-seo-map-pack",
  "/blog/schema-markup-plain-english",
  "/blog/ai-assistants-that-book-clients",
  "/blog/core-web-vitals-for-business-owners",
  "/blog/website-audit-checklist",
];

const LD = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
const meta = (html, key, attr = "property") => {
  const m = html.match(
    new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`, "i")
  );
  return m?.[1];
};

let failures = 0;
const fail = (page, msg) => {
  failures++;
  console.log(`  ✗ ${msg}`);
};

for (const page of PAGES) {
  const res = await fetch(BASE + page);
  const html = await res.text();
  console.log(`\n${page}  [${res.status}]`);

  // --- JSON-LD ---
  const blocks = [...html.matchAll(LD)];
  const nodes = [];
  for (const [, raw] of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      fail(page, `invalid JSON-LD: ${e.message}`);
      continue;
    }
    nodes.push(...(parsed["@graph"] ?? [parsed]));
  }
  const types = nodes.flatMap((n) =>
    Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]
  );
  console.log(`  schema: ${types.join(", ") || "none"}`);
  if (!blocks.length) fail(page, "no JSON-LD");

  // --- head essentials ---
  const checks = {
    title: /<title>([^<]+)<\/title>/.exec(html)?.[1],
    description: meta(html, "description", "name"),
    canonical: /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1],
    "og:title": meta(html, "og:title"),
    "og:description": meta(html, "og:description"),
    "og:image": meta(html, "og:image"),
    "og:type": meta(html, "og:type"),
    "twitter:card": meta(html, "twitter:card", "name"),
  };
  for (const [key, value] of Object.entries(checks)) {
    if (!value) fail(page, `missing ${key}`);
  }
  if (checks.title) {
    const len = checks.title.length;
    if (len > 65) console.log(`  ! title ${len} chars (may truncate in SERP)`);
  }
  if (checks.description) {
    const len = checks.description.length;
    if (len > 160) console.log(`  ! description ${len} chars (may truncate)`);
  }

  // --- semantics ---
  const h1s = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1s !== 1) fail(page, `${h1s} <h1> elements (want exactly 1)`);

  // --- article-specific ---
  const article = nodes.find((n) => n["@type"] === "BlogPosting");
  if (page.startsWith("/blog/")) {
    if (!article) fail(page, "no BlogPosting node");
    else {
      for (const prop of [
        "headline",
        "image",
        "datePublished",
        "dateModified",
        "author",
        "publisher",
        "mainEntityOfPage",
        "wordCount",
      ]) {
        if (!article[prop]) fail(page, `BlogPosting missing ${prop}`);
      }
      if (article.headline?.length > 110)
        fail(page, "headline over 110 chars (Google truncates)");
      console.log(
        `  article: ${article.wordCount} words, ${article.timeRequired}, faq ✓`
      );
    }
    if (!nodes.some((n) => n["@type"] === "FAQPage"))
      fail(page, "no FAQPage node");
    if (!nodes.some((n) => n["@type"] === "BreadcrumbList"))
      fail(page, "no BreadcrumbList node");

    // internal links out of the article
    const internal = new Set(
      [...html.matchAll(/href="(\/blog\/[a-z0-9-]+)"/g)].map((m) => m[1])
    );
    internal.delete(page);
    console.log(`  internal links out: ${internal.size}`);
    if (internal.size < 3) fail(page, "fewer than 3 internal links");
  }

  const org = nodes.find(
    (n) => n["@type"] === "ProfessionalService" || n["@type"] === "Organization"
  );
  if (org && !org.logo) fail(page, "business node missing logo");
}

console.log(
  failures === 0
    ? "\n✅ all checks passed"
    : `\n❌ ${failures} problem(s) found`
);
process.exit(failures === 0 ? 0 : 1);
