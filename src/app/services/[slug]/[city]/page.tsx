import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagneticButton from "@/components/MagneticButton";
import RichText from "@/components/RichText";
import { getService } from "@/data/services";
import {
  getLocation,
  getLocationService,
  getServicesForLocation,
  locationServices,
} from "@/data/locations";
import { getPost } from "@/data/posts";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { absoluteUrl, stripMarkup } from "@/lib/seo";

type Params = { slug: string; city: string };

/** Only the city/service pairs that have real local copy exist. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return locationServices.map((item) => ({
    slug: item.service,
    city: item.location,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug, city } = await params;
  const page = getLocationService(slug, city);
  const location = getLocation(city);
  if (!page || !location) return {};

  const url = `/services/${slug}/${city}`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url: absoluteUrl(url),
      siteName: SITE_NAME,
      title: page.headline,
      description: page.metaDescription,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: page.headline,
      description: page.metaDescription,
    },
    other: {
      // Geo meta is legacy, but still parsed by some local directories.
      "geo.region": `US-${location.regionCode}`,
      "geo.placename": location.city,
      "geo.position": `${location.geo.latitude};${location.geo.longitude}`,
    },
  };
}

export default async function LocationServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, city } = await params;
  const page = getLocationService(slug, city);
  const location = getLocation(city);
  const service = getService(slug);
  if (!page || !location || !service) notFound();

  const url = absoluteUrl(`/services/${slug}/${city}`);
  const parentUrl = `${SITE_URL}/services/${slug}`;
  const siblings = getServicesForLocation(city, slug);
  const reading = service.reading
    .map((postSlug) => getPost(postSlug))
    .filter((post) => post !== undefined);

  const areaServed = {
    "@type": "City",
    name: location.city,
    address: {
      "@type": "PostalAddress",
      addressLocality: location.city,
      addressRegion: location.regionCode,
      addressCountry: "US",
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: `${service.title} in ${location.city}, ${location.regionCode}`,
        alternateName: page.headline,
        serviceType: service.category,
        description: page.metaDescription,
        url,
        image: `${url}/opengraph-image`,
        provider: { "@id": `${SITE_URL}/#business` },
        areaServed: [
          areaServed,
          {
            "@type": "GeoCircle",
            geoMidpoint: {
              "@type": "GeoCoordinates",
              latitude: location.geo.latitude,
              longitude: location.geo.longitude,
            },
            geoRadius: location.radiusKm * 1000,
          },
          ...location.counties.map((name) => ({
            "@type": "AdministrativeArea",
            name,
          })),
        ],
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: `${SITE_URL}/#contact`,
          availableLanguage: ["English", "Spanish"],
        },
        offers: {
          "@type": "Offer",
          url,
          // No price — see the note on the parent service page's Offer node.
          description: `Typical timeline ${service.timeline}. Quoted per project after scoping.`,
          availability: "https://schema.org/InStock",
          seller: { "@id": `${SITE_URL}/#business` },
        },
        audience: {
          "@type": "BusinessAudience",
          audienceType: page.industries.join("; "),
          geographicArea: areaServed,
        },
        // Declares this as the local variant of the main service page, so the
        // two aren't read as duplicates competing for the same query.
        isSimilarTo: { "@id": `${parentUrl}#service` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.metaTitle,
        description: page.metaDescription,
        inLanguage: "en-US",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${url}#service` },
        primaryImageOfPage: `${url}/opengraph-image`,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-speakable]"],
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Services",
            item: `${SITE_URL}/services`,
          },
          { "@type": "ListItem", position: 3, name: service.title, item: parentUrl },
          { "@type": "ListItem", position: 4, name: location.city, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: page.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: stripMarkup(item.answer),
          },
        })),
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

        {/* ---------- Hero ---------- */}
        <header className="mb-20 md:mb-28">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              <li>
                <Link href="/" className="transition-colors hover:text-content">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href="/services"
                  className="transition-colors hover:text-content"
                >
                  Services
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/services/${slug}`}
                  className="transition-colors hover:text-content"
                >
                  {service.title}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-accent">
                {location.city}
              </li>
            </ol>
          </nav>

          <p className="mt-10 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {location.city}, {location.regionCode} — {service.title}
          </p>

          <h1 className="mt-6 max-w-[19ch] font-display text-4xl leading-[1.05] font-medium tracking-tight text-balance md:text-6xl">
            {page.headline}
          </h1>

          <p
            data-speakable
            className="mt-7 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
          >
            {page.subheadline}
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

          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {[
              { term: "Serving", detail: `${location.city} & ${location.metroLabel}` },
              { term: "Typical range", detail: service.priceRange },
              { term: "Typical timeline", detail: service.timeline },
              { term: "Languages", detail: "English & Spanish" },
            ].map((item) => (
              <div key={item.term} className="bg-surface px-6 py-7">
                <dt className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                  {item.term}
                </dt>
                <dd className="mt-3 font-display text-lg leading-snug font-medium tracking-tight text-balance">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        {/* ---------- Local market context ---------- */}
        <section
          aria-labelledby="market-heading"
          className="border-t border-line pt-16 md:pt-20"
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            The local picture
          </p>
          <h2
            id="market-heading"
            className="max-w-[22ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            Why {location.city} isn&apos;t the generic case
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-12">
            <div className="flex flex-col gap-5 md:col-span-7">
              {page.context.map((paragraph, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "font-display text-xl leading-relaxed font-medium tracking-tight text-balance md:text-2xl"
                      : "leading-relaxed text-muted"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="md:col-span-4 md:col-start-9">
              <h3 className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
                Sectors I work with here
              </h3>
              <ul className="mt-6 flex flex-col gap-3">
                {page.industries.map((industry) => (
                  <li
                    key={industry}
                    className="flex items-start gap-3 text-sm leading-relaxed text-content/80"
                  >
                    <span
                      aria-hidden
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {industry}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ul className="mt-16 grid gap-4 md:grid-cols-2">
            {page.factors.map((factor, i) => (
              <li
                key={factor.title}
                className="group rounded-2xl border border-line bg-surface-2 p-7 transition-colors duration-500 hover:border-accent/40 md:p-8"
              >
                <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 font-display text-xl leading-snug font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-accent">
                  {factor.title}
                </h3>
                <p className="mt-4 leading-relaxed text-muted">
                  {factor.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Shared deliverables, borrowed from the parent service ---------- */}
        <section
          aria-labelledby="includes-heading"
          className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-20"
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            What&apos;s included
          </p>
          <h2
            id="includes-heading"
            className="max-w-[22ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            The same engagement, run for {location.city}
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted">
            The work itself doesn&apos;t change by postcode — what changes is
            the market it&apos;s aimed at. Full detail on the{" "}
            <Link
              href={`/services/${slug}`}
              className="text-content underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            >
              {service.title} page
            </Link>
            .
          </p>

          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {service.includes.map((item, i) => (
              <li
                key={item.title}
                className="rounded-2xl border border-line bg-surface-2 p-7"
              >
                <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 font-display text-xl leading-snug font-medium tracking-tight text-balance">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>

          <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step) => (
              <li
                key={step.step}
                className="rounded-2xl border border-line p-6"
              >
                <p className="font-mono text-xs text-accent">({step.step})</p>
                <h3 className="mt-4 font-display text-lg font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Honest coverage statement ---------- */}
        <section
          aria-labelledby="areas-heading"
          className="mt-24 grid gap-10 border-t border-line pt-16 md:mt-32 md:grid-cols-12 md:pt-20"
        >
          <div className="md:col-span-5">
            <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              Coverage
            </p>
            <h2
              id="areas-heading"
              className="font-display text-3xl font-medium tracking-tight text-balance md:text-4xl"
            >
              Areas I work across
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              {location.counties.join(", ")} — and remotely anywhere else. This
              is a list of where clients actually are, not a keyword net.
            </p>
          </div>
          <ul className="flex flex-wrap gap-2 self-start md:col-span-6 md:col-start-7">
            {location.areas.map((area) => (
              <li
                key={area}
                className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] tracking-wider text-muted uppercase"
              >
                {area}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- FAQ ---------- */}
        <section
          aria-labelledby="faq-heading"
          className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-20"
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            Questions
          </p>
          <h2
            id="faq-heading"
            className="max-w-[22ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            {location.city} {service.title} — frequently asked
          </h2>

          <dl className="mt-12 flex flex-col gap-4">
            {page.faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-line bg-surface-2 p-7 md:p-8"
              >
                <dt className="font-display text-lg font-medium tracking-tight md:text-xl">
                  {item.question}
                </dt>
                <dd className="mt-4 leading-relaxed text-muted">
                  <RichText text={item.answer} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------- Conversion hook ---------- */}
        <aside className="relative mt-20 overflow-hidden rounded-2xl border border-accent/25 p-8 md:mt-24 md:p-12">
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-accent/10 via-surface-2 to-surface"
          />
          <div className="relative">
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              Free 15-point audit
            </p>
            <p className="max-w-[22ch] font-display text-2xl font-medium tracking-tight text-balance md:text-4xl">
              {page.cta.hook}
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">
              {page.cta.copy}
            </p>
            <div className="mt-8">
              <MagneticButton href="/#audit">
                {page.cta.button}
                <span aria-hidden>↗</span>
              </MagneticButton>
            </div>
          </div>
        </aside>

        {/* ---------- Sibling city pages ---------- */}
        {siblings.length > 0 && (
          <section aria-labelledby="siblings-heading" className="mt-20 md:mt-24">
            <h2
              id="siblings-heading"
              className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase"
            >
              Also in {location.city}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {siblings.map((item) => {
                const sibling = getService(item.service);
                if (!sibling) return null;
                return (
                  <li key={item.service}>
                    <Link
                      href={`/services/${item.service}/${item.location}`}
                      data-cursor="hover"
                      className="group flex h-full flex-col rounded-2xl border border-line bg-surface-2 p-6 transition-colors duration-500 hover:border-accent/40"
                    >
                      <span className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                        {sibling.category}
                      </span>
                      <span className="mt-3 font-display text-lg leading-snug font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-accent">
                        {location.city} {sibling.title}
                      </span>
                      <span className="mt-4 text-sm leading-relaxed text-muted">
                        {item.subheadline}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ---------- Cluster links ---------- */}
        {reading.length > 0 && (
          <section aria-labelledby="reading-heading" className="mt-16">
            <h2
              id="reading-heading"
              className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase"
            >
              Read more on this
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {reading.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    data-cursor="hover"
                    className="group flex h-full flex-col rounded-2xl border border-line p-6 transition-colors duration-500 hover:border-accent/40"
                  >
                    <span className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                      {post.category}
                    </span>
                    <span className="mt-3 font-display text-lg leading-snug font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-accent">
                      {post.title}
                    </span>
                    <span className="mt-auto pt-6 font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
                      {post.readTime}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-16 border-t border-line pt-8 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          <Link
            href={`/services/${slug}`}
            className="transition-colors hover:text-accent"
          >
            ← {service.title}
          </Link>
          <span aria-hidden className="mx-4 text-line">
            |
          </span>
          <Link href="/services" className="transition-colors hover:text-accent">
            All services
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
