export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  year: string;
  role: string;
  summary: string;
  tags: string[];
  palette: { from: string; to: string; glow: string };
};

export const projects: Project[] = [
  {
    slug: "atlas-studio",
    index: "01",
    title: "Atlas Studio",
    category: "Brand & Website",
    year: "2025",
    role: "Design & Development",
    summary:
      "A complete brand and web system for a creative agency — editorial layouts, a living style engine, and a CMS the team actually enjoys using.",
    tags: ["Art Direction", "Next.js", "CMS", "Motion"],
    palette: { from: "#1a2620", to: "#0c0f0d", glow: "#7dffb2" },
  },
  {
    slug: "northline",
    index: "02",
    title: "Northline",
    category: "Product Landing",
    year: "2025",
    role: "Design & Frontend",
    summary:
      "An interactive landing experience for a hardware launch — scroll-driven product storytelling with real-time 3D and obsessive performance budgets.",
    tags: ["WebGL", "Three.js", "GSAP", "Storytelling"],
    palette: { from: "#101722", to: "#0a0c10", glow: "#7db8ff" },
  },
  {
    slug: "verano-motors",
    index: "03",
    title: "Verano Motors",
    category: "Digital Experience",
    year: "2024",
    role: "Creative Direction & Build",
    summary:
      "A luxury automotive configurator and brand site — cinematic transitions, tactile materials, and a purchase flow that actually converts.",
    tags: ["E-commerce", "Cinematics", "UI Design", "React"],
    palette: { from: "#221a14", to: "#100c09", glow: "#ffb36b" },
  },
  {
    slug: "finsight",
    index: "04",
    title: "FinSight",
    category: "Dashboard & AI",
    year: "2024",
    role: "UX & Design System",
    summary:
      "A financial dashboard and AI assistant interface — dense data made calm, with a design system that scales across forty-plus screens.",
    tags: ["Design System", "Data Viz", "AI UX", "TypeScript"],
    palette: { from: "#161426", to: "#0b0a12", glow: "#b49bff" },
  },
];
