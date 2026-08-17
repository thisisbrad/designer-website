export type ServiceInclusion = { title: string; description: string };

export type ServiceStep = { step: string; title: string; description: string };

export type ServiceOutcome = { stat: string; label: string };

export type ServiceFaq = { question: string; answer: string };

/** Closing hook — each service sells the free audit in its own language. */
export type ServiceCta = { hook: string; copy: string; button: string };

export type Service = {
  index: string;
  /** URL segment under /services — also the cross-link key between services. */
  slug: string;
  /** Short label used in nav, lists and breadcrumbs. */
  title: string;
  /** One-line summary on the homepage services list. */
  description: string;
  /** Eyebrow / schema serviceType, e.g. "Design". */
  category: string;
  /** Keyword-front-loaded <title>; kept under ~50 chars so the brand
   *  template still fits inside Google's ~60-char cut-off. */
  metaTitle: string;
  /** Search snippet, kept under 155 chars so it isn't truncated. */
  metaDescription: string;
  keywords: string[];
  /** Page <h1>. */
  headline: string;
  subheadline: string;
  intro: string[];
  /** The problem, in the customer's own words — the hook before the pitch. */
  painPoints: string[];
  includes: ServiceInclusion[];
  process: ServiceStep[];
  outcomes: ServiceOutcome[];
  whoFor: string[];
  timeline: string;
  /**
   * Typical project range, e.g. "$4.5k–$15k".
   *
   * A range rather than a single floor on purpose. A precise number becomes
   * the anchor for every later scope conversation — "why is it more than
   * $4,500?" instead of "what is this worth?" — and it was previously being
   * published in Offer schema and burned into OG images, so search results and
   * link previews carried the figure stripped of the "not a quote" framing
   * that makes it defensible.
   *
   * The bottom of each range is the floor it replaced, so nothing already
   * quoted to anyone became untrue. Edit here; every surface derives from it.
   */
  priceRange: string;
  faq: ServiceFaq[];
  /** Slugs of sibling services — the internal link graph. */
  related: string[];
  /** Slugs of supporting blog posts, linking the money pages to the cluster. */
  reading: string[];
  cta: ServiceCta;
};

