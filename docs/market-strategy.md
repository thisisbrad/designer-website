# Target Markets & PPC Strategy

Working reference for the six markets the site targets, what each is positioned
around, and what it costs to compete in paid search. Compiled August 2026 from
2026 Google Ads benchmark data — CPC figures marked *(est.)* should be verified
in Google Keyword Planner before committing budget.

Live pages: `/services/{web-design|seo-marketing|ai-solutions}/{city}` —
content lives in `src/data/locations.ts`.

---

## The six markets

### Orlando (Orange, Seminole, Osceola, Lake)
- **Positioning:** tourist intent vs. resident intent split, bilingual done
  properly, mobile-first, storm-season demand. Competing against funded
  franchises along I-4.
- **PPC reality:** the expensive war. Web design terms ~$20–25/click, SEO agency
  terms ~$25–40/click. Head terms are dominated by established agencies with
  deep budgets.
- **Role in the plan:** organic/location-page play. Only enter paid on
  longer-tail terms (niche + suburb, AI-assistant terms) — not head terms.

### Melbourne / Space Coast (Brevard)
- **Positioning:** careful engineering-grade buyers, aerospace supplier vendor
  checks, Palm Bay/Viera growth as a cold-search market, corridor (not city)
  SEO strategy.
- **PPC:** ~$8–15/click *(est.)* — roughly half of Orlando. Thin agency
  competition.
- **Role in the plan:** first paid market. SEO-service campaign here is the
  recommended starting point (~$1,500/mo) — cheapest clicks against the softest
  incumbents, and SEO clients become recurring revenue.

### Lake Mary / North Seminole (Seminole)
- **Positioning:** careful money. Heathrow, Alaqua, Markham Woods buyers who
  verify referrals online; premium ticket sizes (remodels, wealth management,
  aesthetics); I-4 corporate corridor as a B2B vendor-check market.
- **PPC:** between Melbourne and Orlando — expect ~$12–20/click *(est.)* since
  it sits inside the Orlando metro and Lake Mary is where many Orlando agencies
  are physically based. Higher CPCs are justified by client value: one
  wealth-management or law-firm client can pay for the year.
- **SEO thesis:** low volume, high value. Own forty high-intent searches in
  Heathrow/Markham Woods rather than chasing four thousand generic Orlando
  clicks. Incumbents rank on reputation, not fundamentals.

### Lakeland / Winter Haven (Polk)
- **Positioning:** the Brevard playbook on Florida's fastest-growing county —
  referral-era incumbents, new residents searching cold in the Davenport/Haines
  City corridor, Chain of Lakes waterfront money that buys carefully, bilingual
  east Polk as an open lane.
- **PPC:** cheapest of the four — ~$8–14/click *(est.)*. Polk sits in the
  Tampa–Orlando gap that agencies in both metros ignore.
- **SEO thesis:** first-mover. Growth-corridor searches often have no strong
  local answer at all. In five years Polk's search market looks like Orlando's;
  the cheap seats are now.

### Daytona Beach / Deltona (Volusia)
- **Positioning:** two markets in one county — the events-driven coast (race
  weeks, Bike Week, storm-exposed trades) and fast-growing commuter west
  Volusia (Deltona +21% since 2014, new residents searching cold). Proximity
  splits the county's map packs at the pine forest between the halves.
- **PPC:** ~$8–14/click *(est.)* — Brevard-tier pricing, softest incumbents of
  any market. Event-season terms spike seasonally.
- **Role in the plan:** chains geographically onto Brevard, extending the
  coastal corridor. Event-week booking demand is the unique angle — rentals and
  hospitality campaigns timed to the county's event calendar.

