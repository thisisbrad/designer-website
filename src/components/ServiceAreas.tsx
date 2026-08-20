"use client";

import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { locations, type Location } from "@/data/locations";
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
  kmToPlotWidth,
  pointOf,
  px,
  py,
  ringSize,
} from "@/lib/regionMap";
import { cn, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/utils";

/* Engraved water lines march offshore, fading with distance from the
   shoreline. Offsets are in plot units. */
const WATER_LINES = [
  { offset: 1.6, opacity: 0.2 },
  { offset: 3.4, opacity: 0.13 },
  { offset: 5.6, opacity: 0.08 },
  { offset: 8.4, opacity: 0.05 },
  { offset: 11.8, opacity: 0.03 },
];

const HOME = locations[0];
const HOME_POINT = pointOf(HOME);

export default function ServiceAreas() {
  const sectionRef = useSectionReveal<HTMLElement>();
  const [active, setActive] = useState(HOME.slug);
  /** Market whose map marker is under the pointer — mirrors the highlight
      back into the list, the reverse of the list→map hover. */
  const [hovered, setHovered] = useState<string | null>(null);
  const activeLoc = locations.find((l) => l.slug === active) ?? HOME;

  const mapRef = useRef<HTMLDivElement>(null);
  const crossVRef = useRef<HTMLSpanElement>(null);
  const crossHRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const pingRef = useRef<HTMLSpanElement>(null);
  /* The intro timeline fires whenever the section scrolls in, so it reads
     the active market from a ref rather than a stale closure. */
  const activeLocRef = useRef(HOME);
  const firstRender = useRef(true);

  /** One expanding ring, out to just past the market's service radius. */
  const firePing = (loc: Location, delay = 0) => {
    const ping = pingRef.current;
    if (!ping || prefersReducedMotion()) return;
    const { x, y } = pointOf(loc);
    gsap.set(ping, {
      left: `${x}%`,
      top: `${y}%`,
      height: `${ringSize(loc) * 1.2}%`,
    });
    gsap.fromTo(
      ping,
      { opacity: 0.7, scale: 0.15 },
      {
        opacity: 0,
        scale: 1,
        duration: 0.9,
        ease: "power2.out",
        delay,
        overwrite: "auto",
      }
    );
  };

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
  };

  useIsomorphicLayoutEffect(() => {
    activeLocRef.current = activeLoc;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    moveTo(activeLoc);
    /* Ping timed to the crosshair's arrival, not its departure. */
    firePing(activeLoc, 0.65);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /* One-shot survey-plot intro: the coast engraves itself, water lining
     and the I-4 corridor follow, the markers blink on, then the instrument
     arms and pings its target. Reduced-motion users get the finished sheet. */
  useIsomorphicLayoutEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const coast = map.querySelector<SVGPathElement>("[data-coast]");
      const i4Mask = map.querySelector<SVGPathElement>("[data-i4-mask]");
      if (!coast || !i4Mask) return;
      const water = map.querySelectorAll("[data-water]");
      const lettering = map.querySelectorAll("[data-lettering]");
      const dots = map.querySelectorAll("[data-marker-dot]");
      const labels = map.querySelectorAll("[data-marker-label]");
      const instrument = [
        crossVRef.current,
        crossHRef.current,
        ringRef.current,
      ].filter(Boolean);
      const coastLen = coast.getTotalLength();
      const i4Len = i4Mask.getTotalLength();

      gsap.set(coast, { strokeDasharray: coastLen, strokeDashoffset: coastLen });
      gsap.set(i4Mask, { strokeDasharray: i4Len, strokeDashoffset: i4Len });
      gsap.set([...water, ...lettering, ...labels, ...instrument], {
        opacity: 0,
      });
      gsap.set(dots, { opacity: 0, scale: 0.2 });

      gsap
        .timeline({
          scrollTrigger: { trigger: map, start: "top 75%", once: true },
        })
        .to(coast, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" })
        .to(
          water,
          { opacity: 1, duration: 0.6, stagger: 0.12, ease: "power1.out" },
          "-=0.45"
        )
        .to(
          i4Mask,
          { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" },
          "-=0.7"
        )
        .to(lettering, { opacity: 1, duration: 0.5 }, "-=0.3")
        .to(
          dots,
          {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            ease: "back.out(2.5)",
            stagger: 0.09,
          },
          "-=0.55"
        )
        .to(labels, { opacity: 1, duration: 0.3, stagger: 0.09 }, "<0.06")
        .to(instrument, { opacity: 1, duration: 0.5, ease: "power1.out" }, "-=0.2")
        .call(() => firePing(activeLocRef.current), undefined, "-=0.1");
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        description="From the Atlantic coast inland along I-4 to Lakeland — a local page only exists where the market genuinely changes the work. Find your market, or work with me from anywhere."
      />

      <div
        data-reveal
        className="relative overflow-hidden rounded-2xl border border-line bg-surface-2/80"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-accent/[0.05] blur-[130px]"
        />

        <div className="relative grid divide-y divide-line lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)] lg:divide-x lg:divide-y-0">
          {/* ---------- Market selector ---------- */}
          <div
            aria-label="Florida markets"
            className="flex flex-col p-6 md:p-8"
            onPointerLeave={() => moveTo(activeLoc)}
          >
            {locations.map((loc) => {
              const selected = loc.slug === active;
              const hot = selected || loc.slug === hovered;
              return (
                <button
                  key={loc.slug}
                  type="button"
                  aria-label={`${loc.city}, ${loc.region}`}
                  aria-pressed={selected}
                  data-cursor="hover"
                  className="group flex w-full items-baseline justify-between gap-4 border-b border-line px-1 py-4 text-left transition-colors first:border-t last:border-b-0 lg:last:border-b"
                  onClick={() => setActive(loc.slug)}
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
                      {loc.metroLabel}
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
            <div className="w-full">
              <div
                ref={mapRef}
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

                  {/* Drawing a dashed line with dashoffset would destroy its
                      dash pattern, so the I-4 intro reveals it through a
                      solid-stroke mask that draws instead. */}
                  <defs>
                    <mask
                      id="i4-draw-mask"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="100"
                      height="100"
                    >
                      <path
                        data-i4-mask
                        d={I4_PATH}
                        fill="none"
                        stroke="#fff"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </mask>
                  </defs>

                  {/* The Atlantic shoreline — Cape Canaveral's point, with
                      the Ponce and Sebastian inlets as jogs */}
                  <path
                    data-coast
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
                      data-water
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
                    mask="url(#i4-draw-mask)"
                    fill="none"
                    stroke="var(--color-muted)"
                    strokeOpacity="0.45"
                    strokeWidth="1"
                    strokeDasharray="3 2.2"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Sheet lettering */}
                <span
                  data-lettering
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
                  data-lettering
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[3px] border border-line bg-surface/80 px-1 py-px font-mono text-[8px] tracking-[0.2em] text-muted"
                  style={{ left: `${I4_LABEL.x}%`, top: `${I4_LABEL.y}%` }}
                >
                  I-4
                </span>

                {/* Scale bar — 50 km measured on the sheet's own projection,
                    filled 0–25, outlined 25–50, survey-sheet style */}
                <div
                  data-lettering
                  aria-hidden
                  className="absolute bottom-[4.5%] left-[3.5%]"
                  style={{ width: `${kmToPlotWidth(50)}%` }}
                >
                  <div className="flex h-[3px]">
                    <span className="flex-1 bg-content/40" />
                    <span className="flex-1 border border-l-0 border-content/40" />
                  </div>
                  <div className="relative mt-1 h-3 font-mono text-[8px] tracking-[0.1em] text-muted/70">
                    <span className="absolute left-0 -translate-x-1/2">0</span>
                    <span className="absolute left-1/2 -translate-x-1/2">25</span>
                    <span className="absolute left-full -translate-x-1/2 whitespace-nowrap">
                      50 km
                    </span>
                  </div>
                </div>

                {/* Compass rose, drawn in the open Atlantic like the old
                    charts did */}
                <svg
                  data-lettering
                  aria-hidden
                  viewBox="0 0 36 46"
                  className="absolute right-[3.5%] bottom-[4.5%] w-[6.5%] min-w-9"
                >
                  <text
                    x="18"
                    y="8"
                    textAnchor="middle"
                    className="fill-muted font-mono"
                    fontSize="7"
                    letterSpacing="1.5"
                  >
                    N
                  </text>
                  <circle
                    cx="18"
                    cy="28"
                    r="10"
                    fill="none"
                    stroke="var(--color-content)"
                    strokeOpacity="0.3"
                    strokeWidth="0.75"
                  />
                  <path
                    d="M28 28 h3 M18 38 v3 M8 28 h-3"
                    stroke="var(--color-content)"
                    strokeOpacity="0.3"
                    strokeWidth="0.75"
                  />
                  <path
                    d="M18 12 L20.4 28 L18 34 L15.6 28 Z"
                    fill="var(--color-content)"
                    fillOpacity="0.35"
                    stroke="var(--color-content)"
                    strokeOpacity="0.5"
                    strokeWidth="0.6"
                    strokeLinejoin="round"
                  />
                  <circle cx="18" cy="28" r="1.1" fill="var(--color-accent)" />
                </svg>

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

                {/* One-shot sonar ping fired when a selection lands */}
                <span
                  ref={pingRef}
                  aria-hidden
                  className="pointer-events-none absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/60"
                  style={{
                    left: `${HOME_POINT.x}%`,
                    top: `${HOME_POINT.y}%`,
                    height: `${ringSize(HOME)}%`,
                    opacity: 0,
                  }}
                />

                {/* Market markers — hovering one highlights its name in the
                    list; the buttons remain the canonical, keyboard-reachable
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
                          data-marker-dot
                          className={cn(
                            "absolute top-1/2 left-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300",
                            hot ? "bg-accent" : "bg-content/50"
                          )}
                        />
                      </span>
                      <span
                        data-marker-label
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
            </div>
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
