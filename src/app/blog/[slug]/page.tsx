import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagneticButton from "@/components/MagneticButton";
import RichText from "@/components/RichText";
import ArticleToc from "@/components/ArticleToc";
import {
  getHeadings,
  getNeighbours,
  getPost,
  getRelated,
  getWordCount,
  posts,
} from "@/data/posts";
import { OWNER_NAME, SITE_NAME, SITE_URL } from "@/lib/site";
import { absoluteUrl, slugify } from "@/lib/seo";

type Params = { slug: string };

/** Unknown slugs 404 instead of being rendered on demand. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `/blog/${post.slug}`;

  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: OWNER_NAME, url: SITE_URL }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url: absoluteUrl(url),
      siteName: SITE_NAME,
      title: post.title,
      description: post.metaDescription,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [OWNER_NAME],
      section: post.category,
      tags: post.keywords,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
  };
}

/* Pinned to UTC: the dates in content files are date-only ISO strings, which
   Date parses as UTC midnight. Formatting those in a western timezone renders
   the day before — a post dated the 9th publishing as the 8th. */
const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "8 min read" → ISO 8601 duration for schema. */
function isoDuration(readTime: string) {
  const minutes = parseInt(readTime, 10);
  return Number.isFinite(minutes) ? `PT${minutes}M` : undefined;
}

