import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagneticButton from "@/components/MagneticButton";
import RichText from "@/components/RichText";
import { getRelatedServices, getService, services } from "@/data/services";
import { getLocationsForService } from "@/data/locations";
import { getPost } from "@/data/posts";
import { SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";
import { absoluteUrl, stripMarkup } from "@/lib/seo";

type Params = { slug: string };

/** Unknown slugs 404 instead of being rendered on demand. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  const url = `/services/${service.slug}`;

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    keywords: service.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url: absoluteUrl(url),
      siteName: SITE_NAME,
      title: service.headline,
      description: service.metaDescription,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: service.headline,
      description: service.metaDescription,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const url = absoluteUrl(`/services/${service.slug}`);
  const related = getRelatedServices(service);
  const cities = getLocationsForService(service.slug);
  const reading = service.reading
    .map((postSlug) => getPost(postSlug))
    .filter((post) => post !== undefined);

  /** "$1,500/mo" → "1500" — schema wants a bare number, the unit goes below. */
  const startingPrice = service.startingAt.replace(/[^0-9]/g, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: service.title,
        alternateName: service.headline,
        serviceType: service.category,
        description: service.metaDescription,
        url,
        image: `${url}/opengraph-image`,
        provider: { "@id": `${SITE_URL}/#business` },
        areaServed: [
          { "@type": "State", name: "Florida" },
          { "@type": "Country", name: "United States" },
        ],
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: `${SITE_URL}/#contact`,
          availableLanguage: "English",
        },
        offers: {
          "@type": "Offer",
          url,
          description: `Starting at ${service.startingAt}. Typical timeline ${service.timeline}.`,
          priceCurrency: "USD",
          price: startingPrice,
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "USD",
            minPrice: startingPrice,
            // Retainers quote per month; project work is a one-off floor.
            unitText: service.startingAt.includes("/mo") ? "MON" : undefined,
            valueAddedTaxIncluded: false,
          },
          availability: "https://schema.org/InStock",
          seller: { "@id": `${SITE_URL}/#business` },
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${service.title} deliverables`,
          itemListElement: service.includes.map((item) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: item.title,
              description: item.description,
            },
          })),
        },
        audience: {
          "@type": "BusinessAudience",
          audienceType: service.whoFor.join("; "),
        },
        isPartOf: { "@id": `${SITE_URL}/services#services` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: service.metaTitle,
        description: service.metaDescription,
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
          { "@type": "ListItem", position: 3, name: service.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: service.faq.map((item) => ({
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
                <Link href="/" className="transition-colors hover:text-paper">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href="/services"
                  className="transition-colors hover:text-paper"
                >
                  Services
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-accent">
                {service.title}
              </li>
            </ol>
          </nav>

          <p className="mt-10 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {service.category} — {service.title}
          </p>

          <h1 className="mt-6 max-w-[20ch] font-display text-4xl leading-[1.05] font-medium tracking-tight text-balance md:text-6xl">
            {service.headline}
          </h1>

          <p
            data-speakable
            className="mt-7 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
          >
            {service.subheadline}
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
              { term: "Starting at", detail: service.startingAt },
              { term: "Typical timeline", detail: service.timeline },
              { term: "Engagement", detail: "Fixed scope, fixed quote" },
              { term: "Working with", detail: "You directly — no account layer" },
            ].map((item) => (
              <div key={item.term} className="bg-ink px-6 py-7">
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

        {/* ---------- Problem ---------- */}
        <section
          aria-labelledby="problem-heading"
          className="grid gap-12 border-t border-line pt-16 md:grid-cols-12 md:gap-10 md:pt-20"
        >
          <div className="md:col-span-5">
            <h2
              id="problem-heading"
              className="font-display text-3xl font-medium tracking-tight text-balance md:text-4xl"
            >
              The problem this solves
            </h2>
            <ul className="mt-8 flex flex-col gap-4">
              {service.painPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 leading-relaxed text-paper/80"
                >
                  <span
                    aria-hidden
                    className="mt-2 font-mono text-sm text-accent"
                  >
                    ✕
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-5 md:col-span-6 md:col-start-7">
            {service.intro.map((paragraph, i) => (
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
        </section>

        {/* ---------- Deliverables ---------- */}
        <section
          aria-labelledby="includes-heading"
          className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-20"
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            What&apos;s included
          </p>
          <h2
            id="includes-heading"
            className="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            Everything in the engagement, named
          </h2>

          <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {service.includes.map((item, i) => (
              <li
                key={item.title}
                className="group rounded-2xl border border-line bg-ink-2 p-7 transition-colors duration-500 hover:border-accent/40"
              >
                <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 font-display text-xl leading-snug font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-accent">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Process ---------- */}
        <section
          aria-labelledby="process-heading"
          className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-20"
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            How it runs
          </p>
          <h2
            id="process-heading"
            className="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            Four steps, no mystery
          </h2>

          <ol className="mt-14 border-t border-line">
            {service.process.map((step) => (
              <li key={step.step} className="group border-b border-line">
                <div className="grid gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-6 md:py-10">
                  <span className="font-mono text-xs text-accent md:col-span-1">
                    ({step.step})
                  </span>
                  <h3 className="font-display text-2xl font-medium tracking-tight transition-all duration-500 group-hover:translate-x-2 group-hover:text-accent md:col-span-4 md:text-3xl">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-muted md:col-span-7">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <dl className="mt-14 grid gap-4 sm:grid-cols-3">
            {service.outcomes.map((outcome) => (
              <div
                key={outcome.label}
                className="rounded-2xl border border-line bg-ink-2 p-7"
              >
                <dt className="font-display text-4xl font-medium tracking-tight text-accent md:text-5xl">
                  {outcome.stat}
                </dt>
                <dd className="mt-4 text-sm leading-relaxed text-muted">
                  {outcome.label}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------- Fit ---------- */}
        <section
          aria-labelledby="fit-heading"
          className="mt-24 grid gap-12 border-t border-line pt-16 md:mt-32 md:grid-cols-12 md:gap-10 md:pt-20"
        >
          <div className="md:col-span-5">
            <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              Fit
            </p>
            <h2
              id="fit-heading"
              className="font-display text-3xl font-medium tracking-tight text-balance md:text-4xl"
            >
              Who this is for
            </h2>
            <p className="mt-6 leading-relaxed text-muted">
              If none of these sound like you, say so on the enquiry — I&apos;d
              rather point you somewhere better than sell you the wrong thing.
            </p>
          </div>
          <ul className="flex flex-col gap-4 md:col-span-6 md:col-start-7">
            {service.whoFor.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 rounded-2xl border border-line bg-ink-2 p-6 leading-relaxed text-paper/85"
              >
                <span aria-hidden className="mt-0.5 text-accent">
                  →
                </span>
                {item}
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
            className="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            {service.title} — frequently asked
          </h2>

          <dl className="mt-12 flex flex-col gap-4">
            {service.faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-line bg-ink-2 p-7 md:p-8"
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

        {/* ---------- Local variants ---------- */}
        {cities.length > 0 && (
          <section
            aria-labelledby="cities-heading"
            className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-20"
          >
            <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              Local
            </p>
            <h2
              id="cities-heading"
              className="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
            >
              {service.title} where you are
            </h2>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted">
              Some markets differ enough to be worth their own page. I work with
              clients across the US either way.
            </p>
            <ul className="mt-10 flex flex-wrap gap-4">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/services/${service.slug}/${city.slug}`}
                    data-cursor="hover"
                    className="group flex items-center gap-4 rounded-2xl border border-line bg-ink-2 px-7 py-5 transition-colors duration-500 hover:border-accent/40"
                  >
                    <span className="font-display text-xl font-medium tracking-tight transition-colors duration-300 group-hover:text-accent">
                      {service.title} in {city.city}
                    </span>
                    <span
                      aria-hidden
                      className="text-accent transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------- Conversion hook ---------- */}
        <aside className="relative mt-20 overflow-hidden rounded-2xl border border-accent/25 p-8 md:mt-24 md:p-12">
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-accent/10 via-ink-2 to-ink"
          />
          <div className="relative">
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              Free 15-point audit
            </p>
            <p className="max-w-[22ch] font-display text-2xl font-medium tracking-tight text-balance md:text-4xl">
              {service.cta.hook}
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">
              {service.cta.copy}
            </p>
            <div className="mt-8">
              <MagneticButton href="/#audit">
                {service.cta.button}
                <span aria-hidden>↗</span>
              </MagneticButton>
            </div>
          </div>
        </aside>

        {/* ---------- Sibling services ---------- */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mt-20 md:mt-24">
            <h2
              id="related-heading"
              className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase"
            >
              Often paired with
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/services/${item.slug}`}
                    data-cursor="hover"
                    className="group flex h-full flex-col rounded-2xl border border-line bg-ink-2 p-6 transition-colors duration-500 hover:border-accent/40"
                  >
                    <span className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                      {item.category}
                    </span>
                    <span className="mt-3 font-display text-lg leading-snug font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-accent">
                      {item.title}
                    </span>
                    <span className="mt-4 text-sm leading-relaxed text-muted">
                      {item.description}
                    </span>
                    <span className="mt-auto pt-6 font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
                      From {item.startingAt} →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---------- Cluster links into the blog ---------- */}
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
          <Link href="/services" className="transition-colors hover:text-accent">
            ← All services
          </Link>
          <span aria-hidden className="mx-4 text-line">
            |
          </span>
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="transition-colors hover:text-accent"
          >
            {SITE_EMAIL} ↗
          </a>
        </p>
      </main>
      <Footer />
    </>
  );
}
