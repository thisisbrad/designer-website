import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { privacy, terms } from "@/data/legal";
import { SITE_NAME } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: privacy.metaTitle,
  description: privacy.metaDescription,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/privacy"),
    siteName: SITE_NAME,
    title: privacy.metaTitle,
    description: privacy.metaDescription,
    locale: "en_US",
    /* Reuses the site-wide OG card. A root opengraph-image doesn't cascade
       to a route that declares its own openGraph block, and these pages
       don't warrant art of their own. */
    images: [{ url: absoluteUrl("/opengraph-image") }],
  },
  twitter: {
    card: "summary_large_image",
    title: privacy.metaTitle,
    description: privacy.metaDescription,
  },
};

export default function Page() {
  return <LegalPage doc={privacy} other={terms} />;
}
