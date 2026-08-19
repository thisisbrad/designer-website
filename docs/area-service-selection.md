# Service-area "corridor" section — multi-city services company

Build the homepage section that shows where the company works. It serves
multiple cities/towns, and the section should make the service area feel
like a real, specific place — not a list of SEO keywords.

## Fill in before running

- Company: [company name], [trade — e.g. pool service, HVAC, roofing]
- Cities served, in geographic order: [list them]
- Approx lat/lon for each city (look them up; real coordinates, not guesses)
- Brand tokens: [ground color], [primary], [accent], [display font], [body font]
- Section heading vocabulary the brand uses: [e.g. "Where we work",
  "The service area", "Communities served"]

## The concept

A hand-drawn / engraved map treatment rendered as inline SVG behind or
beside the city list. Cities are plotted at their true relative positions
using a simple equirectangular projection (a `px(lon)` / `py(lat)` helper
pair mapping the bounding box of the service area into the SVG viewBox).
The map is atmosphere and proof-of-place; the text list of cities is the
actual content and must stand alone without it.

Do NOT reproduce a specific prior design. Invent the visual voice from
this brand's palette and type. The only fixed requirements are: real
geography, inline SVG (no map libraries, no embeds, no raster images),
and the list↔map interaction below.

## Choose the geographic anchor from the shape of the service area

Decide which case applies and draw accordingly:

1. **Coastal corridor** (cities strung along a shoreline): the coastline
   is the spine. Trace it from real waypoints north-to-south, including
   recognizable inlets/bays as small jogs. Let stylized water lines
   radiate seaward and land/elevation bands radiate inland, fading with
   distance. Overshoot the sheet edges so lines bleed off rather than
   stopping mid-section.

2. **Inland region** (no coast): pick a real linework spine that locals
   recognize — a river, a lake chain, or the highway corridor that
   actually connects the cities. Draw it the same engraved way, with
   contour-style bands radiating from it. If the area is a metro hub
   with satellite towns, concentric distance rings from the hub city
   are an acceptable alternative spine.

3. **Coast-to-inland span** (the company covers both): widen the sheet.
   Coastline on one edge with its water lines, the inland spine
   (river/highway) crossing the interior, cities plotted across the full
   width. The composition should read "from the coast to [inland
   anchor]" — say exactly that in the section copy.

## Structure

- A small label or heading, a one-sentence intro naming the region the
  way locals name it (corridor, county, valley, coast — whatever is
  true), then the city list as inline text separated by middots, then
  one quiet line naming the client types served.
- Put the projection helpers, coastline/spine waypoints, city
  coordinates, and marker layout in a small shared lib module (e.g.
  `src/lib/regionMap.ts`) so other pages can reuse the geometry.
- Marker collision: enforce a minimum vertical gap between labels so
  near-neighbor towns don't overlap.

## Interaction & accessibility

- Hovering/focusing a city name in the text list highlights its marker
  on the map (ring or pulse); hovering a marker highlights the name.
  Wire with `data-city` attributes, no framework needed.
- Any ambient animation (drifting water lines, slow pulse) must respect
  `prefers-reduced-motion`.
- The SVG gets `role="img"` and a descriptive `aria-label` naming the
  region and its extent; the city list gets its own `aria-label`. On
  small screens the map may simplify or drop away — the list carries
  the meaning.

## Guardrails

- No Google Maps embed, no Leaflet/Mapbox, no stock map imagery, no
  pin-cluster clip art.
- No fake geography: every waypoint and city position comes from real
  coordinates. If a coordinate is unknown, look it up rather than
  inventing it.
- Keep it dependency-free and fast: one SVG, CSS, and a few lines of JS.
