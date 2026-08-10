import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { posts } from "@/data/posts";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const DESCRIPTION =
  "Plain-English guides on local SEO, schema markup, site speed and AI assistants — how businesses get found, convert visitors and automate the busywork.";

export const metadata: Metadata = {
  title: "Blog — SEO, AI & web advice for businesses",
  description: DESCRIPTION,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: {
    type: "website",
    url: absoluteUrl("/blog"),
    siteName: SITE_NAME,
    title: "Blog — SEO, AI & web advice for businesses",
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

/* Pinned to UTC: the dates in content files are date-only ISO strings, which
   Date parses as UTC midnight. Formatting those in a western timezone renders
   the day before — a post dated the 9th publishing as the 8th. */
const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function BlogIndex() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const [featured, ...rest] = sorted;
  const categories = Array.from(new Set(sorted.map((p) => p.category)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["CollectionPage", "Blog"],
        "@id": `${SITE_URL}/blog#blog`,
        url: `${SITE_URL}/blog`,
        name: `${SITE_NAME} Blog`,
        description: DESCRIPTION,
        inLanguage: "en-US",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#business` },
        about: categories.map((name) => ({ "@type": "Thing", name })),
        mainEntity: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: sorted.length,
          itemListElement: sorted.map((post, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/blog/${post.slug}`,
            name: post.title,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/blog#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${SITE_URL}/blog`,
          },
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

        <header className="mb-16 md:mb-20">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              <li>
                <Link href="/" className="transition-colors hover:text-paper">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-accent">
                Blog
              </li>
            </ol>
          </nav>

          <h1 className="mt-8 max-w-[18ch] font-display text-4xl font-medium tracking-tight text-balance md:text-6xl">
            Get found. Convert more.{" "}
            <span className="text-accent">Automate the rest.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted md:text-lg">
            Plain-English guides on local search, schema markup, site speed and
            AI assistants — written from client work, not theory.
          </p>

          <ul
            aria-label="Topics covered"
            className="mt-8 flex flex-wrap items-center gap-2"
          >
            {categories.map((category) => (
              <li
                key={category}
                className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] tracking-wider text-muted uppercase"
              >
                {category}
              </li>
            ))}
          </ul>
        </header>

        {/* Featured: newest post gets the wide slot */}
        <article className="mb-4">
          <Link
            href={`/blog/${featured.slug}`}
            data-cursor="hover"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 p-8 transition-colors duration-500 hover:border-accent/40 md:p-12"
          >
            <div
              aria-hidden
              className="absolute -top-[40%] -right-[10%] size-[60%] rounded-full bg-accent/10 opacity-0 blur-[120px] transition-opacity duration-700 group-hover:opacity-100"
            />
            <p className="relative flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase">
              <span className="text-accent">{featured.category}</span>
              <span aria-hidden className="text-muted">
                ·
              </span>
              <span className="text-muted">Latest</span>
            </p>
            <h2 className="relative mt-5 max-w-[24ch] font-display text-3xl leading-tight font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-accent md:text-5xl">
              {featured.title}
            </h2>
            <p className="relative mt-5 max-w-2xl leading-relaxed text-muted">
              {featured.description}
            </p>
            <p className="relative mt-8 flex items-center gap-4 font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
              <time dateTime={featured.date}>
                {dateFormat.format(new Date(featured.date))}
              </time>
              <span aria-hidden>·</span>
              <span>{featured.readTime}</span>
              <span
                aria-hidden
                className="text-accent transition-transform duration-300 group-hover:translate-x-1"
              >
                Read →
              </span>
            </p>
          </Link>
        </article>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {rest.map((post) => (
            <li key={post.slug}>
              <article className="h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  data-cursor="hover"
                  className="group flex h-full flex-col rounded-2xl border border-line bg-ink-2 p-7 transition-colors duration-500 hover:border-accent/40"
                >
                  <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                    {post.category}
                  </p>
                  <h2 className="mt-4 font-display text-xl leading-snug font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-accent">
                    {post.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {post.description}
                  </p>
                  <p className="mt-auto flex items-center justify-between pt-6 font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
                    <time dateTime={post.date}>
                      {dateFormat.format(new Date(post.date))}
                    </time>
                    <span>{post.readTime}</span>
                  </p>
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-12 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          <a href="/feed.xml" className="transition-colors hover:text-accent">
            Subscribe via RSS ↗
          </a>
        </p>
      </main>
      <Footer />
    </>
  );
}
