/**
 * The assistant's knowledge base, built from the site's own content files.
 *
 * ProjectHub fetches a 570KB `recruiter-knowledge.json` from GitHub every 15
 * minutes and caches it. That indirection exists because its widget is
 * deployed separately from its data. Here the data *is* the site — the same
 * `services`, `locations`, `posts` and `legal` modules the pages render from —
 * so the knowledge base is derived at module load and is correct by
 * construction. There is no sync step to forget, and no way for the assistant
 * to quote a price the pages don't show.
 *
 * Every chunk carries a `url`, so an answer can always point at the page that
 * says the same thing in full. That is the difference between a bot that
 * answers and one that converts.
 */

import { services } from "@/data/services";
import { locations, locationServices, getLocation } from "@/data/locations";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { solutions } from "@/data/solutions";
import { legalDocs } from "@/data/legal";
import { availability } from "@/data/contact";
import { SITE_EMAIL } from "@/lib/site";

export type ChunkTag =
  | "service"
  | "pricing"
  | "process"
  | "location"
  | "post"
  | "project"
  | "legal"
  | "plan"
  | "contact"
  | "faq";

export type Chunk = {
  id: string;
  tag: ChunkTag;
  /**
   * What retrieval scores against. Free to carry synonyms a visitor might
   * search for ("cost", "budget", "how much") even where the page itself
   * doesn't use those words — nobody reads this.
   */
  text: string;
  /**
   * What a visitor reads when this chunk is the answer. Set it wherever `text`
   * has been written for the index rather than for a person; without it the
   * keyword padding above would be quoted back at them verbatim.
   */
  display?: string;
  /** Human-readable source label, shown to the visitor as a citation. */
  title: string;
  /** The page that covers this in full. */
  url: string;
  /**
   * Present on FAQ chunks only: the answer alone, to be returned verbatim.
   * A question the site already answers in the owner's own words should be
   * answered in those words, not paraphrased.
   */
  answer?: string;
};

