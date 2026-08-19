"use client";

import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { locations, locationServices, type Location } from "@/data/locations";
import { services } from "@/data/services";
import { useSectionReveal } from "@/hooks/useGSAPAnimations";
import SectionHeading from "./SectionHeading";
import {
  COAST_ANGLE_DEG,
  COAST_PATH,
  I4_LABEL,
  I4_PATH,
  LAT_LINES,
  LNG_LINES,
  MARKERS,
  MARKET_CODES,
  PLOT_ASPECT,
  SEAWARD,
  fmtCoord,
  pointOf,
  px,
  py,
  ringSize,
} from "@/lib/regionMap";
import { cn, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/utils";

/* Engraved water lines march offshore and land bands inland, both fading
   with distance from the shoreline. Offsets are in plot units. */
const WATER_LINES = [
  { offset: 1.6, opacity: 0.2 },
  { offset: 3.4, opacity: 0.15 },
  { offset: 5.6, opacity: 0.11 },
  { offset: 8.2, opacity: 0.07 },
  { offset: 11.2, opacity: 0.04 },
];
const LAND_BANDS = [
  { offset: -2.4, opacity: 0.09 },
  { offset: -5.2, opacity: 0.05 },
];

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
  /** Market whose map marker is under the pointer — mirrors the highlight
      back into the list, the reverse of the list→map hover. */
  const [hovered, setHovered] = useState<string | null>(null);
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
        description="From the Atlantic coast inland along I-4 to Lakeland — a local page only exists where the market genuinely changes the work. Orlando's tourist split isn't the Space Coast's procurement check. Find your market, or work with me from anywhere."
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
              const hot = selected || loc.slug === hovered;
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
                        hot ? "text-accent" : "group-hover:text-accent"
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
                      hot ? "text-accent" : "text-muted"
                    )}
                  >
                    {MARKET_CODES[loc.slug]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ---------- Engraved survey sheet ---------- */}
          <div className="flex flex-col items-center justify-center p-6 md:p-8">
            <div className="w-full max-w-[380px]">
              <div
                role="img"
                aria-label="Engraved map of six Florida markets: from the Atlantic coast at Daytona Beach, Melbourne and Vero Beach, inland along Interstate 4 to Lake Mary, Orlando and Lakeland."
                className="relative w-full overflow-hidden rounded-xl border border-line bg-surface/60"
                style={{ aspectRatio: String(PLOT_ASPECT) }}
                onPointerLeave={() => moveTo(activeLoc)}
              >
                {/* Degree grid + engraved linework */}
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
                      y1={py(lat)}
                      y2={py(lat)}
                      stroke="var(--color-line)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  {LNG_LINES.map((lng) => (
                    <line
                      key={`lng-${lng}`}
                      x1={px(lng)}
                      x2={px(lng)}
                      y1="0"
                      y2="100"
                      stroke="var(--color-line)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}

                  {/* Land bands radiating inland from the shore */}
                  {LAND_BANDS.map(({ offset, opacity }) => (
                    <path
                      key={`land-${offset}`}
                      d={COAST_PATH}
                      fill="none"
                      stroke="var(--color-content)"
                      strokeOpacity={opacity}
                      strokeWidth="1"
                      strokeDasharray="2 3"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      transform={`translate(${(SEAWARD.x * offset).toFixed(2)} ${(SEAWARD.y * offset).toFixed(2)})`}
                    />
                  ))}

                  {/* The Atlantic shoreline — Cape Canaveral's point, with
                      the Ponce and Sebastian inlets as jogs */}
                  <path
                    d={COAST_PATH}
                    fill="none"
                    stroke="var(--color-content)"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* Water lining marching offshore */}
                  {WATER_LINES.map(({ offset, opacity }) => (
                    <path
                      key={`water-${offset}`}
                      d={COAST_PATH}
                      fill="none"
                      stroke="var(--color-content)"
                      strokeOpacity={opacity}
                      strokeWidth="1"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      transform={`translate(${(SEAWARD.x * offset).toFixed(2)} ${(SEAWARD.y * offset).toFixed(2)})`}
                    />
                  ))}

                  {/* The I-4 corridor, Daytona through Orlando to Lakeland */}
                  <path
                    d={I4_PATH}
                    fill="none"
                    stroke="var(--color-muted)"
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    strokeDasharray="3 2.2"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Degree labels */}
                {LAT_LINES.map((lat) => (
                  <span
                    key={`lat-label-${lat}`}
                    className="absolute left-1.5 -translate-y-1/2 font-mono text-[9px] text-muted/60"
                    style={{ top: `${py(lat)}%` }}
                  >
                    {lat.toFixed(1)}°N
                  </span>
                ))}
                {LNG_LINES.map((lng) => (
                  <span
                    key={`lng-label-${lng}`}
                    className="absolute bottom-1 -translate-x-1/2 font-mono text-[9px] text-muted/60"
                    style={{ left: `${px(lng)}%` }}
                  >
                    {Math.abs(lng).toFixed(1)}°W
                  </span>
                ))}

                {/* Sheet lettering */}
                <span
                  className="absolute font-mono text-[8px] tracking-[0.4em] whitespace-nowrap text-muted/50 uppercase"
                  style={{
                    left: "84%",
                    top: "26%",
                    transform: `translate(-50%, -50%) rotate(${COAST_ANGLE_DEG}deg)`,
                  }}
                >
                  Atlantic Ocean
                </span>
                <span
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-line bg-surface/80 px-1 py-px font-mono text-[8px] tracking-[0.2em] text-muted"
                  style={{ left: `${I4_LABEL.x}%`, top: `${I4_LABEL.y}%` }}
                >
                  I-4
                </span>

                {/* Crosshair */}
                <span
                  ref={crossVRef}
                  className="pointer-events-none absolute inset-y-0 w-px bg-accent/30"
                  style={{ left: `${HOME_POINT.x}%` }}
                />
                <span
                  ref={crossHRef}
                  className="pointer-events-none absolute inset-x-0 h-px bg-accent/30"
                  style={{ top: `${HOME_POINT.y}%` }}
                />

                {/* Service radius ring + traveling marker */}
                <span
                  ref={ringRef}
                  className="pointer-events-none absolute aspect-square -translate-x-1/2 -translate-y-1/2"
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

                {/* Market markers — hovering one highlights its name in the
                    list; the tabs remain the canonical, keyboard-reachable
                    control, so these stay out of the tab order. */}
                {MARKERS.map((m) => {
                  const hot = m.loc.slug === active || m.loc.slug === hovered;
                  return (
                    <Fragment key={m.loc.slug}>
                      <span
                        data-city={m.loc.slug}
                        data-cursor="hover"
                        className="absolute size-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ left: `${m.x}%`, top: `${m.y}%` }}
                        onPointerEnter={() => {
                          setHovered(m.loc.slug);
                          moveTo(m.loc);
                        }}
                        onPointerLeave={() => setHovered(null)}
                        onClick={() => setActive(m.loc.slug)}
                      >
                        <span
                          className={cn(
                            "absolute top-1/2 left-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300",
                            hot ? "bg-accent" : "bg-content/50"
                          )}
                        />
                      </span>
                      <span
                        className={cn(
                          "pointer-events-none absolute -translate-y-1/2 font-mono text-[9px] tracking-[0.15em] whitespace-nowrap transition-colors duration-300",
                          hot ? "text-accent" : "text-muted"
                        )}
                        style={
                          m.side === "left"
                            ? {
                                right: `calc(${100 - m.x}% + 7px)`,
                                top: `${m.labelY}%`,
                              }
                            : {
                                left: `calc(${m.x}% + 7px)`,
                                top: `${m.labelY}%`,
                              }
                        }
                      >
                        {MARKET_CODES[m.loc.slug]}
                      </span>
                    </Fragment>
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
