"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  analyticsDebug,
  analyticsEnabled,
  adsEnabled,
} from "@/lib/analytics/config";
import { captureAttribution } from "@/lib/analytics/attribution";
import {
  trackEmailClick,
  trackOutboundClick,
  trackPageView,
  trackPhoneClick,
  trackScrollDepth,
  trackSectionView,
} from "@/lib/analytics/events";

/**
 * Loads gtag.js and runs the ambient measurement that does not belong to any
 * single component: page views, scroll depth, section visibility, and clicks
 * on links that leave the site.
 *
 * The consent defaults are *not* set here — they are inlined in <head> by the
 * layout so they execute before this script ever loads. See lib/analytics/consent.
 *
 * Deliberately reads `window.location` rather than `useSearchParams()`: the
 * hook forces every page into dynamic rendering unless each one is wrapped in
 * a Suspense boundary, and this site is otherwise fully static. Query-only
 * navigations are not a thing here, and an ad landing with `?gclid=` is an
 * initial load, which the pathname effect already covers.
 */

/** Milestones worth knowing about. Below 25% is noise; above 90% is the footer. */
const SCROLL_MILESTONES = [25, 50, 75, 90];

export default function Analytics() {
  const pathname = usePathname();

  // Cleared on every navigation so milestones are per-page, not per-session.
  const firedScroll = useRef(new Set<number>());
  const seenSections = useRef(new Set<string>());

  /* ---- page views + attribution ---- */
  useEffect(() => {
    captureAttribution();
    trackPageView(pathname);

    firedScroll.current = new Set();
    seenSections.current = new Set();
  }, [pathname]);

  /* ---- scroll depth ---- */
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;

      // Short pages are fully visible on load; reporting 90% there would
      // overstate engagement rather than measure it.
      if (scrollable < 400) return;

      const percent = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;

      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !firedScroll.current.has(milestone)) {
          firedScroll.current.add(milestone);
          trackScrollDepth(milestone, pathname);
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    measure();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  /* ---- section visibility ---- */
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!entry.isIntersecting || seenSections.current.has(id)) continue;
          seenSections.current.add(id);
          trackSectionView(id, pathname);
        }
      },
      // A third of the section on screen means it was reached, not skimmed past.
      { threshold: 0.33 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  /* ---- outbound, mailto and tel clicks ---- */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest?.("a");
      if (!link) return;

      const href = link.getAttribute("href") ?? "";
      // Nearest identified section is a better label than the raw path.
      const location = link.closest("section[id]")?.id ?? pathname;

      if (href.startsWith("mailto:")) {
        trackEmailClick(location);
        return;
      }
      if (href.startsWith("tel:")) {
        trackPhoneClick(location);
        return;
      }
      if (!/^https?:/i.test(href)) return;

      try {
        if (new URL(href).hostname !== window.location.hostname) {
          trackOutboundClick(href, location);
        }
      } catch {
        /* malformed href — nothing to report */
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);

  // No property configured: the hooks above still run (and still log under
  // NEXT_PUBLIC_ANALYTICS_DEBUG), but nothing is loaded or sent.
  if (!analyticsEnabled && !adsEnabled) return null;

  const primaryId = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;

  return (
    <Script
      id="gtag-js"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
      onError={() => {
        if (analyticsDebug) {
          // eslint-disable-next-line no-console
          console.warn("[analytics] gtag.js blocked or failed to load");
        }
      }}
    />
  );
}