### Vero Beach / Sebastian (Indian River)
- **Positioning:** the smallest market, with Lake Mary economics — barrier-island
  wealth (John's Island, The Moorings) that vets before it calls, a seasonal
  clock (Nov–Apr) that rewards content built in the off-season, and Sebastian's
  growth as a cold-search market. Chains onto Brevard, extending the coastal
  corridor south.
- **PPC:** cheapest of all — ~$6–12/click *(est.)*, very low volume. Seasonal
  terms spike Oct–Apr.
- **Role in the plan:** low-volume/high-value organic play first; paid only on
  tight high-intent terms. One island remodel or wealth-management client
  carries the year.

---

## PPC budget math

Benchmarks: cross-industry average CPC in 2026 is $5.42; agency-niche terms run
4–7x that. Campaigns need ~6–20 clicks/day to gather enough data to optimize.
A campaign below its floor buys 1–2 clicks/day and never converges — better to
not run it.

Per-campaign monthly floors (one service, one market):

| Market | Web design | SEO services | AI solutions |
|---|---|---|---|
| Orlando | $2,500–3,500 | $3,000–4,500 | $500–1,000 |
| Lake Mary | $1,500–2,500 | $2,000–3,000 | $500–1,000 |
| Melbourne | $1,000–1,500 | $1,200–2,000 | $500–1,000 |
| Lakeland / Winter Haven | $1,000–1,500 | $1,200–2,000 | $500–1,000 |
| Daytona / Deltona | $1,000–1,500 | $1,200–2,000 | $500–1,000 |
| Vero Beach / Sebastian | $800–1,200 | $1,000–1,500 | $500–1,000 |

Notes:
- Each service is its own campaign with its own ads and landing page — budgets
  stack; they don't share.
- AI-assistant terms are cheap everywhere because bid competition is still thin.
  Cheapest lane in every market.
- At ~$20 CPC and a ~5% landing-page conversion rate, cost per lead runs
  $400–500. Normal for agency-vs-agency bidding, but one or two closed clients
  must cover the month.

## Recommended sequencing (limited budget)

1. **Start: SEO services in Melbourne/Brevard** (~$1,500/mo). Run 60–90 days
   until cost per lead stabilizes.
2. **Add: Lakeland/Winter Haven** (same service or web design) — same economics,
   fresh market.
3. **Then: Lake Mary** — higher CPC but the highest client values of the four.
4. **Last (or never): Orlando head terms.** Longer-tail and AI terms only,
   unless budget exceeds ~$5,500–8,000/mo for the metro.

Do **not** spread a small budget across all services and cities at once —
every campaign starves below its data floor and nothing converges.

---

## Drift check — August 17, 2026

What's moved since this doc was compiled, and the corrections:

**Growth markets are normalizing, not booming.** Polk permits fell 18% in
H1 2026 and county supply hit 4.7 months (balanced market); Deltona inventory
is up ~65% year-over-year with prices flat. The cold-search thesis still
works — the *stock* of 2023–25 arrivals still needs services — but the *flow*
is slowing, so it has a shelf life. Corrections: capture the arrival wave now
rather than assuming it compounds; expect new-construction trades to get
cautious with marketing budgets before storm/repair and homeowner services do;
revisit the "fastest-growing" framing on the Polk and Deltona pages in ~6
months if permits keep falling.

**CPC inflation is real and accelerating.** Cross-industry CPC rose 12% in
2025 — steepest since 2021 — with another 8–10% projected through Q4 2026.
Treat every floor in the budget table as +10% by year-end. Bottom-funnel
terms will inflate fastest as AI-era entrants concentrate bids there — which
also means the cheap AI-solutions lane won't stay cheap; if we're entering it,
enter now.

**AI Overviews reshape content, not the map pack.** AIOs now appear on ~48%
of all searches and cut organic CTR ~38% where they show — but only ~7% of
*local* searches have them. So the core strategy (own the map pack and local
fundamentals in under-served markets) is intact, and it's the blog and long-form
informational content that loses clicks. Correction: optimize to be *cited* —
AIOs pull GBP data in ~34% of local results, review summaries and FAQ schema.
Every location page already ships FAQPage schema, which is exactly the right
posture; double down on GBP activity and review velocity for clients and for
this site.

**Clock check:** Vero's seasonal content window is open right now — pages
aimed at Nov–Apr seasonal residents need to be indexed by late summer, i.e.
immediately. Storm season is mid-swing for every coastal market's emergency
content.

---

## Other Central Florida markets considered (bench)

Evaluated August 2026, not built yet — candidates if a sixth market is added:

- **The Villages / Wildwood / Ocala:** Wildwood is the fastest-growing city in
  the country; huge demand from medical and senior-focused businesses whose
  buyers vet carefully. Geographically detached from current markets.
- **Kissimmee / St. Cloud (Osceola):** big growth, large Spanish-speaking
  business community (pairs with the bilingual angle) — but inside the Orlando
  ad market, so inherits Orlando CPCs.
- **Clermont / Winter Garden (Lake–West Orange):** fast-growing, but
  increasingly on Orlando agencies' radar.
