/**
 * Market detection: which of the site's city markets a question is about.
 *
 * The intent rules know the marquee city names, but visitors name their own
 * town — "Winter Haven", "Heathrow", "Palm Bay" — and every one of those maps
 * to a market page. Built from the same locations data the pages render from,
 * so a new market, or a new suburb on an existing one, is recognised with no
 * change here.
 *
 * Relative import on purpose: keeps this module runnable under `node --test`
 * alongside query.ts and bm25.ts, which the path alias would break.
 */

import { locations, type Location } from "../../data/locations";

/* Later-defined markets overwrite earlier claims to the same name: Orlando's
   county list includes Seminole and its areas include Sanford, but the
   Lake Mary market is the dedicated page for both. */
const byName = new Map<string, Location>();
for (const location of locations) {
  const names = [
    location.city,
    location.metroLabel.replace(/^the /i, ""),
    ...location.counties,
    ...location.areas,
  ];
  for (const raw of names) byName.set(raw.toLowerCase(), location);
}

/* Longest names first so "daytona beach shores" resolves before "daytona". */
const NAMES = [...byName.entries()]
  .map(([name, location]) => ({ name, location }))
  .sort((a, b) => b.name.length - a.name.length);

/** The market a question names, if any. Matching is whole-word. */
export function detectMarket(text: string): Location | undefined {
  const haystack = ` ${String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;

  for (const { name, location } of NAMES) {
    if (haystack.includes(` ${name} `)) return location;
  }
  return undefined;
}
