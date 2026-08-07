export type Solution = {
  index: string;
  phase: string;
  title: string;
  description: string;
  deliverables: string[];
  outcome: string;
};

export const solutions: Solution[] = [
  {
    index: "01",
    phase: "Attract",
    title: "Get found first",
    description:
      "Most customers start with a search. A technical SEO foundation, a real content strategy and a strong local presence put your business in front of them — before your competitors.",
    deliverables: [
      "Full SEO audit & fixes",
      "Site architecture & structured data",
      "Content & keyword strategy",
      "Local search & business profile",
    ],
    outcome: "Outcome — qualified traffic that compounds",
  },
  {
    index: "02",
    phase: "Convert",
    title: "Turn visits into enquiries",
    description:
      "Traffic means nothing if the site doesn't sell. Conversion-focused design, honest messaging and pages that load instantly turn browsers into booked calls.",
    deliverables: [
      "Conversion-first design & build",
      "Messaging & copy that sells",
      "Core Web Vitals & speed budget",
      "Analytics & A/B testing",
    ],
    outcome: "Outcome — more enquiries from the same traffic",
  },
  {
    index: "03",
    phase: "Automate",
    title: "Let AI handle the busywork",
    description:
      "An AI assistant that answers questions, qualifies leads and books appointments around the clock — plus automations that keep follow-ups, reviews and reporting running on their own.",
    deliverables: [
      "AI chat assistant on your site",
      "Lead qualification & booking",
      "Review & follow-up automation",
      "Plain-English monthly reporting",
    ],
    outcome: "Outcome — a team member that never sleeps",
  },
];
