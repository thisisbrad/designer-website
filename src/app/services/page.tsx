import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagneticButton from "@/components/MagneticButton";
import ServiceAreas from "@/components/ServiceAreas";
import { services } from "@/data/services";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const TITLE = "Services — Web Design, SEO & AI Solutions";

const DESCRIPTION =
  "Web design, frontend development, UI/UX, SEO marketing, AI assistants and conversion optimization — six disciplines, one person, no hand-off loss.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "web design services",
    "SEO marketing services",
    "AI solutions",
    "frontend development",
    "UI UX design",
    "conversion rate optimization",
  ],
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/services"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function ServicesIndex() {
  const url = `${SITE_URL}/services`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#services`,
        url,
        name: `${SITE_NAME} Services`,
        description: DESCRIPTION,
        inLanguage: "en-US",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#business` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: services.length,
          itemListElement: services.map((service, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${url}/${service.slug}`,
            name: service.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Services", item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Navbar />
      <main
        id="main"
        className="mx-auto max-w-[1400px] px-6 pt-36 pb-24 md:px-10 md:pt-44 md:pb-32"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className="mb-16 md:mb-24">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              <li>
                <Link href="/" className="transition-colors hover:text-content">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-accent">
                Services
              </li>
            </ol>
          </nav>

          <h1 className="mt-8 max-w-[20ch] font-display text-4xl font-medium tracking-tight text-balance md:text-6xl">
            Six disciplines.{" "}
            <span className="text-accent">One person. Zero hand-off loss.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted md:text-lg">
            Most projects lose their quality in the gaps — between the designer
            and the developer, the developer and the SEO, the SEO and whoever
            was supposed to measure it. Here, there are no gaps. Pick the piece
            you need, or the whole chain.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton href="/#audit">
              Get a free audit
              <span aria-hidden>↗</span>
            </MagneticButton>
            <MagneticButton href="/#contact" variant="outline">
              Start a project
            </MagneticButton>
          </div>
        </header>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                data-cursor="hover"
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-2 p-8 transition-colors duration-500 hover:border-accent/40"
              >
                <div
                  aria-hidden
                  className="absolute -top-[30%] -right-[20%] size-[70%] rounded-full bg-accent/10 opacity-0 blur-[100px] transition-opacity duration-700 group-hover:opacity-100"
                />
                <p className="relative flex items-center justify-between font-mono text-[11px] tracking-[0.2em] uppercase">
                  <span className="text-accent">{service.category}</span>
                  <span className="text-muted">({service.index})</span>
                </p>
                <h2 className="relative mt-6 font-display text-2xl font-medium tracking-tight transition-colors duration-300 group-hover:text-accent md:text-3xl">
                  {service.title}
                </h2>
                <p className="relative mt-4 leading-relaxed text-muted">
                  {service.description}
                </p>
                <p className="relative mt-auto flex items-center justify-between gap-4 pt-8 font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
                  <span>{service.priceRange}</span>
                  <span
                    aria-hidden
                    className="text-accent transition-transform duration-300 group-hover:translate-x-1"
                  >
                    Explore →
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {/* Not-sure-where-to-start path, so the hub converts on its own */}
        <section
          aria-labelledby="unsure-heading"
          className="relative mt-6 overflow-hidden rounded-2xl border border-accent/25 p-8 md:p-12"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-accent/10 via-surface-2 to-surface"
          />
          <div className="relative">
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              Not sure which you need?
            </p>
            <h2
              id="unsure-heading"
              className="max-w-[22ch] font-display text-2xl font-medium tracking-tight text-balance md:text-4xl"
            >
              Most businesses need two of these — and guess wrong about which.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              Send me your site. I&apos;ll run my 15-point audit and tell you
              where the actual bottleneck is, even when the honest answer is
              &ldquo;you don&apos;t need a redesign.&rdquo;
            </p>
            <div className="mt-8">
              <MagneticButton href="/#audit">
                Get my free audit
                <span aria-hidden>↗</span>
              </MagneticButton>
            </div>
          </div>
        </section>

        <ServiceAreas />
      </main>
      <Footer />
    </>
  );
}
