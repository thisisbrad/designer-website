import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { terms, privacy } from "@/data/legal";
import { SITE_NAME } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: terms.metaTitle,
  description: terms.metaDescription,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/terms"),
    siteName: SITE_NAME,
    title: terms.metaTitle,
    description: terms.metaDescription,
    locale: "en_US",
    /* Reuses the site-wide OG card. A root opengraph-image doesn't cascade
       to a route that declares its own openGraph block, and these pages
       don't warrant art of their own. */
    images: [{ url: absoluteUrl("/opengraph-image") }],
  },
  twitter: {
    card: "summary_large_image",
    title: terms.metaTitle,
    description: terms.metaDescription,
  },
};

export default function Page() {
  return <LegalPage doc={terms} other={privacy} />;
}
