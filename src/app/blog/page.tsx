import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { posts } from "@/data/posts";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog — SEO, AI & web advice for businesses",
  description:
    "Plain-English guides on local SEO, schema markup, site speed and AI assistants — how businesses get found, convert visitors and automate the busywork.",
  alternates: { canonical: "/blog" },
};

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function BlogIndex() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name: "Beltowski Studio Blog",
    description: metadata.description,
    publisher: { "@id": `${SITE_URL}/#business` },
    blogPost: sorted.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${SITE_URL}/blog/${post.slug}#article`,
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date,
    })),
  };

  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto max-w-[1400px] px-6 pt-36 pb-24 md:px-10 md:pt-44 md:pb-32">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <header className="mb-16 md:mb-24">
          <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-muted uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Blog
          </p>
          <h1 className="max-w-[18ch] font-display text-4xl font-medium tracking-tight text-balance md:text-6xl">
            Get found. Convert more. <span className="text-accent">Automate the rest.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted md:text-lg">
            Plain-English guides on local search, schema markup, site speed and
            AI assistants — written from client work, not theory.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <li key={post.slug}>
              <article className="h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  data-cursor="hover"
                  className="group flex h-full flex-col rounded-2xl border border-line bg-ink-2 p-7 transition-colors duration-500 hover:border-accent/40 md:p-8"
                >
                  <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                    {post.category}
                  </p>
                  <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-accent">
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
      </main>
      <Footer />
    </>
  );
}
