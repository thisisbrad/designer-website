import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import MagneticButton from "@/components/MagneticButton";
import { availability, socials } from "@/data/contact";
import { services } from "@/data/services";
import { OWNER_NAME, SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

const TITLE = "Contact — Start a Project or Get a Free Audit";

const DESCRIPTION =
  "Get in touch about web design, SEO or an AI build. Every enquiry is read personally and answered within 48 hours — no account managers, no pitch decks.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "contact Beltowski Studio",
    "hire a web designer",
    "web design quote",
    "SEO consultation",
    "AI consultant contact",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: absoluteUrl("/contact"),
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const steps = [
  {
    step: "01",
    title: "You write",
    description:
      "Tell me what you're trying to fix and roughly when it needs to exist. Rough is fine — I'd rather have the real problem than a tidy brief.",
  },
  {
    step: "02",
    title: "I reply within 48 hours",
    description:
      "Personally, with either questions or a straight answer about whether I'm the right person for it. You won't get a templated nurture sequence.",
  },
  {
    step: "03",
    title: "A 20-minute call",
    description:
      "No pitch deck, no slides. We work out whether the thing you want is the thing that will actually move your numbers.",
  },
  {
    step: "04",
    title: "A fixed quote",
    description:
      "Scope, timeline and a fixed price in writing before anything starts. No hourly surprises and no change-order games.",
  },
];

const faq = [
  {
    question: "How quickly will I hear back?",
    answer:
      "Within 48 hours, usually a lot sooner. Every enquiry is read by me — there's no inbox triage team between you and the person who'd do the work.",
  },
  {
    question: "Do you take small projects?",
    answer:
      "Sometimes. A focused sprint — a landing page, an audit, an assistant build — is often a better first engagement than a full rebuild. If your budget doesn't fit what you're asking for, I'll say so rather than quietly scoping down the quality.",
  },
  {
    question: "Do you work outside Florida?",
    answer:
      "Most of my clients are elsewhere. I'm Florida-based and happy to meet in person locally, but the work runs remotely just as well — shared screens, staging links and written decisions beat meetings in most cases.",
  },
  {
    question: "What should I include in the first message?",
    answer:
      "Your site if you have one, what's not working, and any deadline that's real. Budget range helps too — not so I can charge to it, but so I can tell you immediately whether the scope you want is possible at that number.",
  },
  {
    question: "What if I'm not sure what I need?",
    answer:
      "That's common and it's fine. Start with the free audit — I'll look at your site and tell you where the bottleneck actually is, which is often not where people expect.",
  },
];

export default function Contact() {
  const url = `${SITE_URL}/contact`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${url}#contact`,
        url,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: "en-US",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#business` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "[data-speakable]"],
        },
        mainEntity: {
          "@type": "ContactPoint",
          "@id": `${url}#contactpoint`,
          contactType: "Sales and new business",
          email: SITE_EMAIL,
          url,
          areaServed: [
            { "@type": "State", name: "Florida" },
            { "@type": "Country", name: "United States" },
          ],
          availableLanguage: ["English", "Spanish"],
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
            opens: "09:00",
            closes: "18:00",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Contact", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faq.map((item) => ({
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

        {/* ---------- Hero ---------- */}
        <header className="mb-16 md:mb-20">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              <li>
                <Link href="/" className="transition-colors hover:text-content">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-accent">
                Contact
              </li>
            </ol>
          </nav>

          <h1 className="mt-10 max-w-[15ch] font-display text-4xl leading-[1.05] font-medium tracking-tight text-balance md:text-6xl">
            Let&apos;s build something{" "}
            <span className="text-accent">memorable.</span>
          </h1>

          <p
            data-speakable
            className="mt-7 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
          >
            Tell me about your project — a new site, an SEO push or an AI build.
            I read everything personally and reply within 48 hours.
          </p>
        </header>

        {/* ---------- Form + direct details ---------- */}
        <div className="grid gap-16 border-t border-line pt-16 lg:grid-cols-12 lg:gap-10 md:pt-20">
          <div className="lg:col-span-5">
            <h2 className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              Direct
            </h2>

            <a
              href={`mailto:${SITE_EMAIL}`}
              data-cursor="hover"
              className="mt-6 inline-block font-display text-2xl tracking-tight underline decoration-line underline-offset-8 transition-colors hover:text-accent hover:decoration-accent md:text-3xl"
            >
              {SITE_EMAIL}
            </a>

            <dl className="mt-10 flex flex-col gap-5 border-t border-line pt-8">
              {[
                { term: "Response time", detail: availability.responseTime },
                { term: "Availability", detail: availability.booking },
                { term: "Working hours", detail: availability.hours },
                { term: "Based in", detail: availability.base },
              ].map((item) => (
                <div key={item.term} className="flex flex-col gap-1">
                  <dt className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
                    {item.term}
                  </dt>
                  <dd className="text-content/85">{item.detail}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-12 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              Elsewhere
            </h2>
            <ul className="mt-6 flex flex-col gap-3" aria-label="Social links">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="hover"
                    className="group inline-flex items-baseline gap-3 transition-colors hover:text-content"
                  >
                    <span className="font-mono text-xs tracking-[0.2em] text-muted uppercase transition-colors group-hover:text-accent">
                      {social.label}
                    </span>
                    <span className="text-sm text-content/60">
                      {social.handle}
                    </span>
                    <span
                      aria-hidden
                      className="text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="mb-8 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              Send an enquiry
            </h2>
            <ContactForm idPrefix="page" location="contact_page" />
          </div>
        </div>

        {/* ---------- What happens next ---------- */}
        <section
          aria-labelledby="next-heading"
          className="mt-24 border-t border-line pt-16 md:mt-32 md:pt-20"
        >
          <p className="mb-5 font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            What happens next
          </p>
          <h2
            id="next-heading"
            className="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-balance md:text-5xl"
          >
            From your message to a fixed quote
          </h2>

          <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li
                key={step.step}
                className="rounded-2xl border border-line bg-surface-2 p-7"
              >
                <p className="font-mono text-xs text-accent">({step.step})</p>
                <h3 className="mt-5 font-display text-xl leading-snug font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Not-ready-yet path ---------- */}
        <section
          aria-labelledby="audit-heading"
          className="relative mt-20 overflow-hidden rounded-2xl border border-accent/25 p-8 md:mt-24 md:p-12"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-accent/10 via-surface-2 to-surface"
          />
          <div className="relative">
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              Not ready to talk yet?
            </p>
            <h2
              id="audit-heading"
              className="max-w-[22ch] font-display text-2xl font-medium tracking-tight text-balance md:text-4xl"
            >
              Start with the free audit instead.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">
              Send your URL and I&apos;ll run my 15-point check on design,
              speed, search and conversion, then send back what&apos;s costing
              you enquiries. No call required, no obligation.
            </p>
            <div className="mt-8">
              <MagneticButton href="/#audit">
                Get my free audit
                <span aria-hidden>↗</span>
              </MagneticButton>
            </div>
          </div>
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
            Before you write
          </h2>

          <dl className="mt-12 flex flex-col gap-4">
            {faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-line bg-surface-2 p-7 md:p-8"
              >
                <dt className="font-display text-lg font-medium tracking-tight md:text-xl">
                  {item.question}
                </dt>
                <dd className="mt-4 leading-relaxed text-muted">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------- Service entry points ---------- */}
        <section aria-labelledby="services-heading" className="mt-20 md:mt-24">
          <h2
            id="services-heading"
            className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase"
          >
            Enquiring about something specific?
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  data-cursor="hover"
                  className="group flex h-full items-baseline justify-between gap-4 rounded-2xl border border-line p-6 transition-colors duration-500 hover:border-accent/40"
                >
                  <span className="font-display text-lg font-medium tracking-tight transition-colors duration-300 group-hover:text-accent">
                    {service.title}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.15em] text-muted uppercase">
                    {service.priceRange}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-16 border-t border-line pt-8 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          <Link href="/about" className="transition-colors hover:text-accent">
            More about {OWNER_NAME} ↗
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