export default async function BlogPost({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = absoluteUrl(`/blog/${post.slug}`);
  const ogImage = `${url}/opengraph-image`;
  const headings = getHeadings(post);
  const tocHeadings = [...headings, { id: "faq", text: "FAQ" }];
  const related = getRelated(post);
  const { newer, older } = getNeighbours(post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        alternativeHeadline: post.metaTitle,
        description: post.metaDescription,
        abstract: post.description,
        url,
        image: [ogImage],
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        author: { "@id": `${SITE_URL}/#owner` },
        publisher: { "@id": `${SITE_URL}/#business` },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isPartOf: { "@id": `${SITE_URL}/blog#blog` },
        keywords: post.keywords.join(", "),
        articleSection: post.category,
        wordCount: getWordCount(post),
        timeRequired: isoDuration(post.readTime),
        inLanguage: "en-US",
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
            name: "Blog",
            item: `${SITE_URL}/blog`,
          },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: post.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
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

        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
          <article data-article>
            <header>
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
                      href="/blog"
                      className="transition-colors hover:text-paper"
                    >
                      Blog
                    </Link>
                  </li>
                  <li aria-hidden>/</li>
                  <li aria-current="page" className="text-accent">
                    {post.category}
                  </li>
                </ol>
              </nav>

              <h1 className="mt-8 font-display text-4xl leading-[1.08] font-medium tracking-tight text-balance md:text-5xl">
                {post.title}
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-muted">
                {post.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 border-y border-line py-5">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-accent/30 bg-gradient-to-br from-[#242c1a] to-ink-2">
                  <Image
                    src="/portrait-face.png"
                    alt=""
                    width={44}
                    height={44}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <p className="font-display text-sm font-medium">
                    {OWNER_NAME}
                  </p>
                  <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
                    <time dateTime={post.date}>
                      {dateFormat.format(new Date(post.date))}
                    </time>{" "}
                    · {post.readTime}
                  </p>
                  {post.updated && post.updated !== post.date && (
                    <p className="font-mono text-[11px] tracking-[0.15em] text-muted/70 uppercase">
                      Updated{" "}
                      <time dateTime={post.updated}>
                        {dateFormat.format(new Date(post.updated))}
                      </time>
                    </p>
                  )}
                </div>
              </div>
            </header>

            {/* Snippet-friendly summary — also the speakable target */}
            <section
              data-speakable
              aria-label="Key takeaways"
              className="mt-10 rounded-2xl border border-accent/20 bg-ink-2 p-6 md:p-8"
            >
              <h2 className="font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
                Key takeaways
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {post.takeaways.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 leading-relaxed text-paper/85"
                  >
                    <span
                      aria-hidden
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Mobile contents — the sticky sidebar covers large screens */}
            {headings.length > 2 && (
              <details className="mt-8 rounded-2xl border border-line bg-ink-2 p-5 lg:hidden">
                <summary className="cursor-pointer font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
                  Contents
                </summary>
                <ol className="mt-4 flex flex-col gap-2.5">
                  {headings.map((heading, i) => (
                    <li key={heading.id} className="flex gap-3 text-sm">
                      <span className="font-mono text-[11px] text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <a
                        href={`#${heading.id}`}
                        className="text-muted transition-colors hover:text-paper"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <div className="mt-12 flex flex-col gap-10">
              {post.sections.map((section, i) => (
                <section
                  key={i}
                  id={section.heading ? slugify(section.heading) : undefined}
                  className="scroll-mt-28"
                >
                  {section.heading && (
                    <h2 className="mb-4 font-display text-2xl font-medium tracking-tight md:text-3xl">
                      {section.heading}
                    </h2>
                  )}
                  <div className="flex flex-col gap-4 leading-relaxed text-paper/80">
                    {section.paragraphs.map((paragraph, j) => (
                      <p key={j}>
                        <RichText text={paragraph} />
                      </p>
                    ))}
                  </div>
                  {section.list && (
                    <ul className="mt-5 flex flex-col gap-3">
                      {section.list.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 leading-relaxed text-paper/80"
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

              <section id="faq" className="scroll-mt-28">
                <h2 className="mb-6 font-display text-2xl font-medium tracking-tight md:text-3xl">
                  Frequently asked questions
                </h2>
                <dl className="flex flex-col gap-4">
                  {post.faq.map((item) => (
                    <div
                      key={item.question}
                      className="rounded-2xl border border-line bg-ink-2 p-6"
                    >
                      <dt className="font-display text-lg font-medium tracking-tight">
                        {item.question}
                      </dt>
                      <dd className="mt-3 leading-relaxed text-muted">
                        {item.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>

            {/* Topic-matched conversion hook */}
            <aside className="relative mt-16 overflow-hidden rounded-2xl border border-accent/25 p-8 md:p-10">
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-accent/10 via-ink-2 to-ink"
              />
              <div className="relative">
                <p className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
                  <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                  Free 15-point audit
                </p>
                <p className="font-display text-2xl font-medium tracking-tight text-balance md:text-3xl">
                  {post.cta.hook}
                </p>
                <p className="mt-3 max-w-lg leading-relaxed text-muted">
                  {post.cta.copy}
                </p>
                <div className="mt-7">
                  <MagneticButton href="/#audit">
                    {post.cta.button}
                    <span aria-hidden>↗</span>
                  </MagneticButton>
                </div>
              </div>
            </aside>

            {/* Author credentials — experience and accountability signals */}
            <section
              aria-label="About the author"
              className="mt-12 flex flex-col gap-5 rounded-2xl border border-line bg-ink-2 p-7 sm:flex-row sm:items-start md:p-8"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-accent/30 bg-gradient-to-br from-[#242c1a] to-ink-2">
                <Image
                  src="/portrait-face.png"
                  alt={OWNER_NAME}
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              </div>
              <div>
                <p className="font-display text-lg font-medium tracking-tight">
                  {OWNER_NAME}
                </p>
                <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                  Designer, developer &amp; AI consultant
                </p>
                <p className="mt-4 leading-relaxed text-muted">
                  Nine years building websites that get found and convert —
                  technical SEO, conversion design and AI assistants for
                  startups, agencies and local businesses. Everything here comes
                  out of client work, not theory.
                </p>
                <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-[0.15em] uppercase">
                  <Link
                    href="/#about"
                    className="text-muted transition-colors hover:text-accent"
                  >
                    More about me ↗
                  </Link>
                  <Link
                    href="/#audit"
                    className="text-muted transition-colors hover:text-accent"
                  >
                    Free audit ↗
                  </Link>
                </p>
              </div>
            </section>

            {/* Publish-order navigation keeps the archive shallow to crawl */}
            {(newer || older) && (
              <nav
                aria-label="More articles"
                className="mt-12 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
              >
                {newer ? (
                  <Link
                    href={`/blog/${newer.slug}`}
                    className="group rounded-2xl border border-line p-5 transition-colors hover:border-accent/40"
                  >
                    <span className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                      ← Newer
                    </span>
                    <span className="mt-2 block font-display text-lg font-medium tracking-tight transition-colors group-hover:text-accent">
                      {newer.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {older && (
                  <Link
                    href={`/blog/${older.slug}`}
                    className="group rounded-2xl border border-line p-5 text-right transition-colors hover:border-accent/40 sm:col-start-2"
                  >
                    <span className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                      Older →
                    </span>
                    <span className="mt-2 block font-display text-lg font-medium tracking-tight transition-colors group-hover:text-accent">
                      {older.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}

            {related.length > 0 && (
              <section aria-labelledby="related-heading" className="mt-16">
                <h2
                  id="related-heading"
                  className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase"
                >
                  Keep reading
                </h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/blog/${item.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-line bg-ink-2 p-6 transition-colors hover:border-accent/40"
                      >
                        <span className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                          {item.category}
                        </span>
                        <span className="mt-3 font-display text-lg leading-snug font-medium tracking-tight text-balance transition-colors group-hover:text-accent">
                          {item.title}
                        </span>
                        <span className="mt-auto pt-4 font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
                          {item.readTime}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {headings.length > 2 && (
            <aside className="hidden lg:sticky lg:top-28 lg:block">
              <ArticleToc headings={tocHeadings} />
            </aside>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
