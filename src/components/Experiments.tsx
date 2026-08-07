"use client";

import { useSectionReveal } from "@/hooks/useGSAPAnimations";
import SectionHeading from "./SectionHeading";

type UseCase = {
  title: string;
  industry: string;
  description: string;
  visual: "orbit" | "marquee" | "dots" | "eq" | "bloom" | "cross";
};

const useCases: UseCase[] = [
  {
    title: "After-hours booking bot",
    industry: "HVAC & Home Services",
    description:
      "Answers every call and late-night chat, quotes common jobs and books the service call straight into your calendar — emergencies dispatched first.",
    visual: "orbit",
  },
  {
    title: "Quote-chaser",
    industry: "Painters & Contractors",
    description:
      "Captures quote requests, qualifies the job and follows up politely until the estimate turns into a booked project — no lead left to go cold.",
    visual: "marquee",
  },
  {
    title: "Patient recall engine",
    industry: "Medical & Dental",
    description:
      "Reminds patients of checkups, fills cancelled slots from a waitlist and quietly wins back the ones who drifted away.",
    visual: "eq",
  },
  {
    title: "Front-desk copilot",
    industry: "Salons & Clinics",
    description:
      "Handles reschedules, waitlists and FAQs by text around the clock — fewer no-shows without a single extra hire.",
    visual: "dots",
  },
  {
    title: "Intake assistant",
    industry: "Law & Professional Services",
    description:
      "Screens new enquiries, gathers the details that matter and schedules the consultation — before your competitors even reply.",
    visual: "cross",
  },
  {
    title: "Review & referral loop",
    industry: "Local Business",
    description:
      "Asks happy customers for a review at exactly the right moment and routes referrals straight into your pipeline.",
    visual: "bloom",
  },
];

function Visual({ kind }: { kind: UseCase["visual"] }) {
  switch (kind) {
    case "orbit":
      return (
        <div className="relative flex size-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-accent/50 motion-safe:animate-rotate-slow" />
          <div className="absolute inset-4 rounded-full border border-paper/15" />
          <div className="size-2 rounded-full bg-accent" />
        </div>
      );
    case "marquee":
      return (
        <div className="w-full overflow-hidden">
          <div className="flex w-max whitespace-nowrap font-display text-4xl font-semibold tracking-tight text-paper/20 motion-safe:animate-marquee">
            <span className="pr-6">QUOTE — FOLLOW UP — BOOKED —&nbsp;</span>
            <span className="pr-6">QUOTE — FOLLOW UP — BOOKED —&nbsp;</span>
          </div>
        </div>
      );
    case "dots":
      return (
        <div
          className="size-full motion-safe:animate-drift"
          style={{
            backgroundImage:
              "radial-gradient(rgba(242,239,232,0.25) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      );
    case "eq":
      return (
        <div className="flex h-24 items-end gap-2">
          {[0.9, 0.5, 1, 0.35, 0.7].map((delay, i) => (
            <div
              key={i}
              className="w-2.5 origin-bottom rounded-t-sm bg-accent/70 motion-safe:animate-eq"
              style={{ height: "100%", animationDelay: `${delay * -1}s` }}
            />
          ))}
        </div>
      );
    case "bloom":
      return (
        <div
          className="size-32 rounded-full opacity-70 blur-2xl motion-safe:animate-rotate-slow"
          style={{
            background:
              "conic-gradient(from 0deg, #d7fb44, #7db8ff, #b49bff, #d7fb44)",
          }}
        />
      );
    case "cross":
      return (
        <div className="relative size-28">
          <div className="absolute top-1/2 left-0 h-px w-full bg-paper/20" />
          <div className="absolute top-0 left-1/2 h-full w-px bg-paper/20" />
          <div className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent motion-safe:animate-pulse-dot" />
        </div>
      );
  }
}

export default function Experiments() {
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section
      id="experiments"
      ref={ref}
      aria-labelledby="experiments-heading"
      className="mx-auto max-w-[1400px] px-6 py-28 md:px-10 md:py-40"
    >
      <SectionHeading
        id="experiments-heading"
        eyebrow="05 — AI in action"
        title="AI that earns its keep"
        description="Real assistants and automations built for real businesses — booking clients, chasing leads and keeping customers coming back while you do the work."
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((useCase) => (
          <li key={useCase.title} data-reveal data-cursor="hover">
            <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-ink-2 transition-colors duration-500 hover:border-accent/40">
              <div className="flex h-44 items-center justify-center overflow-hidden border-b border-line p-6">
                <div className="flex size-full items-center justify-center transition-transform duration-700 group-hover:scale-105">
                  <Visual kind={useCase.visual} />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                  {useCase.industry}
                </p>
                <h3 className="font-display text-xl font-medium tracking-tight">
                  {useCase.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {useCase.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
