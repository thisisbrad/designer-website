import { OWNER_NAME, SITE_EMAIL, SITE_NAME } from "@/lib/site";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalDoc = {
  slug: string;
  /** Short label for nav, breadcrumbs and the footer. */
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** ISO date shown to readers and emitted as dateModified. */
  updated: string;
  headline: string;
  intro: string;
  sections: LegalSection[];
};

/* Written against what the code actually does — the two API routes, the
   hosting and the email provider — rather than generic boilerplate. If the
   site gains analytics, a chat widget or embeds, the "What this site
   doesn't do" section below stops being true and has to change with it. */

export const privacy: LegalDoc = {
  slug: "privacy",
  title: "Privacy",
  metaTitle: "Privacy Policy",
  metaDescription:
    "What this site collects, who processes it and how to have it deleted. No cookies, no analytics, no tracking — only what you type into a form.",
  updated: "2026-08-09",
  headline: "Privacy policy",
  intro:
    "This is a short site with two forms on it. That is genuinely the whole surface area, and this page says so in plain terms rather than hiding it behind a page of legal furniture.",
  sections: [
    {
      heading: "Who is responsible",
      paragraphs: [
        `${SITE_NAME} is run by ${OWNER_NAME}, an independent designer and developer based in Florida, United States. I am the data controller for anything collected here, and the person who answers when you email ${SITE_EMAIL}.`,
      ],
    },
    {
      heading: "What I collect",
      paragraphs: [
        "Only what you type into a form, plus the ordinary request records any web host keeps.",
      ],
      list: [
        "**Free audit form** — your name, email address, website URL, and the goal you pick from the dropdown.",
        "**Project enquiry form** — your name, email address, the budget range you select, and whatever you write in the project details field.",
        "**Server logs** — my host records standard request data such as IP address, browser user agent and timestamp. This is automatic, applies to every website, and I don't build profiles from it.",
      ],
    },
    {
      heading: "What this site doesn't do",
      paragraphs: [
        "Worth stating explicitly, because most sites can't:",
      ],
      list: [
        "**No cookies.** The site sets none at all, which is why you aren't reading this through a consent banner.",
        "**No analytics.** No Google Analytics, no Meta or LinkedIn pixel, no session recording, no heatmaps.",
        "**No third-party fonts at runtime.** Typefaces are compiled into the site at build time, so your browser never requests anything from Google's servers.",
        "**No advertising.** Nothing here is used for ad targeting or sold to anyone, ever.",
      ],
    },
    {
      heading: "Why I hold it, and on what basis",
      paragraphs: [
        "To read your message and reply to it. If you asked for an audit, to look at your site and send back what I found. That's the entire purpose.",
        "Under UK and EU GDPR the lawful basis is taking steps at your request before entering a contract, and my legitimate interest in responding to people who contact my business. There is no consent banner because there is nothing here that requires consent.",
      ],
    },
    {
      heading: "Who else can see it",
      paragraphs: [
        "Two service providers process data on my behalf. I have no other sub-processors, and no human outside my business reads your enquiry.",
      ],
      list: [
        "**Vercel** — hosts the site and keeps the server logs described above.",
        "**Resend** — delivers form submissions to my inbox as email.",
        "**My email provider** — where your message then lives, like any other email you send me.",
      ],
    },
    {
      heading: "I will not add you to a list",
      paragraphs: [
        "The audit form says “no spam, no list — just the audit,” and this policy is where that becomes a commitment rather than marketing copy. Submitting either form does not subscribe you to anything. There is no newsletter, no drip sequence and no automated follow-up. If I ever start one, joining will be a separate, deliberate opt-in.",
      ],
    },
    {
      heading: "How long it's kept",
      paragraphs: [
        "Enquiries stay in my email for as long as the working relationship or conversation is useful, and are deleted on request. Server logs are retained by my host on their own short rolling schedule. When running the site on my own machine during development, submissions are also appended to a local file that never leaves it.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        `Email ${SITE_EMAIL} and I'll action any of the following. No form, no account, no verification hoop — just ask, and I'll confirm when it's done.`,
      ],
      list: [
        "A copy of everything I hold about you",
        "Correction of anything wrong",
        "Deletion of the lot",
        "An objection to my holding it at all",
      ],
    },
    {
      heading: "Where your data goes",
      paragraphs: [
        "My hosting and email providers operate globally, so if you write to me from outside the United States your message will be processed there. Both providers offer standard contractual clauses for transfers out of the UK and EU.",
      ],
    },
    {
      heading: "Children",
      paragraphs: [
        "This is a business-to-business site and isn't directed at children. I don't knowingly collect anything from anyone under 16.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "The site is served over HTTPS and form submissions are transmitted encrypted. I never ask for payment card details, passwords or government identification through this website — if a page here appears to request any of those, it isn't mine.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "If I add anything that changes the picture — analytics, a chat widget, embedded video — I'll update this page and the date at the top of it before switching it on.",
      ],
    },
  ],
};