export const services: Service[] = [
  {
    index: "01",
    slug: "web-design",
    title: "Web Design",
    description:
      "Editorial, conversion-aware layouts that make businesses feel inevitable — designed in the browser, not just in Figma.",
    category: "Design",
    metaTitle: "Web Design for Businesses That Sell",
    metaDescription:
      "Custom web design that looks premium and converts — editorial layouts, honest messaging and fast builds. No templates, no page-builder bloat.",
    keywords: [
      "web design",
      "custom website design",
      "small business web design",
      "conversion focused web design",
      "website redesign",
      "Florida web designer",
    ],
    headline: "Web design that earns trust in the first three seconds",
    subheadline:
      "Custom, conversion-aware websites designed in the browser — fast, distinctive, and built to make your business the obvious choice.",
    intro: [
      "Most business websites lose the sale before a word is read. The layout looks like every competitor's, the images are stock, the load is slow, and the visitor quietly decides you're a safe second choice. Design is doing that work whether you invested in it or not.",
      "I design sites the other way round: start with what a customer needs to believe to pick up the phone, then build the page that makes that belief easy. The result reads as premium because the structure is honest — not because it's covered in effects.",
    ],
    painPoints: [
      "Your site looks like a template — because it is one.",
      "Visitors land, scroll, and leave without contacting you.",
      "You're embarrassed to send the link to a serious prospect.",
      "Every edit means a developer ticket and a two-week wait.",
      "It looks acceptable on your laptop and broken on a phone.",
    ],
    includes: [
      {
        title: "Positioning & message hierarchy",
        description:
          "Before pixels: what you sell, who it's for, and the order a stranger needs to hear it in. Every section afterwards has a job.",
      },
      {
        title: "Custom design, no templates",
        description:
          "An art direction built for your business — type, colour, spacing and imagery that competitors can't buy off the shelf.",
      },
      {
        title: "Designed in the browser",
        description:
          "Layouts proven at real widths on real devices, so what you approve is what ships — not a flat mockup that falls apart in build.",
      },
      {
        title: "Conversion paths on every page",
        description:
          "Clear next steps, credible proof placement, and forms that ask for the least you can get away with.",
      },
      {
        title: "Responsive down to 320px",
        description:
          "Mobile is designed first and properly, because that's where most of your traffic already is.",
      },
      {
        title: "Accessible by construction",
        description:
          "Real contrast, semantic structure, keyboard navigation. Better for users, better for search, and it keeps you out of trouble.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Discover",
        description:
          "A working session on your customers, competitors and the objections that kill deals. I audit what you have now and what it's costing you.",
      },
      {
        step: "02",
        title: "Direct",
        description:
          "Art direction and message hierarchy — two directions, one chosen. You see the visual language before anyone builds a full page.",
      },
      {
        step: "03",
        title: "Design & build",
        description:
          "Pages designed and built in the same pass, reviewed on a live staging link you can open on your own phone.",
      },
      {
        step: "04",
        title: "Launch & hand over",
        description:
          "Performance and SEO checks, analytics wired up, and a walkthrough so your team can edit content without me.",
      },
    ],
    outcomes: [
      { stat: "3s", label: "to earn trust — the window a new visitor gives you" },
      { stat: "2×", label: "typical lift in enquiry rate after a redesign" },
      { stat: "100%", label: "custom — nothing bought from a template shop" },
    ],
    whoFor: [
      "Established businesses whose site no longer matches the quality of their work",
      "Founders launching something that has to look credible on day one",
      "Agencies and studios that need a design partner who can also ship the code",
      "Anyone stuck on a page builder that has become slow and unmaintainable",
    ],
    timeline: "3–6 weeks",
    priceRange: "$4.5k–$15k",
    faq: [
      {
        question: "Do you use WordPress, Webflow or Squarespace?",
        answer:
          "I build custom sites in Next.js and React, which is why they load in under a second and rank well. If you need to stay on WordPress or Webflow for internal reasons, I'll say so up front and design to that platform's real constraints rather than pretending they don't exist.",
      },
      {
        question: "Can I edit the site myself afterwards?",
        answer:
          "Yes. Content lives in a structured file or a CMS of your choosing, and I hand over a short walkthrough video plus written notes. Copy edits, new pages and image swaps shouldn't require a developer.",
      },
      {
        question: "What do you need from me to start?",
        answer:
          "A conversation, whatever brand assets exist, and access to your current site and analytics. I write first-draft copy for every page — you edit rather than face a blank document.",
      },
      {
        question: "How much does a website cost?",
        answer:
          "Most business sites land between $4,500 and $15,000 depending on page count, custom interaction and whether you need SEO or AI work alongside. You get a fixed quote before anything starts — no hourly surprises.",
      },
    ],
    related: ["ui-ux-design", "frontend-development", "seo-marketing"],
    reading: ["website-audit-checklist", "core-web-vitals-for-business-owners"],
    cta: {
      hook: "See exactly what your current site is costing you.",
      copy: "I'll run my 15-point audit on your site and send back the design, speed and conversion issues that are quietly losing you enquiries — free, no pitch deck.",
      button: "Get my free audit",
    },
  },
  {
    index: "02",
    slug: "frontend-development",
    title: "Frontend Development",
    description:
      "Production-grade React, Next.js and TypeScript. Fast, accessible, and maintainable long after launch day.",
    category: "Development",
    metaTitle: "React & Next.js Frontend Development",
    metaDescription:
      "Production-grade frontend development in React, Next.js and TypeScript — fast, accessible, typed, and maintainable long after launch day.",
    keywords: [
      "frontend development",
      "React developer",
      "Next.js development",
      "TypeScript development",
      "web development services",
      "headless website build",
    ],
    headline: "Frontend development that still holds up in two years",
    subheadline:
      "React, Next.js and TypeScript built to production standards — typed, tested, accessible and fast enough that performance stops being a topic.",
    intro: [
      "Plenty of people can get a design onto a screen. The difference shows up later: when the pages get slow, the code gets scary to touch, and every small change costs a week. That bill arrives long after the invoice is paid.",
      "I build frontends the way a product team does — typed end to end, componentised, measured against a performance budget, and documented well enough that the next developer (or your in-house team) can pick it up without archaeology.",
    ],
    painPoints: [
      "Your site is slow and nobody can tell you why.",
      "Small changes break unrelated pages.",
      "The last developer left and nothing is documented.",
      "Lighthouse is red and your host keeps blaming your plugins.",
      "The design looked great in Figma and shipped looking nothing like it.",
    ],
    includes: [
      {
        title: "Next.js App Router architecture",
        description:
          "Server components, streaming and static generation used where they actually help — not cargo-culted.",
      },
      {
        title: "TypeScript end to end",
        description:
          "Real types across data, props and API boundaries, so whole categories of bug never reach your customers.",
      },
      {
        title: "Performance budget",
        description:
          "Core Web Vitals targeted from the first commit: image strategy, font loading, bundle discipline and honest third-party review.",
      },
      {
        title: "Accessibility built in",
        description:
          "Semantic HTML, focus management, keyboard paths and reduced-motion support — not an audit bolted on at the end.",
      },
      {
        title: "CMS & API integration",
        description:
          "Headless CMS, e-commerce, CRM, booking and payment integrations wired up with proper error and loading states.",
      },
      {
        title: "Deployment & handover",
        description:
          "CI, preview deploys, environment config and a README that means your team can ship on day one without me.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Scope",
        description:
          "Design and data reviewed, edge cases surfaced early, and a component inventory agreed before a line of code is written.",
      },
      {
        step: "02",
        title: "Build",
        description:
          "Component-first delivery on preview URLs, so you review real, clickable work every few days instead of a big reveal.",
      },
      {
        step: "03",
        title: "Harden",
        description:
          "Cross-browser and device passes, accessibility checks, Lighthouse runs, and error states you'd be happy for a customer to hit.",
      },
      {
        step: "04",
        title: "Ship & support",
        description:
          "Production deploy, monitoring, documented handover and a support window while your team settles in.",
      },
    ],
    outcomes: [
      { stat: "<1s", label: "typical LCP on a production build" },
      { stat: "95+", label: "Lighthouse scores across all four categories" },
      { stat: "0", label: "handover surprises — documented and typed" },
    ],
    whoFor: [
      "Companies replacing a slow, brittle or unmaintainable site",
      "Design studios that need a build partner who respects the design",
      "Startups shipping a marketing site or product frontend fast, without technical debt",
      "Teams that need a specialist alongside their backend developers",
    ],
    timeline: "2–8 weeks",
    priceRange: "$5k–$20k",
    faq: [
      {
        question: "Can you build from a design my team already has?",
        answer:
          "Yes — that's a common engagement. Send the Figma file and I'll flag anything that will fight the browser (impossible type scales, missing states, layouts that break at odd widths) before we start, so it gets solved in design rather than in code.",
      },
      {
        question: "Do you work with existing codebases?",
        answer:
          "I do. That usually starts with a short audit: dependency health, performance profile, accessibility gaps and the riskiest parts of the code. You get a prioritised plan, and we agree what's worth fixing versus rebuilding.",
      },
      {
        question: "Who hosts the finished site?",
        answer:
          "Usually Vercel or Cloudflare — both give you global delivery, preview deploys and near-zero maintenance for a few dollars a month. You own the accounts and the repository from day one.",
      },
      {
        question: "What happens after launch?",
        answer:
          "Every build includes a support window for bugs. After that you can bring me back for feature work on a retainer or ad hoc, or hand it to your own team — the code and documentation are written on the assumption that will happen.",
      },
    ],
    related: ["web-design", "ui-ux-design", "ai-solutions"],
    reading: ["core-web-vitals-for-business-owners", "website-audit-checklist"],
    cta: {
      hook: "Find out what your frontend is actually costing you.",
      copy: "I'll audit your site's performance, accessibility and code health, then send back the specific fixes ranked by what they'll do for revenue — free.",
      button: "Get my free audit",
    },
  },
  {
    index: "03",
    slug: "ui-ux-design",
    title: "UI/UX Design",
    description:
      "Interfaces with clear hierarchy and honest flows — tested against real tasks, not taste alone.",
    category: "Product Design",
    metaTitle: "UI/UX Design & Product Interface Design",
    metaDescription:
      "UI/UX design that reduces drop-off — user flows, wireframes, design systems and usability testing measured against real tasks, not taste.",
    keywords: [
      "UI UX design",
      "user experience design",
      "product design",
      "design systems",
      "usability testing",
      "app interface design",
    ],
    headline: "Interfaces people get right on the first try",
    subheadline:
      "User flows, interface design and design systems shaped by how people actually behave — then tested, so improvements are evidence, not opinion.",
    intro: [
      "Bad UX rarely announces itself. It shows up as support tickets, abandoned carts, half-finished sign-ups and a sales team explaining the product over the phone because the screen doesn't. Everyone assumes users are being careless. Usually the interface asked for too much.",
      "My job is to find where attention and understanding break down, then design the shortest honest path through. That means fewer steps, clearer hierarchy, plain language and states that tell the truth — including when something goes wrong.",
    ],
    painPoints: [
      "Users drop out halfway through sign-up or checkout.",
      "Support answers the same three questions every day.",
      "Your product does more than competitors but demos worse.",
      "Every new feature makes the interface a little more crowded.",
      "Design decisions get settled by whoever argues hardest.",
    ],
    includes: [
      {
        title: "Flow & journey mapping",
        description:
          "The real path from first click to done, with every dead end, extra step and moment of doubt marked.",
      },
      {
        title: "Wireframes & prototypes",
        description:
          "Clickable structure before any visual polish, so the shape of the thing is agreed while it's still cheap to change.",
      },
      {
        title: "Interface design",
        description:
          "High-fidelity screens with genuine hierarchy — including the empty, loading, error and edge-case states most designs skip.",
      },
      {
        title: "Design system",
        description:
          "Tokens, components and usage rules your team can build on, so the interface stays coherent as it grows.",
      },
      {
        title: "Usability testing",
        description:
          "Five to eight people attempting real tasks. You get the recordings, the failures and a ranked fix list.",
      },
      {
        title: "Accessibility review",
        description:
          "Contrast, focus order, screen-reader labelling and motion — checked against WCAG AA, not guessed at.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Understand",
        description:
          "Stakeholder interviews, analytics and session review to find where users actually stall — before assuming what to redesign.",
      },
      {
        step: "02",
        title: "Structure",
        description:
          "Flows and wireframes for the critical journeys, reviewed as a clickable prototype rather than a slide deck.",
      },
      {
        step: "03",
        title: "Design",
        description:
          "Full interface design and a system to hold it together, with every state specified so nothing gets invented in build.",
      },
      {
        step: "04",
        title: "Validate",
        description:
          "Moderated testing on real tasks, then a revision pass. Findings and fixes handed over as a prioritised list.",
      },
    ],
    outcomes: [
      { stat: "5–8", label: "users tested — enough to surface most usability issues" },
      { stat: "−40%", label: "typical reduction in steps to complete a core task" },
      { stat: "1", label: "shared system, so the next feature stays consistent" },
    ],
    whoFor: [
      "SaaS and product teams whose interface has outgrown its original design",
      "Companies with strong traffic and weak completion rates",
      "Founders validating a product before committing engineering time",
      "Teams that need a design system before the interface fragments further",
    ],
    timeline: "3–8 weeks",
    priceRange: "$6k–$18k",
    faq: [
      {
        question: "What's the difference between UI and UX here?",
        answer:
          "UX is the structure — what the steps are, what order they come in and what a user has to understand. UI is what that structure looks and feels like on screen. They're sold separately by a lot of agencies; I do both, because splitting them is where most of the quality leaks out.",
      },
      {
        question: "Do we need usability testing if we already have analytics?",
        answer:
          "Analytics tells you where people drop out. Testing tells you why. They're complementary — I usually start with your existing data to pick which flows to test, so the sessions are spent on the screens that matter.",
      },
      {
        question: "Can you work with our existing brand?",
        answer:
          "Yes. If you have a brand or design system, I work inside it and note where it's causing problems. If you don't, I'll build one that's minimal enough to actually get used.",
      },
      {
        question: "Do you hand off to our developers?",
        answer:
          "Always — with specced states, tokens, and a walkthrough session. I can also build the frontend myself, which removes the handover gap entirely.",
      },
    ],
    related: ["web-design", "analytics-cro", "frontend-development"],
    reading: ["website-audit-checklist", "core-web-vitals-for-business-owners"],
    cta: {
      hook: "Where is your interface losing people?",
      copy: "Send me your site or product and I'll walk the critical flow the way a first-time user would, then send back what's breaking down and what to fix first — free.",
      button: "Get my free audit",
    },
  },
  {
    index: "04",
    slug: "seo-marketing",
    title: "SEO Marketing",
    description:
      "Technical audits, site architecture, content strategy and local search — rankings earned with engineering, not tricks.",
    category: "Marketing",
    metaTitle: "SEO Marketing & Local Search Services",
    metaDescription:
      "SEO built on engineering, not tricks — technical audits, schema markup, site architecture, content strategy and local search that wins the map pack.",
    keywords: [
      "SEO marketing",
      "SEO services",
      "local SEO",
      "technical SEO audit",
      "schema markup",
      "Google map pack",
      "search engine optimization services",
    ],
    headline: "Get found by the people already searching for you",
    subheadline:
      "Technical SEO, site architecture, structured data and local search — the unglamorous engineering that compounds into rankings you keep.",
    intro: [
      "Someone in your area is searching for what you sell right now. If you're not in the first few results — or the map pack — that enquiry goes to a competitor who is, and you never even know it happened.",
      "SEO is not a monthly ritual of blog posts and hope. It's technical work: a crawlable, fast site, an architecture that matches how people search, structured data that tells Google exactly what you are, and content that answers real questions better than the page currently ranking. I do that work and show you the receipts.",
    ],
    painPoints: [
      "You rank for your own name and nothing else.",
      "Competitors with worse work sit above you in the map pack.",
      "An agency sends monthly reports full of metrics you can't act on.",
      "Traffic is fine, but none of it turns into enquiries.",
      "You've been told you need \"more content\" for two years running.",
    ],
    includes: [
      {
        title: "Technical SEO audit",
        description:
          "Crawlability, indexation, redirects, canonicals, speed and mobile — every issue found, ranked by impact, with fixes applied not just listed.",
      },
      {
        title: "Site architecture & internal linking",
        description:
          "URL structure and link graph rebuilt so authority reaches your money pages instead of pooling on the homepage.",
      },
      {
        title: "Structured data & schema markup",
        description:
          "Organisation, service, FAQ, review and local business schema implemented and validated — the machine-readable version of your business.",
      },
      {
        title: "Keyword & content strategy",
        description:
          "The searches that actually precede a purchase, mapped to pages, with briefs specific enough to write from.",
      },
      {
        title: "Local search & map pack",
        description:
          "Google Business Profile optimisation, citation consistency, review strategy and location pages that aren't templated town-swaps.",
      },
      {
        title: "Reporting you can act on",
        description:
          "Rankings, impressions and — most importantly — enquiries, in plain English, with what I'm doing next and why.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Audit",
        description:
          "Full technical, content and local review against the competitors currently outranking you. You get the findings whether or not we work together.",
      },
      {
        step: "02",
        title: "Fix",
        description:
          "Technical debt cleared first — speed, indexation, schema, architecture. This is where the fastest wins usually live.",
      },
      {
        step: "03",
        title: "Build",
        description:
          "Pages created or rewritten against the keyword map: service pages, location pages and the supporting articles that make them credible.",
      },
      {
        step: "04",
        title: "Compound",
        description:
          "Monthly measurement, review generation, content expansion and link earning — the part that turns a fix into a moat.",
      },
    ],
    outcomes: [
      { stat: "Top 3", label: "map pack — where most local clicks are won" },
      { stat: "3–6mo", label: "typical window before compounding becomes obvious" },
      { stat: "0", label: "tricks, private blog networks or bought links" },
    ],
    whoFor: [
      "Local service businesses fighting for map pack positions",
      "Companies with a good site that search engines can't read properly",
      "Businesses leaving an agency that never explained what it was doing",
      "Anyone launching a new site who wants SEO built in rather than retrofitted",
    ],
    timeline: "Audit in 1 week, retainer ongoing",
    priceRange: "$1.5k–$4k/mo",
    faq: [
      {
        question: "How long does SEO take to work?",
        answer:
          "Technical fixes can move rankings in weeks. Competitive terms and local prominence usually take three to six months of consistent work. Anyone promising page one in 30 days is either targeting terms nobody searches or doing something that will cost you later.",
      },
      {
        question: "Do you guarantee rankings?",
        answer:
          "No, and neither can anyone honest — Google doesn't sell that. What I guarantee is that the work is real, documented and reversible if you leave: you own every account, page and change I make.",
      },
      {
        question: "Is local SEO different from regular SEO?",
        answer:
          "Yes. The map pack is ranked mostly on relevance, distance and prominence, which means your Google Business Profile, reviews and location signals matter as much as your website. I cover both — read more in [my guide to winning the map pack](/blog/local-seo-map-pack).",
      },
      {
        question: "Do I need to rebuild my site first?",
        answer:
          "Often not. I'll tell you honestly after the audit — sometimes the existing site is fixable, sometimes the platform itself is the ceiling. Either way you'll get the reasoning, not just a rebuild quote.",
      },
      {
        question: "What does SEO cost?",
        answer:
          "A one-off audit with a prioritised fix plan starts at $1,200. Ongoing work runs from $1,500 a month depending on competitiveness and how much content and technical work is involved.",
      },
    ],
    related: ["analytics-cro", "web-design", "ai-solutions"],
    reading: [
      "local-seo-map-pack",
      "schema-markup-plain-english",
      "core-web-vitals-for-business-owners",
    ],
    cta: {
      hook: "Find out why you're not ranking.",
      copy: "I'll run a technical and local SEO audit on your site, compare it against whoever is outranking you, and send back the fixes in priority order — free.",
      button: "Get my free audit",
    },
  },
  {
    index: "05",
    slug: "ai-solutions",
    title: "AI Solutions",
    description:
      "Custom assistants, chat concierges and automations built on modern AI models — integrated into your site and workflows, not bolted on.",
    category: "AI & Automation",
    metaTitle: "AI Solutions, Assistants & Automation",
    metaDescription:
      "Custom AI assistants and automations that answer questions, qualify leads and book appointments around the clock — trained on your business, not generic.",
    keywords: [
      "AI solutions",
      "AI assistant for business",
      "AI chatbot development",
      "business automation",
      "lead qualification AI",
      "custom AI integration",
    ],
    headline: "An AI assistant that books clients, not one that chats",
    subheadline:
      "Custom assistants and automations trained on your business — answering real questions, qualifying leads and filling your calendar at 2am.",
    intro: [
      "Most business chatbots are a liability. They're trained on nothing, answer confidently in the wrong direction, and exist mainly to delay a customer until someone human shows up. People have learned to close them on sight.",
      "A useful assistant is a different build. It knows your services, pricing rules, service area and availability. It answers the questions your team answers twenty times a week, qualifies the enquiry, books the appointment, and hands off cleanly — with a transcript — the moment it hits something it shouldn't guess at.",
    ],
    painPoints: [
      "Enquiries arrive after hours and go cold by morning.",
      "Your team answers the same five questions all day.",
      "The chat widget you installed makes customers angrier, not happier.",
      "Leads sit in an inbox until someone gets round to them.",
      "You know AI could help but every demo you've seen is a toy.",
    ],
    includes: [
      {
        title: "Assistant trained on your business",
        description:
          "Grounded in your services, pricing rules, policies and FAQs — so answers are accurate and it says \"let me get someone\" instead of inventing.",
      },
      {
        title: "Lead qualification & booking",
        description:
          "Asks the questions your sales process actually needs, then books straight into your calendar or pushes a qualified lead to your CRM.",
      },
      {
        title: "Safe handoff & escalation",
        description:
          "Defined boundaries, human takeover, and full transcripts — nothing about money, legal or safety gets answered on a guess.",
      },
      {
        title: "Workflow automation",
        description:
          "Follow-up sequences, review requests, quote drafting, inbox triage and reporting — the busywork that eats a day a week.",
      },
      {
        title: "System integration",
        description:
          "Connected to your CRM, calendar, help desk and site, so the assistant works with what you already run rather than beside it.",
      },
      {
        title: "Monitoring & tuning",
        description:
          "Conversation review, gap-spotting and monthly tuning — the assistant gets better because someone is watching it, not by magic.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Map",
        description:
          "The questions you're actually asked, the decisions worth automating, and the hard lines the assistant must never cross.",
      },
      {
        step: "02",
        title: "Ground",
        description:
          "Your knowledge assembled and structured: services, pricing rules, policies, service area, availability and tone of voice.",
      },
      {
        step: "03",
        title: "Build & test",
        description:
          "Assistant built and adversarially tested against edge cases and bad-faith questions before a single customer sees it.",
      },
      {
        step: "04",
        title: "Launch & tune",
        description:
          "Deployed with transcripts and analytics, then reviewed monthly so the gaps it hits become answers it knows.",
      },
    ],
    outcomes: [
      { stat: "24/7", label: "coverage — enquiries answered while you sleep" },
      { stat: "~60%", label: "of routine questions handled without a human" },
      { stat: "<1min", label: "response time on every new enquiry" },
    ],
    whoFor: [
      "Service businesses losing after-hours enquiries to voicemail",
      "Teams drowning in repetitive questions and inbox triage",
      "Companies that want AI in the business without a platform migration",
      "Anyone who tried an off-the-shelf chatbot and turned it off again",
    ],
    timeline: "2–5 weeks",
    priceRange: "$3.5k–$15k",
    faq: [
      {
        question: "Will it make things up about my business?",
        answer:
          "That's the failure mode I design against hardest. The assistant is grounded in your own content, constrained on the topics that carry risk, and instructed to hand off rather than guess. I test it adversarially before launch and review real transcripts after — read more on [assistants that actually book clients](/blog/ai-assistants-that-book-clients).",
      },
      {
        question: "Which AI models do you use?",
        answer:
          "Usually Anthropic's Claude models, chosen per job for quality, speed and cost. You aren't locked in — the integration is built so the underlying model can be swapped as better ones ship.",
      },
      {
        question: "What does it cost to run?",
        answer:
          "Build starts at $3,500. Running costs are usage-based and typically $20–$150 a month for a small business — I set spend limits and show you the real numbers before launch.",
      },
      {
        question: "Can it connect to our booking system or CRM?",
        answer:
          "Yes — calendars, CRMs, help desks and forms are standard integrations. If your system has an API, it can be connected; if it doesn't, I'll tell you before you pay for anything.",
      },
      {
        question: "Is our data used to train someone else's model?",
        answer:
          "No. I use business-tier API access where your data isn't used for training, and I'll document exactly what's stored, where, and for how long.",
      },
    ],
    related: ["analytics-cro", "frontend-development", "seo-marketing"],
    reading: ["ai-assistants-that-book-clients", "website-audit-checklist"],
    cta: {
      hook: "See what an assistant would actually handle for you.",
      copy: "Send me your site and I'll come back with the questions an assistant could answer today, what it could book, and what it should never touch — free.",
      button: "Get my free audit",
    },
  },
  {
    index: "06",
    slug: "analytics-cro",
    title: "Analytics & CRO",
    description:
      "Clean measurement, honest dashboards and A/B-tested improvements that turn traffic into revenue.",
    category: "Growth",
    metaTitle: "Analytics & Conversion Rate Optimization",
    metaDescription:
      "Trustworthy analytics and conversion rate optimization — clean tracking, honest dashboards and A/B tested changes that turn existing traffic into revenue.",
    keywords: [
      "conversion rate optimization",
      "CRO services",
      "web analytics setup",
      "A/B testing",
      "GA4 setup",
      "conversion tracking",
    ],
    headline: "Turn the traffic you already have into revenue",
    subheadline:
      "Measurement you can trust, dashboards in plain English, and tested changes that lift conversion without spending another dollar on ads.",
    intro: [
      "Doubling traffic is expensive. Doubling the percentage of visitors who enquire is usually cheaper, faster, and permanent — and it makes every future marketing dollar work twice as hard.",
      "That starts with measurement you actually believe. Most analytics setups I inherit are quietly broken: duplicate tags, goals that never fired, bot traffic inflating everything. I fix the instrumentation first, find where money is leaking second, then test changes so the wins are proven rather than argued.",
    ],
    painPoints: [
      "You don't trust the numbers in your analytics.",
      "Nobody can tell you which channel produces actual customers.",
      "Ad spend is climbing and enquiries aren't.",
      "Site changes get made on opinion and nobody checks afterwards.",
      "Your dashboard has 40 metrics and answers no questions.",
    ],
    includes: [
      {
        title: "Analytics audit & rebuild",
        description:
          "GA4, tag manager and server-side events reviewed and rebuilt so events, goals and revenue actually reconcile.",
      },
      {
        title: "Conversion tracking that reconciles",
        description:
          "Every meaningful action tracked once — calls, forms, bookings, chats — and matched back to the source that produced it.",
      },
      {
        title: "Funnel & drop-off analysis",
        description:
          "Where people leave, on which device, from which channel — quantified, with the revenue attached to each leak.",
      },
      {
        title: "A/B testing programme",
        description:
          "Hypotheses ranked by expected impact, tested to significance, and honestly reported — including the losers.",
      },
      {
        title: "Session & heatmap review",
        description:
          "Recordings and scroll data to explain the numbers, so you're fixing a diagnosed problem rather than a guess.",
      },
      {
        title: "Plain-English reporting",
        description:
          "One dashboard that answers what came in, what it cost, and what to do next — no vanity metrics.",
      },
    ],
    process: [
      {
        step: "01",
        title: "Instrument",
        description:
          "Tracking audited and rebuilt so the baseline is real. Everything after this depends on the numbers being honest.",
      },
      {
        step: "02",
        title: "Diagnose",
        description:
          "Funnels, segments, recordings and heatmaps combined to find where revenue leaks and how much each leak is worth.",
      },
      {
        step: "03",
        title: "Test",
        description:
          "Prioritised hypotheses run as real experiments — copy, layout, form length, proof placement, pricing presentation.",
      },
      {
        step: "04",
        title: "Compound",
        description:
          "Winners shipped, losers documented, and the next round queued. Small monthly lifts stack into a different business.",
      },
    ],
    outcomes: [
      { stat: "1 pt", label: "of conversion lift often beats months of extra traffic" },
      { stat: "100%", label: "of tests reported — including the ones that lost" },
      { stat: "1", label: "dashboard that answers the only questions that matter" },
    ],
    whoFor: [
      "Businesses with steady traffic and disappointing enquiry numbers",
      "Teams spending on ads without trustworthy attribution",
      "E-commerce and lead-gen sites with an identifiable drop-off point",
      "Anyone who wants decisions settled by evidence instead of seniority",
    ],
    timeline: "Setup in 1–2 weeks, testing ongoing",
    priceRange: "$1.2k–$6k",
    faq: [
      {
        question: "How much traffic do I need for A/B testing?",
        answer:
          "Roughly 1,000 meaningful sessions and 25+ conversions a month per variant to reach significance in reasonable time. Below that we still improve conversion — through research, session review and best-practice fixes — we just don't pretend a coin flip is data.",
      },
      {
        question: "Is GA4 enough, or do I need something else?",
        answer:
          "GA4 configured properly covers most businesses. I often add a lightweight privacy-friendly analytics tool for numbers you can read at a glance, plus session recording during a CRO engagement.",
      },
      {
        question: "Can you fix tracking without rebuilding my site?",
        answer:
          "Usually yes. Tracking lives largely above the site itself, so an audit and rebuild of your measurement is possible on almost any platform, including WordPress, Shopify and Webflow.",
      },
      {
        question: "What if a test loses?",
        answer:
          "About a third do, and that's the point — you learn something for the cost of a test instead of shipping a downgrade permanently. Every result gets reported, win or lose.",
      },
    ],
    related: ["seo-marketing", "ui-ux-design", "ai-solutions"],
    reading: ["website-audit-checklist", "core-web-vitals-for-business-owners"],
    cta: {
      hook: "How much revenue is your funnel leaking?",
      copy: "I'll review your site's conversion paths and tracking setup, then send back where visitors are dropping out and what to test first — free.",
      button: "Get my free audit",
    },
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

/** Sibling services in the order the page author listed them. */
export function getRelatedServices(service: Service) {
  return service.related
    .map((slug) => getService(slug))
    .filter((item): item is Service => Boolean(item));
}
