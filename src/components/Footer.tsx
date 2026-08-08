"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { services } from "@/data/services";
import { SITE_EMAIL } from "@/lib/site";
import { scrollToTop } from "./SmoothScroll";

/** Sitewide links so every page — blog posts included — reaches the money pages. */
const explore = [
  { href: "/services", label: "All services" },
  { href: "/blog", label: "Blog" },
  { href: "/#solutions", label: "The plan" },
  { href: "/#about", label: "About" },
  { href: "/#experiments", label: "AI in action" },
];

export default function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/New_York",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-line">
      <nav
        aria-label="Footer"
        className="mx-auto grid max-w-[1400px] gap-12 px-6 py-16 md:grid-cols-12 md:gap-8 md:px-10 md:py-20"
      >
        <div className="md:col-span-4">
          <p className="font-display text-lg font-semibold tracking-tight">
            beltowski<span className="text-accent">®</span>
          </p>
          <p className="mt-4 max-w-xs leading-relaxed text-muted">
            Web design, SEO marketing and AI solutions for businesses that would
            rather be found than admired.
          </p>
          <a
            href={`mailto:${SITE_EMAIL}`}
            data-cursor="hover"
            className="mt-6 inline-block font-mono text-[11px] tracking-[0.2em] text-muted uppercase transition-colors hover:text-accent"
          >
            {SITE_EMAIL} ↗
          </a>
        </div>

        <div className="md:col-span-5">
          <h2 className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            Services
          </h2>
          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  data-cursor="hover"
                  className="text-sm text-paper/70 transition-colors hover:text-accent"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            Explore
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {explore.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  data-cursor="hover"
                  className="text-sm text-paper/70 transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-5 px-6 py-10 font-mono text-[11px] tracking-[0.2em] text-muted uppercase md:flex-row md:px-10">
          <p>© 2026 Beltowski Studio</p>
          <p>
            Florida —{" "}
            <time suppressHydrationWarning className="tabular-nums">
              {time || "··:··:··"}
            </time>{" "}
            ET
          </p>
          <p>Designed &amp; built by hand</p>
          <button
            type="button"
            onClick={scrollToTop}
            data-cursor="hover"
            className="transition-colors hover:text-accent"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