export const terms: LegalDoc = {
  slug: "terms",
  title: "Terms",
  metaTitle: "Terms of Use",
  metaDescription:
    "The terms covering use of this website — content, intellectual property, no guarantee of search rankings, and how client work is governed separately.",
  updated: "2026-08-09",
  headline: "Terms of use",
  intro:
    "These cover the website itself — reading it, and what you can rely on from it. Paid work is governed by a separate signed agreement, and nothing here overrides that.",
  sections: [
    {
      heading: "Who these are with",
      paragraphs: [
        `This site is operated by ${SITE_NAME} (${OWNER_NAME}), Florida, United States. Using it means accepting what follows. If you don't, the remedy is simply not to use it.`,
      ],
    },
    {
      heading: "Using the site",
      paragraphs: [
        "You're welcome to read, share and link to anything here. What isn't welcome:",
      ],
      list: [
        "Scraping at a rate that degrades the site for anyone else",
        "Republishing articles wholesale rather than quoting and linking",
        "Submitting the forms with someone else's details, or using them to send bulk or automated messages",
        "Trying to break, probe or gain unauthorised access to any part of it",
      ],
    },
    {
      heading: "Who owns what",
      paragraphs: [
        "The design, code, written content and images on this site are mine unless credited otherwise. You may quote from articles with attribution and a link — that's encouraged. Reproducing whole pieces, or reusing the design and code, needs written permission first.",
        "Anything you send me through a form stays yours. Sending it gives me only what I need to read it and reply.",
      ],
    },
    {
      heading: "The content is guidance, not a guarantee",
      paragraphs: [
        "Articles and guides here describe what has worked in real client projects. They're published in good faith and kept current, but every site and market differs, and search engines change their behaviour without notice. Acting on something you read here is your own commercial decision.",
      ],
    },
    {
      heading: "No guarantee of rankings or results",
      paragraphs: [
        "Nothing on this site — including any figure, timeline or typical outcome — is a promise of specific search rankings, traffic or revenue. Nobody can honestly offer that, because Google does not sell placement and does not take instruction from me. Where a page gives a range or a typical timeline, it describes past work rather than forecasting yours.",
      ],
    },
    {
      heading: "Prices shown here are starting points",
      paragraphs: [
        "The figures on the service pages are honest floors, not quotes. Real scope changes real cost. You get a fixed written quote before any work starts, and that quote is what binds — not a number you read on this website.",
      ],
    },
    {
      heading: "Client work is governed separately",
      paragraphs: [
        "If we work together, a separate written agreement covers scope, payment, timelines, intellectual property in the deliverables, and confidentiality. That agreement takes precedence over this page in every respect. Nothing here creates a client relationship, and an enquiry through a form isn't an agreement by either of us.",
      ],
    },
    {
      heading: "Links to other sites",
      paragraphs: [
        "Where I link out, it's because the destination was worth reading when I linked it. I don't control those sites and I'm not responsible for what they later become.",
      ],
    },
    {
      heading: "Liability",
      paragraphs: [
        "The site is provided as it is. To the extent the law allows, I'm not liable for losses arising from using it or from relying on its content. Nothing here limits liability for anything that can't lawfully be limited, including fraud.",
      ],
    },
    {
      heading: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of the State of Florida, United States, and disputes fall to the courts there. If you're a consumer elsewhere, this doesn't remove protections your local law gives you.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "I may revise these terms. The date at the top tells you when they last changed, and the version published here is the one that applies.",
      ],
    },
  ],
};

export const legalDocs: LegalDoc[] = [privacy, terms];
