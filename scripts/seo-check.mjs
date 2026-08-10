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
  "/about",
  "/contact",
  "/services",
  "/services/web-design",
  "/services/frontend-development",
  "/services/ui-ux-design",
  "/services/seo-marketing",
  "/services/ai-solutions",
  "/services/analytics-cro",
  "/services/web-design/orlando",
  "/services/seo-marketing/orlando",
  "/services/ai-solutions/orlando",
  "/services/web-design/melbourne",
  "/services/seo-marketing/melbourne",
  "/services/ai-solutions/melbourne",
  "/services/web-design/lake-mary",
  "/services/seo-marketing/lake-mary",
  "/services/ai-solutions/lake-mary",
  "/services/web-design/lakeland",
  "/services/seo-marketing/lakeland",
  "/services/ai-solutions/lakeland",
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

  // --- location pages: /services/<service>/<city> ---
  const isLocation = /^\/services\/[a-z0-9-]+\/[a-z0-9-]+$/.test(page);
  if (isLocation) {
    const service = nodes.find((n) => n["@type"] === "Service");
    if (!service) fail(page, "no Service node");
    else {
      const areas = [].concat(service.areaServed ?? []);
      if (!areas.some((a) => a["@type"] === "City"))
        fail(page, "areaServed missing City");
      if (!areas.some((a) => a["@type"] === "GeoCircle"))
        fail(page, "areaServed missing GeoCircle");
      if (!service.isSimilarTo)
        fail(page, "no isSimilarTo link to the parent service");
      console.log(`  areaServed: ${areas.length} nodes`);
    }
    if (!nodes.some((n) => n["@type"] === "FAQPage"))
      fail(page, "no FAQPage node");

    const crumbs = nodes.find((n) => n["@type"] === "BreadcrumbList");
    if (crumbs?.itemListElement?.length !== 4)
      fail(page, "breadcrumb trail should be Home / Services / Service / City");

    // must link up to its parent service and out to siblings + the blog
    const parent = page.split("/").slice(0, 3).join("/");
    const html_links = new Set(
      [...html.matchAll(/href="(\/services\/[a-z0-9-]+(?:\/[a-z0-9-]+)?)"/g)].map(
        (m) => m[1]
      )
    );
    if (!html_links.has(parent)) fail(page, `no link up to ${parent}`);
    const cluster = new Set(
      [...html.matchAll(/href="(\/blog\/[a-z0-9-]+)"/g)].map((m) => m[1])
    );
    console.log(
      `  internal links out: ${html_links.size} services, ${cluster.size} posts`
    );
    if (cluster.size < 1) fail(page, "no links into the blog cluster");

    // thin-content guard: local pages must say something local
    const words = html
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    console.log(`  ~${words} words`);
    if (words < 700) fail(page, "under 700 words — reads as a doorway page");
  }

  // --- service-specific ---
  if (page.startsWith("/services/") && !isLocation) {
    const service = nodes.find((n) => n["@type"] === "Service");
    if (!service) fail(page, "no Service node");
    else {
      for (const prop of [
        "name",
        "description",
        "provider",
        "areaServed",
        "offers",
        "hasOfferCatalog",
      ]) {
        if (!service[prop]) fail(page, `Service missing ${prop}`);
      }
      console.log(
        `  service: ${service.hasOfferCatalog?.itemListElement?.length ?? 0} deliverables, from $${service.offers?.price}`
      );
    }
    if (!nodes.some((n) => n["@type"] === "FAQPage"))
      fail(page, "no FAQPage node");
    if (!nodes.some((n) => n["@type"] === "BreadcrumbList"))
      fail(page, "no BreadcrumbList node");

    // links out to sibling services and the supporting blog cluster
    const siblings = new Set(
      [...html.matchAll(/href="(\/services\/[a-z0-9-]+)"/g)].map((m) => m[1])
    );
    siblings.delete(page);
    const cluster = new Set(
      [...html.matchAll(/href="(\/blog\/[a-z0-9-]+)"/g)].map((m) => m[1])
    );
    console.log(
      `  internal links out: ${siblings.size} services, ${cluster.size} posts`
    );
    if (siblings.size < 3) fail(page, "fewer than 3 sibling service links");
    if (cluster.size < 1) fail(page, "no links into the blog cluster");
  }

  // --- entity pages: these carry the E-E-A-T signals ---
  if (page === "/about") {
    const about = nodes.find((n) => n["@type"] === "AboutPage");
    if (!about) fail(page, "no AboutPage node");
    else if (!about.mainEntity) fail(page, "AboutPage missing mainEntity");
    const person = nodes.find((n) => n["@type"] === "Person");
    if (!person) fail(page, "no Person node");
    else {
      for (const prop of ["name", "jobTitle", "image", "knowsAbout"]) {
        if (!person[prop]) fail(page, `Person missing ${prop}`);
      }
      console.log(`  person: ${person.knowsAbout?.length ?? 0} topics`);
    }
  }

  if (page === "/contact") {
    const contact = nodes.find((n) => n["@type"] === "ContactPage");
    if (!contact) fail(page, "no ContactPage node");
    else if (contact.mainEntity?.["@type"] !== "ContactPoint")
      fail(page, "ContactPage missing a ContactPoint");
    else if (!contact.mainEntity.email)
      fail(page, "ContactPoint missing email");
    if (!nodes.some((n) => n["@type"] === "FAQPage"))
      fail(page, "no FAQPage node");
    if (!/<form[\s>]/.test(html)) fail(page, "no contact form rendered");
  }

  if (page === "/about" || page === "/contact") {
    if (!nodes.some((n) => n["@type"] === "BreadcrumbList"))
      fail(page, "no BreadcrumbList node");
    const out = new Set(
      [...html.matchAll(/href="(\/services\/[a-z0-9-]+)"/g)].map((m) => m[1])
    );
    console.log(`  internal links out: ${out.size} services`);
    if (out.size < 3) fail(page, "fewer than 3 service links");
  }

  if (page === "/services") {
    const list = nodes.find((n) => n["@type"] === "CollectionPage")?.mainEntity;
    if (!list?.itemListElement?.length) fail(page, "no ItemList of services");
    else console.log(`  hub: ${list.itemListElement.length} services listed`);
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
