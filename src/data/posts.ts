export type PostSection = {
  heading?: string;
  paragraphs: string[];
  list?: string[];
};

export type PostFaq = { question: string; answer: string };

/** Topic-specific closing hook — each post sells the audit in its own terms. */
export type PostCta = {
  hook: string;
  copy: string;
  button: string;
};

export type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO date, used for datePublished
  readTime: string;
  keywords: string[];
  sections: PostSection[];
  faq?: PostFaq[];
  cta: PostCta;
};

export const posts: Post[] = [
  {
    slug: "local-seo-map-pack",
    title: "How local businesses actually win the Google map pack",
    description:
      "The three pinned map results take most of the clicks for local searches. Here is what Google actually weighs — and the profile, review and location-page work that moves you into them.",
    category: "Local SEO",
    date: "2026-08-04",
    readTime: "8 min read",
    keywords: [
      "local SEO",
      "Google map pack",
      "Google Business Profile",
      "local search ranking",
      "reviews strategy",
    ],
    sections: [
      {
        paragraphs: [
          "Search for “HVAC repair near me” or “dentist in your town” and the first thing you see isn't a website — it's a map with three pinned businesses. That block is the map pack, and for local searches it takes the majority of clicks before a single traditional result gets seen.",
          "The good news: the map pack is not bought with ad spend, and it is winnable without a national brand's budget. It rewards businesses that do specific, unglamorous things consistently. This is the playbook I run for clients.",
        ],
      },
      {
        heading: "What Google weighs: relevance, distance, prominence",
        paragraphs: [
          "Google is open about its three local ranking factors. Relevance — how well your profile matches what was searched. Distance — how close you are to the searcher. Prominence — how well-known and well-reviewed your business appears, online and off.",
          "You can't move your shop closer to every searcher, so the work concentrates on relevance and prominence: a complete profile that says exactly what you do, and a steady accumulation of reviews, mentions and links that prove you're the established choice.",
        ],
      },
      {
        heading: "Your Google Business Profile is the new homepage",
        paragraphs: [
          "For many customers the profile is the only thing they'll ever see: hours, photos, reviews, a call button. Treat it like your homepage, not a listing you claimed once in 2019.",
          "Fill every field. Pick the most specific primary category available, then add secondary categories for every service line. List services with descriptions and prices where you can. Add real photos monthly — jobs, team, premises — because profiles with fresh photos get measurably more calls and direction requests.",
        ],
      },
      {
        heading: "Reviews are a ranking factor — and a conversion engine",
        paragraphs: [
          "Review count, velocity and recency all feed prominence. A business collecting four fresh reviews a month will steadily pass one sitting on a hundred old ones. And replies matter: responding to every review — including the rough ones — signals an active, accountable business to both Google and the humans reading.",
          "The trick is asking at the moment of delight: right after the job is done and the customer is happy. That timing is exactly what an automated follow-up (or an AI assistant) does reliably and a busy owner doesn't.",
        ],
      },
      {
        heading: "Location and service pages that don't feel like spam",
        paragraphs: [
          "If you serve multiple towns, each deserves one genuinely useful page: the services you offer there, local jobs you've completed, area-specific pricing or response times, and a map. What doesn't work anymore is the old trick of one template repeated forty times with the town name swapped.",
          "Pair every page with matching schema markup — a LocalBusiness or Service entity with the right areaServed — so machines can read what humans see.",
        ],
      },
      {
        heading: "NAP consistency and citations",
        paragraphs: [
          "Your name, address and phone number should be identical everywhere they appear — site, profile, directories, socials. Inconsistencies read as uncertainty about who you are, and uncertainty suppresses prominence.",
          "A citation cleanup is boring, finite work: fix the big directories once, then stop worrying. It's a foundation, not an ongoing tactic.",
        ],
      },
      {
        heading: "How to know it's working",
        paragraphs: [
          "Track three things monthly: your map pack position for the searches that matter, calls and direction requests from the profile (Google reports both), and form fills or bookings attributed to local search. Rankings are the means; booked work is the result.",
        ],
      },
    ],
    faq: [
      {
        question: "How long does local SEO take to show results?",
        answer:
          "Profile and review improvements often move the needle in four to eight weeks. Competitive map pack positions in bigger towns typically take three to six months of consistent work.",
      },
      {
        question: "Do I need a physical storefront to rank in the map pack?",
        answer:
          "No — service-area businesses rank too. You hide your address in the profile and define the areas you serve, and the same relevance and prominence work applies.",
      },
      {
        question: "Are directory citations still worth doing?",
        answer:
          "As a one-time cleanup, yes: consistent name, address and phone data across major directories removes doubt about your business identity. As a monthly service you keep paying for, generally no.",
      },
    ],
    cta: {
      hook: "Not showing up in the map pack?",
      copy: "Your free audit checks your profile, reviews and local pages against the businesses currently outranking you — and shows exactly where the gap is.",
      button: "Get my free local SEO audit",
    },
  },
  {
    slug: "schema-markup-plain-english",
    title: "Schema markup in plain English — and why Google rewards it",
    description:
      "Structured data is how you label your business, services and FAQs so machines understand them. A plain-English guide to JSON-LD, the schema types local businesses need, and the mistakes to avoid.",
    category: "Technical SEO",
    date: "2026-07-21",
    readTime: "7 min read",
    keywords: [
      "schema markup",
      "structured data",
      "JSON-LD",
      "LocalBusiness schema",
      "rich results",
      "semantic HTML",
    ],
    sections: [
      {
        paragraphs: [
          "Your website says “Beltowski Plumbing — emergency call-outs across Springfield.” A human reads that and understands everything: the business, the service, the area. A search engine reads it and sees a sentence that might mean anything.",
          "Schema markup closes that gap. It's a vocabulary — agreed on by Google, Microsoft and others at schema.org — for labelling your pages so machines know this is a business, that is its service area, those are real customer reviews. Sites that speak it clearly are easier to trust, easier to feature, and eligible for richer search results.",
        ],
      },
      {
        heading: "What structured data actually does",
        paragraphs: [
          "Two things. First, eligibility: FAQ dropdowns, review stars, breadcrumbs and business panels in search results are drawn from structured data — no markup, no rich result. Second, disambiguation: it connects your pages into one unambiguous entity, so Google knows your homepage, your profile and your blog all describe the same business.",
          "Neither is a magic ranking switch. But richer results earn more clicks at the same position, and a clearly-understood business gets surfaced more confidently for relevant searches — especially local ones.",
        ],
      },
      {
        heading: "JSON-LD: the format Google prefers",
        paragraphs: [
          "There are three ways to write schema, and only one worth using: JSON-LD — a small script block in your page's code that describes the page in structured form. It doesn't touch your visible design, it's easy to maintain, and it's the format Google explicitly recommends.",
          "If your site runs on a modern framework, your developer can generate it automatically from the same data that renders the page — which means it never drifts out of date.",
        ],
      },
      {
        heading: "The schema types a local business actually needs",
        paragraphs: [
          "You need a handful, done well — not all eight hundred types in the vocabulary:",
        ],
        list: [
          "LocalBusiness (or a specific subtype like Plumber, Dentist, ProfessionalService) — your identity: name, address, phone, hours, areaServed.",
          "Service — one per major service line, linked to the business.",
          "FAQPage — for genuine frequently-asked questions you answer on the page.",
          "BreadcrumbList — how the page fits your site's hierarchy.",
          "BlogPosting — for articles, with author and publish date.",
        ],
      },
      {
        heading: "Semantic HTML is the foundation schema builds on",
        paragraphs: [
          "Structured data works best on a page that's already structured: one h1 that says what the page is, h2s that outline it, real header, nav, main and article elements instead of a soup of anonymous boxes, dates marked up as dates.",
          "Search engines parse semantic HTML to understand content even before schema — and accessibility tools depend on it. If your site fails this baseline, fix it first; schema on top of div-soup is lipstick on a labyrinth.",
        ],
      },
      {
        heading: "The mistakes that get sites in trouble",
        paragraphs: [
          "Schema describes what's visibly on the page — nothing more. Marking up reviews that appear nowhere, five-star ratings you can't show, or services you don't offer is the fast route to a manual penalty.",
          "The other common failures are duplication (three plugins each injecting a conflicting LocalBusiness) and staleness (schema saying open till 6pm when you changed your hours a year ago). One source of truth, generated from real data, solves both.",
        ],
      },
      {
        heading: "Test before you ship",
        paragraphs: [
          "Google's Rich Results Test shows what a page is eligible for; the schema.org validator catches structural errors; Search Console reports enhancement issues across the whole site over time. Run the first two on every template you change, and check the third monthly.",
        ],
      },
    ],
    cta: {
      hook: "Does Google actually understand your site?",
      copy: "The free audit includes a schema and semantic-HTML check — what's marked up, what's missing, and which rich results you're leaving unclaimed.",
      button: "Check my site's markup",
    },
  },
  {
    slug: "ai-assistants-that-book-clients",
    title: "AI assistants that book clients — not just chat",
    description:
      "Most website chatbots answer questions and lose the lead anyway. The difference between a toy and a booking assistant: calendar integration, qualification, speed-to-lead and a clean human handoff.",
    category: "AI Solutions",
    date: "2026-07-02",
    readTime: "6 min read",
    keywords: [
      "AI chatbot for business",
      "AI booking assistant",
      "lead qualification",
      "speed to lead",
      "AI for HVAC",
      "AI receptionist",
    ],
    sections: [
      {
        paragraphs: [
          "Every business website can have a chat widget in five minutes. Most of them answer a few questions, collect an email address that goes nowhere, and quietly lose the lead. That's a toy.",
          "A booking assistant is a different machine: it answers, qualifies, and puts a real appointment on your real calendar — at 2pm or 2am. The distinction is worth actual revenue, and it's the difference between AI as decoration and AI as staff.",
        ],
      },
      {
        heading: "A chatbot chats. A booking assistant closes.",
        paragraphs: [
          "The test is simple: can the assistant complete the transaction your business runs on? For an HVAC company that's a scheduled service call with address and issue captured. For a clinic it's an appointment in the practice system. For a law firm it's a consultation with intake details attached.",
          "That requires plumbing, not just a language model: calendar integration, your pricing and service rules, and writes into whatever CRM or job system you already use. It's why a real deployment is a small project, not a widget install — and why it actually pays back.",
        ],
      },
      {
        heading: "Qualify before you calendar",
        paragraphs: [
          "An assistant that books everyone books tire-kickers. A good one asks the three or four questions you'd ask: what's the job, where, how urgent, rough budget. Emergencies route to your phone; good fits book straight in; poor fits get a polite redirect.",
          "Owners consistently report this as the biggest surprise benefit — not more appointments, but better ones.",
        ],
      },
      {
        heading: "Speed-to-lead is the whole game",
        paragraphs: [
          "Leads answered within five minutes convert at multiples of leads answered within an hour — and most businesses answer in hours, or the next morning, if at all. Nights, weekends and busy days are exactly when enquiries leak to whoever replies first.",
          "This is the structural advantage of an AI assistant: it's not smarter than you, it's simply always there in the first five minutes, every time.",
        ],
      },
      {
        heading: "Design the human handoff",
        paragraphs: [
          "The failure mode everyone fears is the bot that traps a frustrated customer. The fix is designed escalation: on request, on emergency keywords, or whenever confidence drops, the assistant hands off — with the full transcript delivered to you so the customer never repeats themselves.",
          "An assistant that knows its limits builds trust. One that bluffs destroys it.",
        ],
      },
      {
        heading: "Measure it like a channel",
        paragraphs: [
          "Judge the assistant the way you'd judge an employee: conversations handled, appointments booked, show rate, revenue attributed. If a review-and-referral loop runs through it too, count those. When the numbers are visible, the question stops being “is AI worth it” and becomes “what else should it handle.”",
        ],
      },
    ],
    cta: {
      hook: "How many leads leaked away while you were on a job?",
      copy: "The free audit maps where an assistant would pay for itself first — after-hours enquiries, quote follow-ups and no-show reminders included.",
      button: "Find my AI opportunity",
    },
  },
  {
    slug: "core-web-vitals-for-business-owners",
    title: "Core Web Vitals, minus the jargon",
    description:
      "Google grades your site on three real-experience numbers — loading, responsiveness and visual stability. What LCP, INP and CLS mean in business terms, and the fixes that usually matter.",
    category: "Performance",
    date: "2026-06-10",
    readTime: "6 min read",
    keywords: [
      "Core Web Vitals",
      "page speed",
      "LCP",
      "INP",
      "CLS",
      "website performance for business",
    ],
    sections: [
      {
        paragraphs: [
          "Google measures how your website feels to use — not in a lab, but from the phones of your actual visitors. Those measurements are the Core Web Vitals, they're part of how rankings are decided, and they're reported in plain sight for anyone who looks.",
          "More importantly: the same slowness that costs you ranking costs you customers directly. Visitors on a phone with three bars don't wait for a slow site — they tap back and call the next result.",
        ],
      },
      {
        heading: "The three numbers",
        paragraphs: ["Each vital captures one moment of the experience:"],
        list: [
          "LCP (Largest Contentful Paint) — how long until the main content is visibly there. Target: under 2.5 seconds.",
          "INP (Interaction to Next Paint) — when a visitor taps a button or menu, how fast the site responds. Target: under 200 milliseconds.",
          "CLS (Cumulative Layout Shift) — how much the page jumps around while loading, the thing that makes you tap the wrong button. Target: essentially none.",
        ],
      },
      {
        heading: "Speed converts before it ranks",
        paragraphs: [
          "The ranking effect of vitals is real but modest — a tiebreaker among similar results. The conversion effect is blunt: every added second of load time measurably increases abandonment, on mobile especially. A slow site pays for traffic and then wastes it.",
          "That's why I treat performance as conversion work first and SEO second. The rankings follow the experience.",
        ],
      },
      {
        heading: "The usual suspects",
        paragraphs: [
          "Nearly every slow business site has the same handful of causes: photos uploaded at camera resolution, page builders shipping megabytes of JavaScript for a brochure page, fonts loading late and shifting the layout, bargain hosting that takes a second before sending anything, and a decade of accumulated plugins and tracking scripts.",
          "None of these need a redesign to fix. Most fall to an afternoon of disciplined cleanup: compress and resize images, drop dead scripts, preload the fonts, upgrade the hosting tier.",
        ],
      },
      {
        heading: "Check your site today",
        paragraphs: [
          "Put your address into PageSpeed Insights. The top section — “what real users experience” — is the one that matters; it's the same field data Google uses. If it's green, move on to more productive work. If it's not, you now have a prioritized list, and it's the first thing I look at in every audit.",
        ],
      },
    ],
    cta: {
      hook: "Is your site failing its vitals right now?",
      copy: "I'll pull your real-user speed data, show which of the three numbers is costing you customers, and hand you the shortest path back to green.",
      button: "Test my site's speed",
    },
  },
  {
    slug: "website-audit-checklist",
    title: "The 15-point audit I run on every business website",
    description:
      "Search visibility, speed, conversion and AI opportunity — the exact checklist behind the free audit, and why each point ends up costing businesses leads when it fails.",
    category: "Conversion",
    date: "2026-05-18",
    readTime: "7 min read",
    keywords: [
      "website audit",
      "SEO audit checklist",
      "conversion audit",
      "small business website",
      "free website audit",
    ],
    sections: [
      {
        paragraphs: [
          "Every audit I deliver is a short video walking through the same fifteen points on your actual site — what's fine, what's leaking leads, and what I'd fix first. No forty-page PDF generated by a tool; a prioritized list a human made looking at your business.",
          "Here's the checklist itself. Run it yourself if you like — the points are simple to check and brutal in aggregate.",
        ],
      },
      {
        heading: "Search visibility (points 1–5)",
        paragraphs: [
          "Can you be found by people who don't know your name yet?",
        ],
        list: [
          "1. Indexing — are your important pages actually in Google, and are junk pages kept out?",
          "2. Titles & descriptions — does each page say what it is and where, in words customers search?",
          "3. Structured data — does schema markup identify your business, services and FAQs?",
          "4. Local presence — Google Business Profile complete, categories right, reviews recent?",
          "5. Content gaps — do the services you profit from most each have a real page?",
        ],
      },
      {
        heading: "Speed & stability (points 6–9)",
        paragraphs: ["Does the site feel instant on a normal phone?"],
        list: [
          "6. Core Web Vitals — passing in real-user data, not just lab tests?",
          "7. Images — sized and compressed, or camera-roll originals?",
          "8. Mobile experience — readable, tappable, nothing broken at phone width?",
          "9. Hosting — is the server itself fast enough to bother optimizing the rest?",
        ],
      },
      {
        heading: "Conversion (points 10–13)",
        paragraphs: ["When the right visitor lands, does the site sell?"],
        list: [
          "10. Five-second clarity — does the top of the homepage say what you do, for whom, where?",
          "11. Calls to action — is the next step obvious on every page, or buried once in a footer?",
          "12. Forms — short enough to finish, and does anyone actually receive the submissions?",
          "13. Trust — reviews, real photos, a human face; reasons to pick you visible before the fold?",
        ],
      },
      {
        heading: "AI opportunity (points 14–15)",
        paragraphs: ["What's being done by hand that shouldn't be?"],
        list: [
          "14. Response coverage — what happens to enquiries at night and weekends, and how fast is the reply?",
          "15. Automatable busywork — follow-ups, review requests, reminders, FAQs an assistant could carry.",
        ],
      },
      {
        heading: "What you get",
        paragraphs: [
          "If you'd rather not spend your afternoon on this: the audit is free, recorded personally against your site, and lands in your inbox within 48 hours — with the fifteen points scored and the top three fixes ranked by impact. It's yours to keep whoever you build with.",
        ],
      },
    ],
    cta: {
      hook: "Want the 15 points scored for you?",
      copy: "Free, recorded personally against your site, in your inbox within 48 hours — with the top three fixes ranked by impact. No sales call attached.",
      button: "Run my free audit",
    },
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
