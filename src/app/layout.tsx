import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { services } from "@/data/services";
import { OWNER_NAME, SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Independent designer and developer building fast, search-optimized websites and practical AI solutions that help businesses get found, convert and grow.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Beltowski® — Web Design, SEO & AI Solutions",
    template: "%s — Beltowski®",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: OWNER_NAME, url: SITE_URL }],
  creator: OWNER_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Beltowski® — Web Design, SEO & AI Solutions",
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beltowski® — Web Design, SEO & AI Solutions",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false },
  category: "technology",
};

export const viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark" as const,
};

/** Site-wide entity graph: the business (local search), its owner and the site. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      url: SITE_URL,
      email: SITE_EMAIL,
      description:
        "Web design, SEO marketing and AI solutions for businesses — fast, search-optimized websites, local search, and AI assistants that book clients.",
      image: `${SITE_URL}/logo.png`,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
        caption: SITE_NAME,
      },
      address: {
        "@type": "PostalAddress",
        addressRegion: "FL",
        addressCountry: "US",
      },
      areaServed: [
        { "@type": "State", name: "Florida" },
        { "@type": "Country", name: "United States" },
      ],
      availableLanguage: "English",
      priceRange: "$$",
      founder: { "@id": `${SITE_URL}/#owner` },
      knowsAbout: [
        "Web design",
        "Frontend development",
        "Search engine optimization",
        "Local SEO",
        "Schema markup",
        "Core Web Vitals",
        "AI assistants",
        "Conversion rate optimization",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services",
        url: `${SITE_URL}/services`,
        itemListElement: services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            "@id": `${SITE_URL}/services/${service.slug}#service`,
            name: service.title,
            serviceType: service.category,
            description: service.description,
            url: `${SITE_URL}/services/${service.slug}`,
          },
        })),
      },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#owner`,
      name: OWNER_NAME,
      url: SITE_URL,
      email: SITE_EMAIL,
      image: `${SITE_URL}/portrait-face.png`,
      jobTitle: "Designer, developer & AI consultant",
      description:
        "Nine years building websites that get found and convert — technical SEO, conversion design and AI assistants for startups, agencies and local businesses.",
      knowsAbout: [
        "Local SEO",
        "Schema markup",
        "Core Web Vitals",
        "AI assistants",
        "Conversion design",
      ],
      worksFor: { "@id": `${SITE_URL}/#business` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#business` },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}>
      <body className="bg-ink font-body text-paper antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
