/**
 * Hero presentation config, kept out of ServiceHero.tsx because that file is
 * "use client" — every export of a client module becomes a client reference,
 * so a server component can't read plain values from it.
 *
 * This is presentation, not content, which is why it isn't in data/services.
 */

export type HeroVariant =
  | "composition"
  | "lattice"
  | "flow"
  | "beacon"
  | "swarm"
  | "terrain";

/** Which scene each service wears. */
export const HERO_VARIANTS: Record<string, HeroVariant> = {
  "web-design": "composition",
  "frontend-development": "lattice",
  "ui-ux-design": "flow",
  // The lighthouse from the homepage: a beam finding you in the dark is the
  // whole promise of search.
  "seo-marketing": "beacon",
  "ai-solutions": "swarm",
  "analytics-cro": "terrain",
};

/** Where each headline breaks, and the line the accent colour starts on. */
const HEADLINE_LINES: Record<string, { lines: string[]; accentFrom: number }> = {
  "web-design": {
    lines: ["Web design that earns", "trust in the first", "three seconds"],
    accentFrom: 2,
  },
  "frontend-development": {
    lines: ["Frontend development", "that still holds up", "in two years"],
    accentFrom: 2,
  },
  "ui-ux-design": {
    lines: ["Interfaces people get", "right on the first try"],
    accentFrom: 1,
  },
  "seo-marketing": {
    lines: ["Get found by the people", "already searching for you"],
    accentFrom: 1,
  },
  "ai-solutions": {
    lines: ["An AI assistant that books", "clients, not one that chats"],
    accentFrom: 1,
  },
  "analytics-cro": {
    lines: ["Turn the traffic you", "already have into revenue"],
    accentFrom: 1,
  },
};

/**
 * Line breaks for a service headline. Falls back to a single line whenever
 * the stored split no longer reconstructs the headline, so editing copy in
 * data/services.ts can never silently render a stale or truncated <h1>.
 */
export function getHeroHeadline(slug: string, headline: string) {
  const entry = HEADLINE_LINES[slug];
  if (entry && entry.lines.join(" ") === headline) return entry;
  return { lines: [headline], accentFrom: 1 };
}

export function getHeroVariant(slug: string): HeroVariant {
  return HERO_VARIANTS[slug] ?? "composition";
}