/** Strip the `[label](/href)` and `**bold**` markup content files carry. */
function plain(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  const add = (chunk: Chunk) => {
    if (chunk.text.trim()) chunks.push(chunk);
  };

  /* ---- Services ---- */
  for (const service of services) {
    const url = `/services/${service.slug}`;

    add({
      id: `service:${service.slug}`,
      tag: "service",
      title: service.title,
      url,
      text: `${service.title} (${service.category}). ${service.headline}. ${service.subheadline} ${service.description} ${service.intro.join(" ")} Keywords: ${service.keywords.join(", ")}.`,
      display: `${service.headline}. ${service.subheadline}`,
    });

    // Pricing and timeline get their own chunk: it is the most-asked question
    // on any studio site, and burying it inside the overview makes BM25 fight
    // a long document for a short answer.
    add({
      id: `pricing:${service.slug}`,
      tag: "pricing",
      title: `${service.title} — cost and timeline`,
      url,
      text: `${service.title} pricing cost price budget quote how much charge rate fee. ${service.keywords.join(" ")}. ${service.title} typically runs ${service.priceRange}. How long does ${service.title} take to build and deliver, typical timeline turnaround: ${service.timeline}.`,
      display: `${service.title} projects typically run ${service.priceRange}. Timeline: ${service.timeline}. That's a range rather than a quote — real scope changes real cost, so you'd get a fixed written quote before any work starts.`,
    });

    add({
      id: `whofor:${service.slug}`,
      tag: "service",
      title: `${service.title} — who it's for`,
      url,
      text: `${service.title} is a good fit for: ${service.whoFor.join("; ")}. Common problems it solves: ${service.painPoints.join(" ")}`,
    });

    add({
      id: `includes:${service.slug}`,
      tag: "service",
      title: `${service.title} — what's included`,
      url,
      text: `${service.title} includes: ${service.includes
        .map((item) => `${item.title} — ${item.description}`)
        .join(" ")}`,
    });

    add({
      id: `process:${service.slug}`,
      tag: "process",
      title: `${service.title} — how it works`,
      url,
      text: `The ${service.title} process, step by step: ${service.process
        .map((step) => `${step.step}. ${step.title} — ${step.description}`)
        .join(" ")}`,
    });

    if (service.outcomes.length) {
      add({
        id: `outcomes:${service.slug}`,
        tag: "service",
        title: `${service.title} — results`,
        url,
        text: `Typical ${service.title} outcomes: ${service.outcomes
          .map((o) => `${o.stat} ${o.label}`)
          .join(", ")}.`,
      });
    }

    service.faq.forEach((faq, i) => {
      add({
        id: `faq:service:${service.slug}:${i}`,
        tag: "faq",
        title: service.title,
        url,
        text: `Q: ${faq.question} A: ${plain(faq.answer)}`,
        answer: plain(faq.answer),
      });
    });
  }

  // "What do you do?" had nowhere to land: every service had a chunk, the
  // catalogue of them did not.
  add({
    id: "service:catalogue",
    tag: "service",
    title: "All services",
    url: "/services",
    text: `Services offered, what you do, full list of services and what can be built: ${services
      .map((s) => `${s.title} (${s.category}, ${s.priceRange})`)
      .join(", ")}.`,
    display: `There are ${services.length} services: ${services
      .map((s) => s.title)
      .join(", ")}. Each has its own page with what's included, the process and a starting price.`,
  });

  /* ---- Locations ---- */
  for (const location of locations) {
    add({
      id: `location:${location.slug}`,
      tag: "location",
      title: `${location.city}, ${location.region}`,
      url: `/services/web-design/${location.slug}`,
      text: `Serving ${location.city}, ${location.region} and the wider ${location.metroLabel} area. Counties covered: ${location.counties.join(", ")}. Areas and neighbourhoods served: ${location.areas.join(", ")}.`,
    });
  }

  for (const item of locationServices) {
    const service = services.find((s) => s.slug === item.service);
    const location = getLocation(item.location);
    if (!service || !location) continue;

    const url = `/services/${item.service}/${item.location}`;
    const label = `${service.title} in ${location.city}`;

    add({
      id: `locservice:${item.service}:${item.location}`,
      tag: "location",
      title: label,
      url,
      text: `${label}. ${item.headline}. ${item.subheadline} ${item.context.join(" ")} Industries served here: ${item.industries.join(", ")}.`,
    });

    add({
      id: `locfactors:${item.service}:${item.location}`,
      tag: "location",
      title: `${label} — local market`,
      url,
      text: `What is different about ${service.title.toLowerCase()} in ${location.city}: ${item.factors
        .map((f) => `${f.title} — ${f.description}`)
        .join(" ")}`,
    });

    item.faq.forEach((faq, i) => {
      add({
        id: `faq:loc:${item.service}:${item.location}:${i}`,
        tag: "faq",
        title: label,
        url,
        text: `Q: ${faq.question} A: ${plain(faq.answer)}`,
        answer: plain(faq.answer),
      });
    });
  }

  /* ---- Blog ---- */
  for (const post of posts) {
    const url = `/blog/${post.slug}`;

    add({
      id: `post:${post.slug}`,
      tag: "post",
      title: post.title,
      url,
      text: `Article: ${post.title}. ${post.description} Key points: ${post.takeaways.join(" ")} Category: ${post.category}.`,
    });

    post.sections.forEach((section, i) => {
      add({
        id: `post:${post.slug}:s${i}`,
        tag: "post",
        title: section.heading ? `${post.title} — ${section.heading}` : post.title,
        url,
        text: plain(
          [section.heading, ...section.paragraphs, ...(section.list ?? [])]
            .filter(Boolean)
            .join(" ")
        ),
      });
    });

    post.faq.forEach((faq, i) => {
      add({
        id: `faq:post:${post.slug}:${i}`,
        tag: "faq",
        title: post.title,
        url,
        text: `Q: ${faq.question} A: ${plain(faq.answer)}`,
        answer: plain(faq.answer),
      });
    });
  }

  /* ---- Work ---- */
  for (const project of projects) {
    add({
      id: `project:${project.slug}`,
      tag: "project",
      title: project.title,
      url: "/#work",
      text: `Project ${project.title} (${project.category}, ${project.year}). Role: ${project.role}. ${project.summary} Result: ${project.metric.value} ${project.metric.label}. Tech: ${project.tags.join(", ")}.`,
    });
  }

  /* ---- The plan ---- */
  for (const solution of solutions) {
    add({
      id: `plan:${solution.index}`,
      tag: "plan",
      title: `The plan — ${solution.phase}`,
      url: "/#solutions",
      text: `Phase ${solution.index}, ${solution.phase}: ${solution.title}. ${solution.description} Deliverables: ${solution.deliverables.join(", ")}. Outcome: ${solution.outcome}`,
    });
  }

  /* ---- Legal ---- */
  for (const doc of legalDocs) {
    for (const section of doc.sections) {
      add({
        id: `legal:${doc.slug}:${section.heading}`,
        tag: "legal",
        title: `${doc.title} — ${section.heading}`,
        url: `/${doc.slug}`,
        text: plain(
          [
            section.heading,
            ...(section.paragraphs ?? []),
            ...(section.list ?? []),
          ].join(" ")
        ),
      });
    }
  }

  /* ---- Contact and availability ---- */
  add({
    id: "contact:how",
    tag: "contact",
    title: "Getting in touch",
    url: "/contact",
    text: `How to get in touch, book, hire, start a project or contact. Email ${SITE_EMAIL}. ${Object.values(availability).join(" ")} Free 15-point website audit, recorded video, no sales call, no mailing list.`,
    display: `Email ${SITE_EMAIL} — every enquiry is read personally and answered ${availability.responseTime.toLowerCase()}. If you'd rather see the work first, the free 15-point audit is a short recorded video walking through what's holding a site back: no sales call, no mailing list, yours to keep whoever you build with.`,
  });

  /* ---- Beacon itself ----
     Keeps "beacon" in the corpus vocabulary; without this, typo correction
     snaps the name to the nearest known word ("beach") and the meta intent
     never sees it. */
  add({
    id: "meta:beacon",
    tag: "faq",
    title: "About Beacon",
    url: "/services/ai-solutions",
    text: `Q: Who is Beacon? What is Beacon, the assistant on this site? A: Beacon is this site's assistant — named for the lighthouse on the homepage, and built to be a guiding light rather than a know-it-all. It searches the site's own pages and quotes what they say, so it can't invent a price or promise a deadline. It's also a working demo of the AI assistants Brad builds for clients.`,
    answer:
      "Beacon is this site's assistant — named for the lighthouse on the homepage, and built to be a guiding light rather than a know-it-all. It searches the site's own pages and quotes what they say, so it can't invent a price or promise a deadline. It's also a working demo of the AI assistants Brad builds for clients.",
  });

  return chunks;
}

/**
 * Built once per server process. The content is static — it changes only when
 * the site is rebuilt — so rebuilding this per request would burn CPU to
 * produce an identical array.
 */
export const knowledgeChunks: Chunk[] = buildChunks();
