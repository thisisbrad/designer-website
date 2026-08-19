"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { locations, locationServices, type Location } from "@/data/locations";
import { services } from "@/data/services";
import { useSectionReveal } from "@/hooks/useGSAPAnimations";
import SectionHeading from "./SectionHeading";
import { cn, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Plot geometry — every number below is derived from the same geo    */
/* data the location pages publish in their schema, so the instrument */
/* can't drift out of sync with what the site claims.                 */
/* ------------------------------------------------------------------ */

const PAD_DEG = 0.24;
const KM_PER_DEG = 111.32;
const GRID_STEP = 0.5;

const lats = locations.map((l) => l.geo.latitude);
const lngs = locations.map((l) => l.geo.longitude);
const MIN_LAT = Math.min(...lats) - PAD_DEG;
const MAX_LAT = Math.max(...lats) + PAD_DEG;
const MIN_LNG = Math.min(...lngs) - PAD_DEG;
const MAX_LNG = Math.max(...lngs) + PAD_DEG;
const LAT_SPAN = MAX_LAT - MIN_LAT;
const LNG_SPAN = MAX_LNG - MIN_LNG;

/* East–west degrees shrink with latitude; without this correction the
   plot would stretch Florida sideways. */
const PLOT_ASPECT =
  (LNG_SPAN * Math.cos(((MIN_LAT + MAX_LAT) / 2) * (Math.PI / 180))) / LAT_SPAN;

const xOfLng = (lng: number) => ((lng - MIN_LNG) / LNG_SPAN) * 100;
const yOfLat = (lat: number) => ((MAX_LAT - lat) / LAT_SPAN) * 100;

const pointOf = (loc: Location) => ({
  x: xOfLng(loc.geo.longitude),
  y: yOfLat(loc.geo.latitude),
});

/** Ring diameter as % of plot height — the honest service radius, drawn. */
const ringSize = (loc: Location) =>
  ((2 * loc.radiusKm) / KM_PER_DEG / LAT_SPAN) * 100;

const gridValues = (min: number, max: number) => {
  const out: number[] = [];
  for (let v = Math.ceil(min / GRID_STEP) * GRID_STEP; v < max; v += GRID_STEP) {
    out.push(Math.round(v * 2) / 2);
  }
  return out;
};

const LAT_LINES = gridValues(MIN_LAT, MAX_LAT);
const LNG_LINES = gridValues(MIN_LNG, MAX_LNG);

/** Airport-style idents — the real FAA code where the market has one. */
const MARKET_CODES: Record<string, string> = {
  orlando: "ORL",
  melbourne: "MLB",
  "lake-mary": "LKM",
  lakeland: "LAL",
  "daytona-beach": "DAB",
  "vero-beach": "VRB",
};

const fmtCoord = (lat: number, lng: number) =>
  `${lat.toFixed(4)}°N · ${Math.abs(lng).toFixed(4)}°W`;

/* The service × market pairs that actually have a page. */
const localPairs = new Set(
  locationServices.map((item) => `${item.service}/${item.location}`)
);
const servicesFor = (locationSlug: string) =>
  services.filter((s) => localPairs.has(`${s.slug}/${locationSlug}`));

const AREAS_SHOWN = 6;

const HOME = locations[0];
const HOME_POINT = pointOf(HOME);
const HOME_COORD = fmtCoord(HOME.geo.latitude, HOME.geo.longitude);

export default function ServiceAreas() {
  const sectionRef = useSectionReveal<HTMLElement>();
  const [active, setActive] = useState(HOME.slug);
  const activeLoc = locations.find((l) => l.slug === active) ?? HOME;

  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const crossVRef = useRef<HTMLSpanElement>(null);
  const crossHRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  /* GSAP owns these spans' text after mount; their JSX children stay the
     initial strings so React reconciliation never fights the tween. The whole
     readout follows the crosshair — including on hover preview — so the
     instrument never shows one market's code beside another's coordinates. */
  const codeRef = useRef<HTMLSpanElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);
  const radiusRef = useRef<HTMLSpanElement>(null);
  const coordState = useRef({
    lat: HOME.geo.latitude,
    lng: HOME.geo.longitude,
  });
  const firstRender = useRef(true);

  const moveTo = (loc: Location) => {
    const { x, y } = pointOf(loc);
    const instant = prefersReducedMotion();
    const opts = {
      duration: instant ? 0 : 0.8,
      ease: "power3.inOut",
      overwrite: "auto" as const,
    };
    if (crossVRef.current) gsap.to(crossVRef.current, { left: `${x}%`, ...opts });
    if (crossHRef.current) gsap.to(crossHRef.current, { top: `${y}%`, ...opts });
    if (ringRef.current) {
      gsap.to(ringRef.current, {
        left: `${x}%`,
        top: `${y}%`,
        height: `${ringSize(loc)}%`,
        ...opts,
      });
    }
    if (codeRef.current) codeRef.current.textContent = MARKET_CODES[loc.slug];
    if (radiusRef.current) {
      radiusRef.current.textContent = `${loc.radiusKm} km radius`;
    }
    gsap.to(coordState.current, {
      lat: loc.geo.latitude,
      lng: loc.geo.longitude,
      ...opts,
      onUpdate: () => {
        if (coordRef.current) {
          coordRef.current.textContent = fmtCoord(
            coordState.current.lat,
            coordState.current.lng
          );
        }
      },
    });
  };

  /* Selection drives the instrument and the panel entrance together. */
  useIsomorphicLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    moveTo(activeLoc);
    if (prefersReducedMotion()) return;
    const panel = sectionRef.current?.querySelector(
      "[role='tabpanel']:not([hidden])"
    );
    if (!panel) return;
    gsap.fromTo(
      panel.querySelectorAll("[data-panel-item]"),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.05 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const onTablistKeyDown = (e: React.KeyboardEvent) => {
    const idx = locations.findIndex((l) => l.slug === active);
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      next = (idx + 1) % locations.length;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      next = (idx - 1 + locations.length) % locations.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = locations.length - 1;
    }
    if (next === -1) return;
    e.preventDefault();
    const slug = locations[next].slug;
    setActive(slug);
    tabRefs.current[slug]?.focus();
  };

  return (
    <section
      id="service-areas"
      ref={sectionRef}
      aria-labelledby="service-areas-heading"
      className="mt-24 scroll-mt-24 md:mt-32"
    >
      <SectionHeading
        eyebrow="Service areas — Florida"
        id="service-areas-heading"
        title="Six markets, mapped honestly."
        description="A local page only exists where the market genuinely changes the work — Orlando's tourist split isn't the Space Coast's procurement check. Find your market, or work with me from anywhere."
      />

      <div
        data-reveal
        className="relative overflow-hidden rounded-2xl border border-line bg-surface-2/80"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-accent/[0.05] blur-[130px]"
        />

        <div className="relative grid divide-y divide-line lg:grid-cols-[minmax(0,4fr)_minmax(0,4.5fr)_minmax(0,4.5fr)] lg:divide-x lg:divide-y-0">
          {/* ---------- Market selector ---------- */}
          <div
            role="tablist"
            aria-label="Florida markets"
            aria-orientation="vertical"
            className="flex flex-col p-6 md:p-8"
            onKeyDown={onTablistKeyDown}
            onPointerLeave={() => moveTo(activeLoc)}
          >
            {locations.map((loc) => {
              const selected = loc.slug === active;
              const counties = loc.counties.length;
              return (
                <button
                  key={loc.slug}
                  ref={(el) => {
                    tabRefs.current[loc.slug] = el;
                  }}
                  role="tab"
                  id={`area-tab-${loc.slug}`}
                  aria-label={`${loc.city}, ${loc.region}`}
                  aria-selected={selected}
                  aria-controls={`area-panel-${loc.slug}`}
                  tabIndex={selected ? 0 : -1}
                  data-cursor="hover"
                  className="group flex w-full items-baseline justify-between gap-4 border-b border-line px-1 py-4 text-left transition-colors first:border-t last:border-b-0 lg:last:border-b"
                  onClick={() => setActive(loc.slug)}
                  onFocus={() => setActive(loc.slug)}
                  onPointerEnter={() => moveTo(loc)}
                >
                  <span>
                    <span
                      className={cn(
                        "font-display text-xl font-medium tracking-tight transition-colors duration-300 md:text-2xl",
                        selected ? "text-accent" : "group-hover:text-accent"
                      )}
                    >
                      {loc.city}
                    </span>
                    <span className="mt-1.5 block font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                      {loc.metroLabel} · {counties}{" "}
                      {counties > 1 ? "counties" : "county"}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "font-mono text-[11px] tracking-[0.2em] transition-colors duration-300",
                      selected ? "text-accent" : "text-muted"
                    )}
                  >
                    {MARKET_CODES[loc.slug]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ---------- Surveyor's plot ---------- */}
          <div className="flex flex-col items-center justify-center p-6 md:p-8">
            <div className="w-full max-w-[380px]">
              <div
                aria-hidden
                className="relative w-full overflow-hidden rounded-xl border border-line bg-surface/60"
                style={{ aspectRatio: String(PLOT_ASPECT) }}
              >
                {/* Degree grid */}
                <svg
                  className="absolute inset-0 size-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {LAT_LINES.map((lat) => (
                    <line
                      key={`lat-${lat}`}
                      x1="0"
                      x2="100"
                      y1={yOfLat(lat)}
                      y2={yOfLat(lat)}
                      stroke="var(--color-line)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  {LNG_LINES.map((lng) => (
                    <line
                      key={`lng-${lng}`}
                      x1={xOfLng(lng)}
                      x2={xOfLng(lng)}
                      y1="0"
                      y2="100"
                      stroke="var(--color-line)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>

                {/* Degree labels */}
                {LAT_LINES.map((lat) => (
                  <span
                    key={`lat-label-${lat}`}
                    className="absolute left-1.5 -translate-y-1/2 font-mono text-[9px] text-muted/60"
                    style={{ top: `${yOfLat(lat)}%` }}
                  >
                    {lat.toFixed(1)}°N
                  </span>
                ))}
                {LNG_LINES.map((lng) => (
                  <span
                    key={`lng-label-${lng}`}
                    className="absolute bottom-1 -translate-x-1/2 font-mono text-[9px] text-muted/60"
                    style={{ left: `${xOfLng(lng)}%` }}
                  >
                    {Math.abs(lng).toFixed(1)}°W
                  </span>
                ))}

                {/* Crosshair */}
                <span
                  ref={crossVRef}
                  className="absolute inset-y-0 w-px bg-accent/30"
                  style={{ left: `${HOME_POINT.x}%` }}
                />
                <span
                  ref={crossHRef}
                  className="absolute inset-x-0 h-px bg-accent/30"
                  style={{ top: `${HOME_POINT.y}%` }}
                />

                {/* Service radius ring + traveling marker */}
                <span
                  ref={ringRef}
                  className="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${HOME_POINT.x}%`,
                    top: `${HOME_POINT.y}%`,
                    height: `${ringSize(HOME)}%`,
                  }}
                >
                  <span className="absolute inset-0 rounded-full border border-dashed border-accent/50" />
                  <span className="absolute inset-0 rounded-full bg-accent/[0.06] blur-md" />
                  <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
                </span>

                {/* Market dots */}
                {locations.map((loc) => {
                  const { x, y } = pointOf(loc);
                  const labelLeft = x > 66;
                  return (
                    <span
                      key={loc.slug}
                      className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-content/50"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <span
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-[0.15em] whitespace-nowrap transition-colors duration-300",
                          labelLeft ? "right-full mr-2" : "left-full ml-2",
                          loc.slug === active ? "text-accent" : "text-muted"
                        )}
                      >
                        {MARKET_CODES[loc.slug]}
                      </span>
                    </span>
                  );
                })}
              </div>

              {/* Instrument readout */}
              <p className="mt-4 flex items-baseline justify-between gap-4 font-mono text-[10px] tracking-[0.15em] text-muted uppercase">
                <span ref={codeRef} className="text-accent">
                  {MARKET_CODES[HOME.slug]}
                </span>
                <span ref={coordRef}>{HOME_COORD}</span>
                <span ref={radiusRef}>{HOME.radiusKm} km radius</span>
              </p>
            </div>
          </div>

          {/* ---------- Market detail panels ---------- */}
          <div className="p-6 md:p-8">
            {locations.map((loc) => {
              const localServices = servicesFor(loc.slug);
              const extraAreas = loc.areas.length - AREAS_SHOWN;
              return (
                <div
                  key={loc.slug}
                  role="tabpanel"
                  id={`area-panel-${loc.slug}`}
                  aria-labelledby={`area-tab-${loc.slug}`}
                  tabIndex={0}
                  hidden={loc.slug !== active}
                >
                  <p
                    data-panel-item
                    className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase"
                  >
                    <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                    Serving {loc.metroLabel}
                  </p>
                  <p
                    data-panel-item
                    className="mt-3 font-mono text-[10px] tracking-[0.2em] text-muted uppercase"
                  >
                    {loc.counties.map((c) => c.replace(" County", "")).join(" · ")}{" "}
                    {loc.counties.length > 1 ? "Counties" : "County"}
                  </p>

                  <div data-panel-item className="mt-6">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                      Areas covered
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {loc.areas.slice(0, AREAS_SHOWN).map((area) => (
                        <li
                          key={area}
                          className="rounded-full border border-line px-3 py-1 text-xs text-content/75"
                        >
                          {area}
                        </li>
                      ))}
                      {extraAreas > 0 && (
                        <li className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                          +{extraAreas} more
                        </li>
                      )}
                    </ul>
                  </div>

                  <div data-panel-item className="mt-8">
                    <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                      Local pages
                    </p>
                    <ul className="mt-2 flex flex-col divide-y divide-line border-b border-line">
                      {localServices.map((service) => (
                        <li key={service.slug}>
                          <Link
                            href={`/services/${service.slug}/${loc.slug}`}
                            data-cursor="hover"
                            className="group flex items-center justify-between gap-4 py-3.5"
                          >
                            <span className="font-display text-base font-medium tracking-tight transition-colors duration-300 group-hover:text-accent md:text-lg">
                              {service.title} in {loc.city}
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------- Remote footer ---------- */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-5 md:px-8">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            Somewhere else? Distance doesn&apos;t change the work — clients
            across the US
          </p>
          <Link
            href="/#contact"
            data-cursor="hover"
            className="group flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-content uppercase transition-colors duration-300 hover:text-accent"
          >
            Start a project
            <span
              aria-hidden
              className="text-accent transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
