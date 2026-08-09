# Central Florida Local SEO Plan

Working plan for the location-page footprint. Focus: **Orlando + Melbourne**.
Last updated: August 2026.

## Principles

- **Quality over coverage.** The doorway-page risk isn't page count, it's
  sameness. Every location page carries ~1,300 words of market-specific
  reasoning, or it doesn't ship. The `seo-check` build gate (700-word floor,
  geo schema, parent link) is the backstop, not the target.
- **Honest service radius.** `areaServed` claims counties we actually serve,
  not a citywide land grab. The credibility story ("Florida-based, here's my
  coast") is worth more than map coverage.
- **Neighborhoods fold in, markets get pages.** Growth communities belong in
  a city page's `areas` array (like Winter Park inside Orlando) — never as
  their own pages. A new page requires a genuinely distinct market we can
  write 1,000+ honest words about without repeating another page.
- **The ceiling is a test, not a number.** "Can I say something true and
  specific about this market that no other page already says?" A three-city
  footprint passes. A 15-town sweep never will.

## Current footprint

| Page | Status | Notes |
| --- | --- | --- |
| Orlando × web design / SEO / AI | Live | ~1,300 words each, City + GeoCircle + county schema; Horizon West folded in |
| Melbourne × web design / SEO / AI | Live | Palm Bay–Melbourne–Titusville MSA (Brevard County); Palm Bay + Viera anchor the copy |
| Vero Beach | Backlog | Natural third page if the first two prove out |

Central Florida's "new" growth is almost entirely master-planned communities
and boomtowns orbiting these two metros — new communities mean new
businesses, and new businesses are buying their first real website. That
angle belongs *inside* the two pages, not spread across new ones.

## Orlando page — areas to add

Add to `areas` in `src/data/locations.ts`; mention in copy where it earns it.

- **Horizon West** — among the fastest-growing master-planned communities in
  the country (west Orange). Winter Garden is already listed, but locals
  search "Horizon West."
- **Lake Nona / Medical City** — already listed; the copy should name
  Medical City. Tech/health cluster with budgets.
- **St. Cloud** — absorbing enormous Osceola residential growth. Not
  currently listed.
- **Sunbridge** — Tavistock's next Lake Nona, east of St. Cloud. Not listed.
- **Davenport / Champions Gate / Four Corners** — vacation-rental and
  new-rooftops economy at the Osceola/Polk/Lake seam; heavy new-business
  formation in home services and short-term rentals.
- **Minneola / Wellness Way corridor** — Lake County's turnpike-side boom
  beside Clermont (already listed).

## Melbourne page — coverage

Honest metro = **Palm Bay–Melbourne–Titusville MSA** (Brevard County), and
that's the `areaServed` story. Market character: Space Coast — aerospace and
defense subcontractors, engineers as buyers, B2B credibility, beachside
tourism, storm-season demand.

`areas` list:

- **Palm Bay** — repeatedly among Florida's fastest-growing cities and
  bigger than Melbourne; new construction, trades, home services.
- **West Melbourne** — where retail and light-industrial growth is landing.
- **Viera / Suntree / Rockledge** — Brevard's master-planned growth spine;
  affluent, medical, professional services.
- **Titusville / Cape Canaveral / Cocoa Beach** — the space-boom end: launch
  tourism, aerospace suppliers, short-term rentals.
- **Satellite Beach / Indian Harbour Beach / Merritt Island** — beachside
  fill-out.

Service combos: web design + SEO for sure. AI solutions has a real story
here (engineering-heavy market) — keep it if the copy holds 1,000+ words.

## Future own-page candidates

In priority order, only after Orlando + Melbourne demonstrably rank and
convert (give them a few months of Search Console data):

1. **Lakeland / Winter Haven (Polk)** — has topped national MSA growth
   rankings in recent years; distinct I-4 economy (logistics, Publix,
   distribution); far less agency competition than Orlando; 45 minutes away.
2. **Daytona Beach (Volusia)** — distinct market (motorsports, tourism,
   healthcare, LPGA-corridor growth); an hour out; moderate competition.
3. **The Villages / Ocala** — explosive growth, very weak local web
   competition, economies built on the home-services businesses that need
   us. Weakest proximity story — only with a client proof point.

## Not now: West Palm Beach / Palm Beach Gardens

- **Credibility flips.** WPB is a different metro (South Florida), ~90 miles
  past Vero. A Space Coast studio claiming it reads like the start of a
  town-list sweep — to Google and to humans.
- **Winnability flips.** Palm Beach County is saturated (Miami / Fort
  Lauderdale agencies fight for every term), and we'd enter without the
  "I'm actually here" advantage. Orlando-level difficulty, no adjacency.
- **Gardens is never its own page.** Same metro, same county, same
  searchers — if WPB ever happens, Palm Beach Gardens goes in its `areas`.

What would change the answer: a nameable Palm Beach County client or case
study; the first three cities proving the pattern; or reframing as a
**vertical page** ("web design for financial and professional services")
that captures the WPB clientele without another geo page.

## Satellite content strategy

For community-level names (Horizon West, Sunbridge, Viera), write long-tail
blog posts — e.g. "What a Horizon West business needs from its website" —
that interlink up to the city page. Captures community searches without
multiplying geo pages. Keeps the architecture at two strong pages plus
satellites: the shape that survives both Google's doorway heuristics and a
human reading the footer.

## Checklist when adding a location page

1. Entry in `src/data/locations.ts` (`locations` + one `locationServices`
   entry per service) — counties and GeoCircle honest, non-overlapping with
   existing pages.
2. ~1,300 words of market-specific copy: context, factors, industries, FAQ.
   Deliverables/process reference the parent service — scope doesn't change
   by postcode, and the page says so.
3. Schema: City + GeoCircle + county `areaServed`, `isSimilarTo` → parent
   service; breadcrumbs four deep.
4. Wire links: parent service page, footer, sitemap.
5. `npm run seo:check` passes (700-word floor, geo schema, parent link).
6. Google Business Profile stays the bigger local lever — pages support it,
   they don't replace it. If based on the Space Coast, say so on the page
   ("based in X, serving Brevard") — local base beats claimed radius.
