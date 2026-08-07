export type Service = {
  index: string;
  title: string;
  description: string;
};

export const services: Service[] = [
  {
    index: "01",
    title: "Web Design",
    description:
      "Editorial, conversion-aware layouts that make businesses feel inevitable — designed in the browser, not just in Figma.",
  },
  {
    index: "02",
    title: "Frontend Development",
    description:
      "Production-grade React, Next.js and TypeScript. Fast, accessible, and maintainable long after launch day.",
  },
  {
    index: "03",
    title: "UI/UX Design",
    description:
      "Interfaces with clear hierarchy and honest flows — tested against real tasks, not taste alone.",
  },
  {
    index: "04",
    title: "SEO Marketing",
    description:
      "Technical audits, site architecture, content strategy and local search — rankings earned with engineering, not tricks.",
  },
  {
    index: "05",
    title: "AI Solutions",
    description:
      "Custom assistants, chat concierges and automations built on modern AI models — integrated into your site and workflows, not bolted on.",
  },
  {
    index: "06",
    title: "Analytics & CRO",
    description:
      "Clean measurement, honest dashboards and A/B-tested improvements that turn traffic into revenue.",
  },
];
