import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagneticButton from "@/components/MagneticButton";
import { getPost, posts } from "@/data/posts";
import { OWNER_NAME, SITE_URL } from "@/lib/site";

type Params = { slug: string };

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

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [OWNER_NAME],
    },
  };
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function BlogPost({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        url,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          "@type": "Person",
          name: OWNER_NAME,
          url: SITE_URL,
        },
        publisher: { "@id": `${SITE_URL}/#business` },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        keywords: post.keywords.join(", "),
        articleSection: post.category,
        inLanguage: "en",
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
      ...(post.faq
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: post.faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto max-w-[1400px] px-6 pt-36 pb-24 md:px-10 md:pt-44 md:pb-32">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <article className="mx-auto max-w-3xl">
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

            <div className="mt-8 flex items-center gap-4 border-y border-line py-5">
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
                <p className="font-display text-sm font-medium">{OWNER_NAME}</p>
                <p className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
                  <time dateTime={post.date}>
                    {dateFormat.format(new Date(post.date))}
                  </time>{" "}
                  · {post.readTime}
                </p>
              </div>
            </div>
          </header>

          <div className="mt-12 flex flex-col gap-10">
            {post.sections.map((section, i) => (
              <section key={i}>
                {section.heading && (
                  <h2 className="mb-4 font-display text-2xl font-medium tracking-tight md:text-3xl">
                    {section.heading}
                  </h2>
                )}
                <div className="flex flex-col gap-4 leading-relaxed text-paper/80">
                  {section.paragraphs.map((paragraph, j) => (
                    <p key={j}>{paragraph}</p>
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
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {post.faq && (
              <section>
                <h2 className="mb-6 font-display text-2xl font-medium tracking-tight md:text-3xl">
                  Frequently asked questions
                </h2>
                <dl className="flex flex-col gap-6">
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
            )}
          </div>

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
        </article>
      </main>
      <Footer />
    </>
  );
}
