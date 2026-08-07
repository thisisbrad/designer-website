import { posts } from "@/data/posts";
import { OWNER_NAME, SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";
import { escapeXml } from "@/lib/seo";

const DESCRIPTION =
  "Plain-English guides on local SEO, schema markup, site speed and AI assistants for businesses.";

/** Posts are static data, so the feed can be prerendered rather than computed per request. */
export const dynamic = "force-static";

export async function GET() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const updated = sorted[0]?.updated ?? sorted[0]?.date;

  const items = sorted
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
      <dc:creator>${escapeXml(OWNER_NAME)}</dc:creator>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <language>en-us</language>
    <managingEditor>${SITE_EMAIL} (${escapeXml(OWNER_NAME)})</managingEditor>
    <lastBuildDate>${updated ? new Date(updated).toUTCString() : ""}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
