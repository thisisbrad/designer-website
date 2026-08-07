import { SITE_URL } from "./site";

/** Absolute URL for metadata, JSON-LD and feeds — relative paths break both. */
export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Stable heading anchors so the table of contents and SERP jump-links agree. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[‘’“”]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Strips inline-link syntax so counts and feed summaries read as prose. */
export function stripMarkup(text: string) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
