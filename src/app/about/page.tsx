import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MagneticButton from "@/components/MagneticButton";
import { services } from "@/data/services";
import { OWNER_NAME, SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const TITLE = "About Brad Beltowski — Designer & Developer";

const DESCRIPTION =
  "Nine years designing and building websites that get found and convert — technical SEO, conversion design and AI assistants, all delivered by one person.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Brad Beltowski",
    "Florida web designer",
    "freelance web developer",
    "independent designer developer",
    "AI consultant Florida",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    url: absoluteUrl("/about"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const principles = [
  {
    title: "The person who designs it, builds it",
    description:
      "Nothing survives a hand-off intact. When the same person draws the layout and writes the code, the compromises get made knowingly instead of discovered at launch.",
  },
  {
    title: "Search is an architecture problem",
    description:
      "SEO bolted on afterwards is a tax. Built into the URL structure, the markup and the content model from day one, it costs nothing extra and compounds for years.",
  },
  {
    title: "Fast is a feature, not a nice-to-have",
    description:
      "Every second of load time is a share of your visitors leaving. I work to a performance budget from the first commit rather than optimising after the fact.",
  },
  {
    title: "Say the true thing",
    description:
      "If a redesign won't fix your problem, I'll tell you — even when the redesign is what you came to buy. Long engagements are built on being right, not agreeable.",
  },
  {
    title: "You own everything",
    description:
      "Repositories, hosting, analytics, domains, AI accounts. Nothing is held hostage, and leaving is always a decision rather than a migration project.",
  },
  {
    title: "No account layer",
    description:
      "You talk to the person doing the work. There's no project manager relaying your feedback into a queue and back again with the meaning worn off.",
  },
];

const timeline = [
  {
    period: "2017 — 2019",
    title: "Design first",
    description:
      "Started where most do: visual design for agencies and small businesses, handing files to developers and watching a third of the intent evaporate in translation.",
  },
  {
    period: "2019 — 2022",
    title: "Learning to ship",
    description:
      "Went deep on frontend engineering to close that gap — React, TypeScript, performance work — and stopped designing anything I couldn't build myself.",
  },
  {
    period: "2022 — 2024",
    title: "Found by search",
    description:
      "Clients kept asking the same question: the site is beautiful, why isn't anyone finding it? Technical SEO and local search became a core discipline rather than a referral.",
  },
  {
    period: "2024 — now",
    title: "Design, search, AI",
    description:
      "Added production AI work — assistants that qualify and book, automations that clear the busywork — because the same clients now need it and most vendors are selling toys.",
  },
];

const stats = [
  { value: "9", label: "Years of practice" },
  { value: "100%", label: "Of the work done by me" },
  { value: "48h", label: "Max reply time" },
  { value: "0", label: "Templates used" },
];

export default function About() {
  const url = `${SITE_URL}/about`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${url}#about`,
        url,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en-US",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        // The page is *about* the owner — this is what ties the Person entity
        // in the sitewide graph to a page that actually evidences it.
        mainEntity: { "@id": `${SITE_URL}/#owner` },
        about: { "@id": `${SITE_URL}/#owner` },
        primaryImageOfPage: `${SITE_URL}/portrait-face.png`,
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-speakable]"],
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#owner`,
        name: OWNER_NAME,
        // No `url` here — the sitewide graph in layout.tsx owns that property,
        // and two values on one merged @id is ambiguous.
        mainEntityOfPage: { "@id": `${url}#about` },
        email: SITE_EMAIL,
        image: `${SITE_URL}/portrait-face.png`,
        jobTitle: "Designer, developer & AI consultant",
        description: DESCRIPTION,
        worksFor: { "@id": `${SITE_URL}/#business` },
        knowsLanguage: ["English"],
        knowsAbout: services.map((service) => service.title),
        hasOccupation: {
          "@type": "Occupation",
          name: "Web designer and developer",
          occupationLocation: { "@type": "State", name: "Florida" },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "About", item: url },
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

        {/* ---------- Hero ---------- */}
        <header className="mb-20 md:mb-28">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              <li>
                <Link href="/" className="transition-colors hover:text-paper">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-accent">
                About
              </li>
            </ol>
          </nav>

          <p className="mt-10 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            {OWNER_NAME} — Florida, US
          </p>

          <h1 className="mt-6 max-w-[16ch] font-display text-4xl leading-[1.05] font-medium tracking-tight text-balance md:text-6xl">
            Design-minded developer.{" "}
            <span className="text-accent">Growth-minded partner.</span>
          </h1>

          <p
            data-speakable
            className="mt-7 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
          >
            I&apos;m an independent designer and developer with nine years of
            practice building websites that don&apos;t just look premium — they
            get found, and they convert.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton href="/contact">
              Start a project
              <span aria-hidden>↗</span>
            </MagneticButton>
            <MagneticButton href="/#audit" variant="outline">
              Get a free audit
            </MagneticButton>
          </div>
        </header>

        {/* ---------- Story ---------- */}
        <section
          aria-labelledby="story-heading"
          className="grid gap-12 border-t border-line pt-16 md:grid-cols-12 md:gap-10 md:pt-20"
        >
          <div className="md:col-span-5">
            {/* Square: both portrait assets are 512², so a taller frame would
                upscale and crop the face. The glow sits low and dim — the PNG
                has an alpha channel, and anything brighter behind it tints
                straight through the skin. */}
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-ink-2 to-[#16190f]">
              <div
                aria-hidden
                className="absolute -bottom-[20%] left-1/2 size-[70%] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
              />
              <Image
                src="/portrait-duotone.png"
                alt={`${OWNER_NAME}, designer and developer`}
                width={512}
                height={512}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="relative size-full object-cover"
                priority
              />
              {/* Scrim: the caption otherwise sits on the lit side of the
                  duotone and drops below readable contrast. */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/90 to-transparent"
              />
              <p className="absolute bottom-5 left-5 font-mono text-[11px] tracking-[0.25em] text-paper/70 uppercase">
                Studio portrait — Florida, 2026
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse bg-ink p-6">
                  <dt className="mt-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                    {stat.label}
                  </dt>
                  <dd className="font-display text-3xl font-medium tracking-tight text-accent">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <h2
              id="story-heading"
              className="font-display text-3xl font-medium tracking-tight text-balance md:text-4xl"
            >
              How I ended up doing all three
            </h2>
            <div className="mt-8 flex flex-col gap-5 leading-relaxed text-muted">
              <p className="font-display text-xl leading-relaxed font-medium tracking-tight text-balance text-paper md:text-2xl">
                Most of what I know came from watching good work fail for
                reasons nobody in the room was responsible for.
              </p>
              <p>
                I started as a designer handing files to developers. The sites
                that came back were never quite the thing I&apos;d drawn — not
                through anyone&apos;s fault, just the slow leak that happens
                whenever intent crosses a hand-off. So I learned to build, and
                stopped designing anything I couldn&apos;t ship myself.
              </p>
              <p>
                Then a different failure kept repeating. Clients loved their new
                sites and still weren&apos;t getting enquiries, because being
                beautiful and being findable turn out to be unrelated problems.
                That pushed me into technical SEO and local search, which is
                mostly unglamorous engineering rather than marketing.
              </p>
              <p>
                AI arrived the same way — as a client problem, not a trend. The
                enquiries were coming in at 2am and going cold by morning. So I
                learned to build assistants that answer accurately and book
                properly, and to be honest about the ones that shouldn&apos;t be
                built at all.
              </p>
              <p>
                Today the three sit together:{" "}
                <Link
                  href="/services/web-design"
                  className="text-paper underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  design
                </Link>
                ,{" "}
                <Link
                  href="/services/seo-marketing"
                  className="text-paper underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  search
                </Link>{" "}
                and{" "}
                <Link
                  href="/services/ai-solutions"
                  className="text-paper underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  AI
                </Link>{" "}
                — because in practice a business rarely has only one of those
                problems.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Principles ---------- */}
        <section
          aria-labelledby="principles-heading"
          className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-20"
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            How I work
          </p>
          <h2
            id="principles-heading"
            className="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            Six things I don&apos;t compromise on
          </h2>

          <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle, i) => (
              <li
                key={principle.title}
                className="group rounded-2xl border border-line bg-ink-2 p-7 transition-colors duration-500 hover:border-accent/40"
              >
                <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 font-display text-xl leading-snug font-medium tracking-tight text-balance transition-colors duration-300 group-hover:text-accent">
                  {principle.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {principle.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Timeline ---------- */}
        <section
          aria-labelledby="timeline-heading"
          className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-20"
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            Background
          </p>
          <h2
            id="timeline-heading"
            className="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            Nine years, in four moves
          </h2>

          <ol className="mt-14 border-t border-line">
            {timeline.map((entry) => (
              <li key={entry.period} className="group border-b border-line">
                <div className="grid gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-6 md:py-10">
                  <span className="font-mono text-xs text-accent md:col-span-2">
                    {entry.period}
                  </span>
                  <h3 className="font-display text-2xl font-medium tracking-tight transition-all duration-500 group-hover:translate-x-2 group-hover:text-accent md:col-span-3 md:text-3xl">
                    {entry.title}
                  </h3>
                  <p className="leading-relaxed text-muted md:col-span-7">
                    {entry.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Capabilities ---------- */}
        <section
          aria-labelledby="capabilities-heading"
          className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-20"
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            Disciplines
          </p>
          <h2
            id="capabilities-heading"
            className="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            What you can actually hire me for
          </h2>

          <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  data-cursor="hover"
                  className="group flex h-full flex-col rounded-2xl border border-line p-6 transition-colors duration-500 hover:border-accent/40"
                >
                  <span className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                    {service.category}
                  </span>
                  <span className="mt-3 font-display text-lg leading-snug font-medium tracking-tight transition-colors duration-300 group-hover:text-accent">
                    {service.title}
                  </span>
                  <span className="mt-3 text-sm leading-relaxed text-muted">
                    {service.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- The lab ---------- */}
        <section
          aria-labelledby="lab-heading"
          className="mt-24 grid gap-10 border-t border-line pt-16 md:mt-32 md:grid-cols-12 md:pt-20"
        >
          <div className="md:col-span-5">
            <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              The lab
            </p>
            <h2
              id="lab-heading"
              className="font-display text-3xl font-medium tracking-tight text-balance md:text-4xl"
            >
              The experiments pay for themselves
            </h2>
          </div>
          <div className="flex flex-col gap-5 leading-relaxed text-muted md:col-span-6 md:col-start-7">
            <p>
              Alongside client work I keep a running practice of experiments — AI
              agents, SEO tooling, interaction studies, rendering tricks that may
              never ship to anyone. It isn&apos;t a hobby line on a CV; it&apos;s
              how the commercial work stays ahead of what an agency can quote
              from a template.
            </p>
            <p>
              Most of what I now sell as AI work started as something built for
              myself first. The lab feeds the studio; the studio funds the lab.
            </p>
            <p className="flex flex-wrap gap-x-6 gap-y-2 pt-2 font-mono text-[11px] tracking-[0.2em] uppercase">
              <Link
                href="/#experiments"
                className="text-muted transition-colors hover:text-accent"
              >
                See AI in action ↗
              </Link>
              <Link
                href="/blog"
                className="text-muted transition-colors hover:text-accent"
              >
                Read the blog ↗
              </Link>
            </p>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <aside className="relative mt-20 overflow-hidden rounded-2xl border border-accent/25 p-8 md:mt-24 md:p-12">
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-accent/10 via-ink-2 to-ink"
          />
          <div className="relative">
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              20 minutes · No pitch deck
            </p>
            <p className="max-w-[20ch] font-display text-2xl font-medium tracking-tight text-balance md:text-4xl">
              Tell me what&apos;s not working. I&apos;ll tell you if I can help.
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">
              An intro call, not a sales call. If your problem isn&apos;t
              something I&apos;m the right person for, I&apos;ll say so and point
              you at someone who is.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <MagneticButton href="/contact">
                Get in touch
                <span aria-hidden>↗</span>
              </MagneticButton>
              <MagneticButton href={`mailto:${SITE_EMAIL}`} variant="outline">
                {SITE_EMAIL}
              </MagneticButton>
            </div>
          </div>
        </aside>
      </main>
      <Footer />
    </>
  );
}
