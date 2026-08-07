export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  year: string;
  role: string;
  summary: string;
  tags: string[];
  metric: { value: string; label: string };
  palette: { from: string; to: string; glow: string };
};

export const projects: Project[] = [
  {
    slug: "atlas-studio",
    index: "01",
    title: "Atlas Studio",
    category: "Website & SEO",
    year: "2025",
    role: "Design & SEO Strategy",
    summary:
      "A full rebuild for a creative agency — editorial design on a technical-SEO backbone. Site architecture, content strategy and Core Web Vitals tuned until organic traffic tripled.",
    tags: ["Next.js", "Technical SEO", "Content Strategy", "CMS"],
    metric: { value: "3.2×", label: "Organic traffic in six months" },
    palette: { from: "#1a2620", to: "#0c0f0d", glow: "#7dffb2" },
  },
  {
    slug: "northline",
    index: "02",
    title: "Northline",
    category: "Landing & CRO",
    year: "2025",
    role: "Design & Frontend",
    summary:
      "A conversion-focused launch page for a hardware startup — fast, story-driven and relentlessly measured, with A/B-tested sections and a search-ready architecture from day one.",
    tags: ["CRO", "A/B Testing", "GSAP", "Analytics"],
    metric: { value: "+48%", label: "Trial signups after relaunch" },
    palette: { from: "#101722", to: "#0a0c10", glow: "#7db8ff" },
  },
  {
    slug: "verano-motors",
    index: "03",
    title: "Verano Motors",
    category: "AI Concierge & Local SEO",
    year: "2024",
    role: "Design & AI Integration",
    summary:
      "A luxury dealership group with an always-on AI concierge — booking test drives, answering inventory questions and feeding a local-search engine across twelve locations.",
    tags: ["AI Chat", "Local SEO", "Claude API", "Automation"],
    metric: { value: "63%", label: "Enquiries handled end-to-end by AI" },
    palette: { from: "#221a14", to: "#100c09", glow: "#ffb36b" },
  },
  {
    slug: "finsight",
    index: "04",
    title: "FinSight",
    category: "AI Assistant & Dashboard",
    year: "2024",
    role: "UX & AI Design",
    summary:
      "A financial dashboard with a built-in AI analyst — dense data made calm, and natural-language answers that replace hours of manual reporting every week.",
    tags: ["AI UX", "Data Viz", "Design System", "TypeScript"],
    metric: { value: "11h", label: "Saved per team, per week" },
    palette: { from: "#161426", to: "#0b0a12", glow: "#b49bff" },
  },
];
