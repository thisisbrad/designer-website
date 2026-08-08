export type Social = {
  label: string;
  href: string;
  /** Handle shown on the contact page; the homepage section only uses labels. */
  handle: string;
};

export const socials: Social[] = [
  { label: "Twitter / X", href: "https://x.com", handle: "@beltowski" },
  {
    label: "Instagram",
    href: "https://instagram.com",
    handle: "@beltowski.studio",
  },
  { label: "LinkedIn", href: "https://linkedin.com", handle: "in/beltowski" },
  { label: "GitHub", href: "https://github.com", handle: "thisisbrad" },
];

/** Where enquiries go and how fast they're answered — reused in schema. */
export const availability = {
  responseTime: "Within 48 hours, usually sooner",
  booking: "Currently booking Q3 2026",
  hours: "Mon–Fri, 9am–6pm ET",
  timezone: "America/New_York",
  base: "Florida, United States",
};
