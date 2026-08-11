import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import RichText from "./RichText";
import ConsentControl from "./analytics/ConsentControl";
import type { LegalDoc } from "@/data/legal";
import { OWNER_NAME, SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";
import { slugify } from "@/lib/seo";

/* Pinned to UTC: the dates in content files are date-only ISO strings, which
   Date parses as UTC midnight. Formatting those in a western timezone renders
   the day before — a post dated the 9th publishing as the 8th. */
const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Shared shell for /privacy and /terms. Set on a narrow measure rather than
 * the marketing pages' full width — these exist to be read, not scanned.
 */
export default function LegalPage({
  doc,
  other,
}: {
  doc: LegalDoc;
  /** The sibling policy, linked at the foot so neither is a dead end. */
  other: LegalDoc;
}) {
  const url = `${SITE_URL}/${doc.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: doc.metaTitle,
        description: doc.metaDescription,
        dateModified: doc.updated,
        inLanguage: "en-US",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#business` },
        publisher: { "@id": `${SITE_URL}/#business` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: doc.title, item: url },
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

        <div className="mx-auto max-w-3xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              <li>
                <Link href="/" className="transition-colors hover:text-content">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-accent">
                {doc.title}
              </li>
            </ol>
          </nav>

          <h1 className="mt-10 font-display text-4xl leading-[1.08] font-medium tracking-tight text-balance md:text-5xl">
            {doc.headline}
          </h1>

          <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            Last updated{" "}
            <time dateTime={doc.updated}>
              {dateFormat.format(new Date(doc.updated))}
            </time>
          </p>

          <p className="mt-8 text-lg leading-relaxed text-muted">{doc.intro}</p>

          {/* Long documents; a jump list beats scrolling for the one clause
              someone actually came for. */}
          <nav
            aria-label="On this page"
            className="mt-12 rounded-2xl border border-line bg-surface-2 p-6 md:p-7"
          >
            <h2 className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              On this page
            </h2>
            <ol className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {doc.sections.map((section, i) => (
                <li key={section.heading} className="flex gap-3 text-sm">
                  <span className="font-mono text-[11px] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={`#${slugify(section.heading)}`}
                    className="text-muted transition-colors hover:text-content"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-14 flex flex-col gap-12">
            {doc.sections.map((section) => (
              <section
                key={section.heading}
                id={slugify(section.heading)}
                className="scroll-mt-28"
              >
                <h2 className="mb-4 font-display text-2xl font-medium tracking-tight md:text-3xl">
                  {section.heading}
                </h2>
                {section.paragraphs && (
                  <div className="flex flex-col gap-4 leading-relaxed text-muted">
                    {section.paragraphs.map((paragraph, i) => (
                      <p key={i}>
                        <RichText text={paragraph} />
                      </p>
                    ))}
                  </div>
                )}
                {section.list && (
                  <ul className="mt-5 flex flex-col gap-3">
                    {section.list.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 leading-relaxed text-muted"
                      >
                        <span
                          aria-hidden
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                        />
                        <span>
                          <RichText text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {/* A policy that describes an opt-out should carry the switch. */}
          {doc.slug === "privacy" && <ConsentControl />}

          <aside className="mt-16 rounded-2xl border border-accent/25 bg-surface-2 p-7 md:p-8">
            <h2 className="font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
              Questions about this
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              Email {OWNER_NAME.split(" ")[0]} directly at{" "}
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="text-content underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              >
                {SITE_EMAIL}
              </a>
              . {SITE_NAME} is a one-person studio, so it reaches the person who
              can actually action it.
            </p>
          </aside>

          <p className="mt-12 border-t border-line pt-8 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            <Link
              href={`/${other.slug}`}
              className="transition-colors hover:text-accent"
            >
              {other.headline} ↗
            </Link>
            <span aria-hidden className="mx-4 text-line">
              |
            </span>
            <Link href="/contact" className="transition-colors hover:text-accent">
              Contact
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
