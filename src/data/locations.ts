export type Location = {
  /** URL segment under /services/[service]/ */
  slug: string;
  city: string;
  region: string;
  regionCode: string;
  /** Metro counties — the honest service radius, not a citywide claim. */
  counties: string[];
  /** Neighbourhoods and suburbs named on the page. Real coverage, not filler. */
  areas: string[];
  geo: { latitude: number; longitude: number };
  /** Service radius in km for the GeoCircle in schema. */
  radiusKm: number;
};

export type LocationFactor = { title: string; description: string };

export type LocationFaq = { question: string; answer: string };

export type LocationCta = { hook: string; copy: string; button: string };

/**
 * A service scoped to a city. The deliverables and process come from the
 * parent service — the work doesn't change by postcode — so everything here
 * is what's genuinely different about doing it in this market.
 */
export type LocationService = {
  /** Slug of the parent service in data/services.ts */
  service: string;
  /** Slug of the location in `locations` below */
  location: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  headline: string;
  subheadline: string;
  /** Market context — why this city isn't the generic case. */
  context: string[];
  factors: LocationFactor[];
  /** Local sectors this service is actually bought by here. */
  industries: string[];
  faq: LocationFaq[];
  cta: LocationCta;
};

export const locations: Location[] = [
  {
    slug: "orlando",
    city: "Orlando",
    region: "Florida",
    regionCode: "FL",
    counties: ["Orange County", "Seminole County", "Osceola County", "Lake County"],
    areas: [
      "Downtown Orlando",
      "Winter Park",
      "Lake Nona",
      "Dr. Phillips",
      "Baldwin Park",
      "College Park",
      "Thornton Park",
      "Windermere",
      "Maitland",
      "Altamonte Springs",
      "Oviedo",
      "Winter Garden",
      "Kissimmee",
      "Sanford",
      "Apopka",
      "Clermont",
    ],
    geo: { latitude: 28.5384, longitude: -81.3789 },
    radiusKm: 60,
  },
];

