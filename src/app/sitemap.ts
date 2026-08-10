import type { MetadataRoute } from "next";
import { posts } from "@/data/posts";
import { services } from "@/data/services";
import { locationServices } from "@/data/locations";
import { legalDocs } from "@/data/legal";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const newestPost = posts
    .map((post) => post.date)
    .sort()
    .at(-1);

  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/services`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    // Service pages outrank the blog: they're the pages meant to convert.
    ...services.map((service) => ({
      url: `${SITE_URL}/services/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // City pages sit just under their parent service.
    ...locationServices.map((item) => ({
      url: `${SITE_URL}/services/${item.service}/${item.location}`,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    {
      url: `${SITE_URL}/blog`,
      lastModified: newestPost ? new Date(newestPost) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    // Indexable but low priority: trust pages, not landing pages.
    ...legalDocs.map((doc) => ({
      url: `${SITE_URL}/${doc.slug}`,
      lastModified: new Date(doc.updated),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
