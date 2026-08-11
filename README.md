# beltowski.studio

One-page portfolio and lead-generation site for Brad Beltowski — web design,
SEO marketing and AI solutions for businesses. Next.js App Router, TypeScript,
Tailwind CSS, GSAP and React Three Fiber.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run seo:check  # audits the running site (see SEO below)
```

## SEO

Everything below is generated from one source of truth — `src/data/posts.ts`
and `src/lib/site.ts` — so metadata, schema, the sitemap and the feed can't
drift apart.

### Structured data

A single JSON-LD entity graph, keyed by `@id` so nodes reference each other
instead of repeating themselves:

| Node                  | Where          | Purpose                                                 |
| --------------------- | -------------- | ------------------------------------------------------- |
| `ProfessionalService` | every page     | The business: logo, address, `areaServed`, service catalog — the local-search entity. |
| `Person`              | every page     | Brad as author/founder, linked from every article.       |
| `WebSite`             | every page     | Ties the pages into one site entity.                     |
| `CollectionPage`+`Blog` | `/blog`      | Wraps an `ItemList` of every post in publish order.      |
| `BlogPosting`         | each post      | `headline`, `image`, `datePublished`/`dateModified`, `wordCount`, `timeRequired`, `speakable`. |
| `BreadcrumbList`      | blog pages     | Powers breadcrumb display in results.                    |
| `FAQPage`             | each post      | Every post carries genuine Q&As, also read by AI answers. |

Validate changes with Google's Rich Results Test and the schema.org
validator; `npm run seo:check` catches missing nodes before you get there.

### On-page

- **Distinct meta vs on-page text.** `metaTitle` (short, keyword-first) and
  `metaDescription` (≤155 chars) drive the SERP snippet; the longer `title`
  and `description` are the on-page headline and standfirst. Titles get
  `%s — Beltowski®` appended by the layout template.
- **Semantic HTML** — one `h1`, `h2`-per-section with slugified anchor IDs,
  real `article`/`section`/`nav`/`aside`/`time` elements, `dl` for FAQs.
- **Key takeaways** block at the top of each post, marked `data-speakable`
  and targeted by the `speakable` schema — written to be snippet-liftable.
- **Table of contents** — sticky sidebar on large screens, `<details>` on
  mobile, both linking to the same heading anchors.
- **E-E-A-T signals** — author byline, portrait, credentials box, published
  and updated dates on every post.

### Internal linking

The posts form a deliberate hub-and-spoke cluster rather than a flat list:

- `website-audit-checklist` is the **hub** — its checklist points link out to
  the deep dive for each topic.
- The other four are **spokes**: each links back to the hub, plus one or two
  siblings, from inside the body copy where the reference is genuinely
  useful (`[label](/blog/slug)` syntax, rendered by `components/RichText`).
- Every post also carries three `related` posts and prev/next navigation, so
  no article is more than one click from the rest of the cluster.

The checker fails the build-adjacent audit if any post drops below three
outbound internal links.

### Open Graph & social

`opengraph-image.tsx` routes generate real 1200×630 PNGs at build time via
`next/og` — one per post (title, category and read time on the brand
background), plus cards for `/blog` and the homepage. Twitter falls back to
the same images with `summary_large_image`. No external font fetch, so
builds work offline.

### Discovery

- `sitemap.xml` — all routes with `lastModified` from post dates.
- `robots.txt` — allows everything except `/api/`, points at the sitemap.
- `feed.xml` — static RSS 2.0 feed, linked from `<head>` and the blog index.
- `icon.png` / `apple-icon.png` / `logo.png` — generated from the wordmark;
  `logo.png` is the `ImageObject` in the publisher schema.

### Adding a post

Append an entry to `posts` in `src/data/posts.ts`. Everything else — routing,
metadata, JSON-LD, OG image, sitemap entry, feed item, related links — is
derived. Fill in `related` on the new post *and* add its slug to the posts it
should be reachable from, so the cluster stays two-way. Then:

```bash
npm run dev
npm run seo:check   # or SEO_CHECK_URL=http://localhost:3001 npm run seo:check
```

### Before going live

1. Set `NEXT_PUBLIC_SITE_URL` to the real origin (defaults to
   `https://beltowski.studio`) — canonicals, schema and the feed all read it.
2. Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
3. Create/claim the Google Business Profile — the `ProfessionalService`
   schema supports it but doesn't replace it for map-pack visibility.

## Lead capture (the audit form)

The "Get a free 15-point audit" form in the plan section posts to
`src/app/api/audit-lead/route.ts`, which:

1. **Validates** the submission — name, valid email, valid website URL,
   length limits. Invalid payloads get a `400` and the form shows an error
   with a mailto fallback, so a hot lead is never stranded.
2. **Saves to disk first** — every valid lead is appended to
   `var/leads.jsonl` (gitignored) before any email is attempted, so an email
   outage can't lose a lead.
3. **Emails the lead** to `LEAD_TO_EMAIL` through the
   [Resend](https://resend.com) REST API. The notification's `reply-to` is
   set to the lead's own address — hit Reply to answer them directly.

### Setup

```bash
cp .env.example .env.local
```

| Variable          | Required | Purpose                                                          |
| ----------------- | -------- | ---------------------------------------------------------------- |
| `LEAD_TO_EMAIL`   | yes      | Inbox that receives lead notifications.                          |
| `RESEND_API_KEY`  | yes\*    | API key from resend.com (free tier: 100 emails/day).             |
| `LEAD_FROM_EMAIL` | no       | Custom sender, once a domain is verified in Resend.              |

\* Without `RESEND_API_KEY`, the route still accepts leads and stores them in
`var/leads.jsonl` — it just logs a warning instead of emailing. No domain
verification is needed to get started: Resend's default onboarding sender can
deliver to the account owner's own address, which is all a lead notification
needs.

### Testing

```bash
curl -X POST http://localhost:3000/api/audit-lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@example.com","website":"https://example.com","goal":"More traffic"}'
# → {"ok":true}, lead appended to var/leads.jsonl
```

### Deployment notes

- Set `LEAD_TO_EMAIL` and `RESEND_API_KEY` in the host's environment settings
  (e.g. Vercel → Project → Environment Variables).
- On serverless hosts the filesystem is ephemeral, so `var/leads.jsonl` is a
  same-instance safety net there, not durable storage — email is the real
  delivery channel. Add a database or spreadsheet hook if a durable second
  copy is ever needed.

## Analytics & CRO

GA4 plus Google Ads conversion tracking, behind geo-gated Consent Mode v2.
Full detail — event taxonomy, the custom dimensions GA4 needs before any of it
shows up in reports, and the Ads setup steps — is in
[`docs/measurement-plan.md`](docs/measurement-plan.md).

The short version:

- **Nothing is sent unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.** Set it in
  production only, or your own clicking around becomes your data. Local dev and
  preview deploys stay silent by default.
- **`NEXT_PUBLIC_ANALYTICS_DEBUG=1`** logs every event to the console and sends
  nothing — the fastest way to check the taxonomy while building.
- **All measurement goes through `src/lib/analytics/events.ts`.** Nothing calls
  `window.gtag` anywhere else, so that file's exports are the complete list of
  what the site measures. Add events there, not at the call site.
- **`generate_lead` is the only key event.** Both forms fire it, with different
  values ($50 audit / $250 enquiry) so Ads bids toward the better lead.
- **Consent defaults are inlined in `<head>`** by `layout.tsx`, because they
  must execute before gtag.js loads. Storage is denied by default across the
  EEA, UK and Switzerland, granted elsewhere, with a one-click permanent
  opt-out in the footer and a live switch on `/privacy`.

> `src/data/legal.ts` is part of this surface, not documentation of it. If you
> add a tag, embed or widget, update the privacy page in the same commit —
> otherwise it becomes a false statement rather than a stale one.

## Portrait assets

`public/portrait-duotone.png` and `public/portrait-face.png` are generated
from a photo: background removed (rembg), remapped to the site's
ink→olive→lime duotone, plus a square face crop for the trust chip. To swap
in a new photo, rerun the processing script with the new source image and the
same output paths — no code changes needed.