export const locationServices: LocationService[] = [
  {
    service: "web-design",
    location: "orlando",
    metaTitle: "Orlando Web Design — Custom Sites That Convert",
    metaDescription:
      "Custom Orlando web design for hospitality, home services and healthcare — fast, bilingual-ready sites built to convert visitors and residents alike.",
    keywords: [
      "Orlando web design",
      "web design Orlando FL",
      "Orlando website designer",
      "Winter Park web design",
      "Lake Nona web design",
      "Central Florida web design",
    ],
    headline: "Orlando web design for businesses that need to be chosen, not just found",
    subheadline:
      "Custom sites for Central Florida businesses — built for a market where half your traffic is on a phone, out of state, and deciding between you and four competitors in the same search.",
    context: [
      "Orlando is not a normal local market. A visitor booking an airport transfer from Ohio, a Lake Nona family choosing a pediatric dentist, and a property manager sourcing a roofer after a storm are three completely different buyers — and in a lot of Orlando businesses, all three land on the same homepage and get the same generic pitch.",
      "The metro is also sprawling and competitive. Along I-4 you're up against national franchises with real marketing budgets and a long tail of businesses whose sites were built once, in 2016, on a page builder. Looking obviously better than that is a lower bar than most owners think — and the businesses that clear it stop competing on price.",
      "I design Orlando sites around who actually arrives and what they need to believe. Sometimes that means a booking flow that works one-handed on a phone in a theme park queue. Sometimes it means a Spanish-language path that isn't a mangled auto-translation. Usually it means saying what you do and where you do it, faster than the competitor tab that's already open.",
    ],
    factors: [
      {
        title: "Tourist intent and resident intent aren't the same visit",
        description:
          "A visitor wants availability, distance and a price now. A resident wants credibility, licensing and someone who'll still be around next year. One homepage can serve both — but only if it's designed to split them in the first screen.",
      },
      {
        title: "Bilingual, done properly",
        description:
          "Central Florida has a large Spanish-speaking population, and a machine-translated page reads as carelessness in exactly the market you're trying to win. Where it's worth doing, I build a real Spanish path with its own URLs and hreflang — not a translate widget.",
      },
      {
        title: "Mobile is the primary device, not the fallback",
        description:
          "Tourists, tradespeople on site and anyone searching from a car are all on a phone on a patchy connection. Orlando sites get designed at 375px first and tested on real handsets, because that's where the enquiry actually gets made.",
      },
      {
        title: "Storm season changes what the site has to do",
        description:
          "For roofers, restoration, tree services and property managers, June to November is a different business. Sites for those sectors get an emergency path — visible phone, clear service area, honest response times — that can be surfaced when it matters.",
      },
    ],
    industries: [
      "Hospitality, attractions and vacation rentals",
      "Home services — roofing, HVAC, pool, restoration",
      "Healthcare and dental practices",
      "Property management and real estate",
      "Professional services and legal",
      "Restaurants and hospitality groups",
    ],
    faq: [
      {
        question: "Do you work with Orlando businesses in person?",
        answer:
          "Yes — I'm Florida-based and happy to meet in person for the kickoff session if you're in the metro. Most of the work after that runs better over shared screens and a staging link you can open on your own phone, wherever you are.",
      },
      {
        question: "Can you build the site in English and Spanish?",
        answer:
          "Yes, and it's worth doing for a lot of Central Florida businesses. That means real translated content on its own URLs with hreflang tags — not a browser translate widget, which Google largely ignores and customers can spot immediately.",
      },
      {
        question: "We get most of our business from tourists. Does that change the design?",
        answer:
          "Considerably. Out-of-state visitors buy on availability, distance from where they're staying and trust signals they can verify in seconds — so booking, hours, location and reviews move to the top. Read more in [my guide to the Google map pack](/blog/local-seo-map-pack), which covers how visitors actually find you first.",
      },
      {
        question: "Do you only work with Orlando businesses?",
        answer:
          "No — I work with clients across Florida and the US. Orlando gets its own page because the market genuinely differs, not because I only serve one metro.",
      },
    ],
    cta: {
      hook: "See how your Orlando site compares to whoever's outranking you.",
      copy: "I'll run my 15-point audit against your closest Central Florida competitors and send back the design and conversion gaps that are costing you enquiries — free.",
      button: "Get my free audit",
    },
  },
  {
    service: "seo-marketing",
    location: "orlando",
    metaTitle: "Orlando SEO — Local Search & Map Pack Rankings",
    metaDescription:
      "Orlando SEO built on engineering — map pack rankings across Orange, Seminole and Osceola counties, technical fixes and content that earns local search.",
    keywords: [
      "Orlando SEO",
      "SEO Orlando FL",
      "local SEO Orlando",
      "Orlando SEO company",
      "Winter Park SEO",
      "Central Florida SEO",
    ],
    headline: "Orlando SEO that wins the map pack, suburb by suburb",
    subheadline:
      "Technical SEO and local search for Central Florida — built around the fact that no single Orlando business ranks across the whole metro, and the ones that pretend otherwise waste your budget.",
    context: [
      "Here's the thing most Orlando SEO pitches skip: distance is a ranking factor you cannot buy your way around. A shop in Winter Park will not rank in the map pack for someone searching from Kissimmee, thirty miles down the road. The metro sprawls across four counties, and Google treats it that way even when your marketing plan doesn't.",
      "So \"rank in Orlando\" is the wrong goal. The right one is to own the searches you can realistically win — your immediate radius first, then the neighbouring suburbs where you genuinely serve, backed by location pages that are actually useful rather than the same paragraph with the town name swapped. Google got good at spotting the latter years ago.",
      "The other Orlando-specific wrinkle is who's searching. Half the intent in hospitality and attractions comes from people who aren't here yet, searching from another state or another country — which behaves nothing like a resident typing \"near me\" from their driveway. Those need different pages, not the same page tuned harder.",
    ],
    factors: [
      {
        title: "Distance means a suburb strategy, not a city strategy",
        description:
          "Ranking work gets sequenced by proximity: dominate your own radius, then expand into Winter Park, Oviedo, Dr. Phillips or Kissimmee with pages and signals that earn it. Chasing \"Orlando\" as one keyword burns budget on searches you're geographically excluded from.",
      },
      {
        title: "Visitor searches and resident searches need separate pages",
        description:
          "\"Things to do near Universal\" and \"emergency AC repair near me\" are different businesses wearing the same domain. Keyword mapping splits them so each page answers one intent properly instead of hedging between two.",
      },
      {
        title: "Franchise competitors set the technical floor",
        description:
          "Along the I-4 corridor you're often competing with national brands whose technical SEO is already handled. Beating them locally means winning on the things a national can't fake: genuine local content, real reviews and a Google Business Profile that's actively worked.",
      },
      {
        title: "Seasonality is a content calendar, not noise",
        description:
          "Storm season, snowbird season and convention season each move demand hard in different sectors. Content and profile posts get planned against that calendar so you're ranking before the surge, not writing during it.",
      },
    ],
    industries: [
      "Home services with storm-driven demand",
      "Hospitality, attractions and tour operators",
      "Healthcare, dental and specialist clinics",
      "Legal and professional services",
      "Multi-location retail and franchises",
      "Property management and vacation rentals",
    ],
    faq: [
      {
        question: "Can I rank across all of Orlando?",
        answer:
          "Not in the map pack, and anyone promising it is selling you something. Proximity is one of Google's three local ranking factors, so your pinned results are bounded by where you actually are. Organic results reach further, which is where location pages and content do the work — I explain the mechanics in [how local businesses win the map pack](/blog/local-seo-map-pack).",
      },
      {
        question: "Do I need a physical Orlando address?",
        answer:
          "For map pack rankings, yes — Google requires a real location with in-person contact, and virtual offices get profiles suspended. Without one you can still compete hard in organic local results, and I'll be straight with you about which of the two we're realistically playing for.",
      },
      {
        question: "How long until we see results in this market?",
        answer:
          "Technical fixes can move things in weeks. Competitive Orlando terms — anything in home services or hospitality — usually take three to six months of consistent work, because you're displacing businesses that have been accumulating reviews and links for years.",
      },
      {
        question: "Do you build location pages for every suburb?",
        answer:
          "Only where you genuinely serve and can say something specific. Templated town-swap pages stopped working a long time ago and now risk being treated as spam. Four real pages beat forty thin ones, every time.",
      },
      {
        question: "What about Spanish-language search?",
        answer:
          "It's a genuine and under-served opportunity in Central Florida. Where it fits your customer base, I'll map Spanish keywords and build properly translated pages with hreflang — most of your competitors won't have bothered.",
      },
    ],
    cta: {
      hook: "Find out which Orlando searches you can actually win.",
      copy: "I'll audit your site and Google Business Profile against the Central Florida competitors outranking you, then send back the realistic targets in priority order — free.",
      button: "Get my free audit",
    },
  },
  {
    service: "ai-solutions",
    location: "orlando",
    metaTitle: "Orlando AI Solutions — Assistants That Book Clients",
    metaDescription:
      "Custom AI assistants for Orlando businesses — bilingual, 24/7 enquiry handling and booking for hospitality, home services and clinics across Central Florida.",
    keywords: [
      "Orlando AI solutions",
      "AI assistant Orlando",
      "AI chatbot Orlando FL",
      "business automation Orlando",
      "Central Florida AI consultant",
      "bilingual AI assistant",
    ],
    headline: "AI assistants for Orlando businesses that never stop getting enquiries",
    subheadline:
      "Custom assistants trained on your business — answering out-of-state visitors at 2am, handling Spanish, and booking the job before your competitor's voicemail picks up.",
    context: [
      "Orlando businesses get enquiries at hours that make no sense for a local team. A family in California planning next spring's trip. A guest whose AC died at midnight. A property manager triaging storm damage before dawn. In every one of those, the business that answers first usually gets the job, and the rest find out they lost it days later — if at all.",
      "That's the specific problem an assistant is good at. Not a chat widget that stalls people until morning, but something that knows your service area across four counties, your pricing rules, what you will and won't take on, and can put a real appointment in a real calendar at three in the morning.",
      "Central Florida adds two wrinkles worth building for: a large Spanish-speaking customer base that most competitors are quietly ignoring, and demand that spikes violently — storm season for home services, convention and holiday weeks for hospitality. Both are situations where a human team gets buried and an assistant simply doesn't.",
    ],
    factors: [
      {
        title: "Out-of-state and overnight enquiries",
        description:
          "A lot of Orlando demand originates in other time zones and other planning horizons. An assistant that answers accurately at 2am converts enquiries your team was never going to see until the queue had already gone cold.",
      },
      {
        title: "Bilingual by default",
        description:
          "Handling Spanish properly is one of the cheapest competitive advantages available in this market. The assistant switches language naturally and escalates to a human who can continue the conversation — not a dead end in the wrong language.",
      },
      {
        title: "Service area that spans four counties",
        description:
          "Orange, Seminole, Osceola and Lake are a lot of ground, and half of qualifying is just working out whether you'll travel there and what it costs. The assistant asks that first, so your team stops quoting jobs it was never going to take.",
      },
      {
        title: "Surge capacity when the market spikes",
        description:
          "After a storm, or during a convention week, enquiry volume can multiply overnight. Assistants triage the flood — genuine emergencies escalated immediately, routine questions answered, everything else captured with a transcript instead of lost.",
      },
    ],
    industries: [
      "Home services and emergency restoration",
      "Hotels, vacation rentals and property management",
      "Dental and medical practices",
      "Attractions, tours and event operators",
      "Trades and contractors with wide service areas",
      "Professional services fielding repetitive intake",
    ],
    faq: [
      {
        question: "Can the assistant handle Spanish enquiries?",
        answer:
          "Yes — that's one of the strongest reasons to build one in this market. It detects and responds in Spanish, keeps the same accuracy constraints as the English path, and escalates to a human who can actually continue in that language rather than dumping the customer.",
      },
      {
        question: "Can it tell customers whether we cover their area?",
        answer:
          "Yes, and it's usually the first thing worth automating in a metro this size. The assistant knows your service radius and any travel or minimum-charge rules, so an enquiry from Clermont or Sanford gets an honest answer immediately instead of a callback that wastes both sides' time.",
      },
      {
        question: "Will it book directly into our calendar?",
        answer:
          "That's the point of it. It qualifies against the questions your intake process actually needs, then books into your calendar or pushes a qualified lead to your CRM — see [AI assistants that book clients, not just chat](/blog/ai-assistants-that-book-clients) for how that's put together.",
      },
      {
        question: "What happens during a storm surge?",
        answer:
          "The assistant triages: genuine emergencies get escalated to a human immediately with the details already captured, routine questions get answered, and everything else is logged with a transcript so nothing is lost in the volume. You set where those lines sit before launch.",
      },
      {
        question: "Do you meet with Orlando clients in person?",
        answer:
          "For the mapping session at the start, gladly — that one goes better in a room. The build, testing and monthly tuning all run remotely.",
      },
    ],
    cta: {
      hook: "See what an assistant would handle for your Orlando business.",
      copy: "Send me your site and I'll come back with the enquiries an assistant could answer today, what it could book overnight, and what it should never touch — free.",
      button: "Get my free audit",
    },
  },
];

export function getLocation(slug: string) {
  return locations.find((location) => location.slug === slug);
}

export function getLocationService(service: string, location: string) {
  return locationServices.find(
    (item) => item.service === service && item.location === location
  );
}

/** Cities with a page for this service — drives the parent page's "serving" links. */
export function getLocationsForService(service: string) {
  return locationServices
    .filter((item) => item.service === service)
    .map((item) => getLocation(item.location))
    .filter((location) => location !== undefined);
}

/** Sibling city pages — the internal link graph within one market. */
export function getServicesForLocation(location: string, excludeService?: string) {
  return locationServices.filter(
    (item) => item.location === location && item.service !== excludeService
  );
}
