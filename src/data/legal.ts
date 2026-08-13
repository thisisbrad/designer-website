import { OWNER_NAME, SITE_EMAIL, SITE_NAME } from "@/lib/site";
import { ASSISTANT_MODE } from "@/lib/assistant/mode";

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

/* Written against what the code actually does — the three API routes, the
   hosting and email providers, the measurement in src/lib/analytics and the
   assistant in src/lib/assistant — rather than generic boilerplate.

   This file is part of that surface, not documentation of it. If a tag, embed
   or provider is added and this page is not updated in the same commit, the
   page becomes a false statement rather than a stale one. In particular, the
   claim that no third-party AI is involved stops being true the moment an LLM
   is wired into the assistant. */

/* The assistant section is written per mode, because the honest answer to
   "where does what I type go" differs completely between them. A policy that
   hedged across both would be accurate for neither. */
const assistantSections: LegalSection[] =
  ASSISTANT_MODE === "off"
    ? []
    : ASSISTANT_MODE === "grounded"
      ? [
          {
            heading: "The assistant in the corner",
            paragraphs: [
              "The “Ask a question” panel is a search tool wearing a chat interface. It does not use ChatGPT, Claude or any other language model, and nothing you type into it leaves my own server — there is no third-party AI provider involved at any point.",
              "How it works: your question is matched against the text of the pages on this site, and the closest passage is quoted back to you with a link to the page it came from. Every answer is text I wrote elsewhere on this site. It cannot compose a new answer, which is exactly why it cannot invent a price or promise a deadline — if something isn't written here, it says so and points you at me.",
            ],
            list: [
              "**What's sent** — the question you type and the previous few turns of the conversation, so follow-up questions make sense.",
              "**What's stored** — nothing is written to disk. Questions are handled in memory and gone when the request finishes.",
              "**What I see** — if analytics is on for you, the question text is recorded in Google Analytics so I can find out what this site fails to explain. That is the entire purpose, and it's why declining the banner also keeps your questions out of it.",
              "**Please don't type anything sensitive.** It's a public form on a public website. Passwords, card numbers and personal details don't belong in it — and it can't do anything useful with them anyway.",
            ],
          },
        ]
      : [
          {
            heading: "The assistant in the corner",
            paragraphs: [
              "The chat widget is Scout. Its interface comes from an open-source project of mine — the code is public at github.com/BradleyMatera/ProjectHub — but the copy served here is built from this site's own content, and so are its answers.",
              "Despite being a chat window, it does not use ChatGPT, Claude or any other language model. It searches the text of the pages on this site and quotes the closest passage back to you with a link to it. Every answer is text written elsewhere on this site, which is exactly why it cannot invent a price or promise a deadline — if something isn't written here, it says so and points you at me.",
            ],
            list: [
              "**Nothing leaves this server.** The widget script is served from this site, not a third party, and your questions go to this site's own endpoint. No AI provider is involved at any point.",
              "**What's sent** — the question you type and the previous few turns, so follow-up questions make sense.",
              "**What's stored** — nothing is written to disk. Questions are handled in memory and gone when the request finishes. If you give it a name, that stays in your own browser rather than a database, and a made-up one works exactly as well.",
              "**What I see** — if analytics is on for you, the question text is recorded in Google Analytics so I can find out what this site fails to explain. That is the entire purpose, and declining the banner keeps your questions out of it too.",
              "**Please don't type anything sensitive.** It's a public form on a public website. Passwords, card numbers and personal details don't belong in it — and it can't do anything useful with them anyway.",
            ],
          },
        ];

export const privacy: LegalDoc = {
  slug: "privacy",
  title: "Privacy",
  metaTitle: "Privacy Policy",
  metaDescription:
    "What this site collects, who processes it and how to have it deleted — what Google Analytics does here, what the assistant does with your questions, and how to turn it off.",
  updated: "2026-08-12",
  headline: "Privacy policy",
  intro:
    "Two forms, one analytics tag and an assistant that searches these pages. That is the whole surface area, and this page describes it in plain terms rather than hiding it behind a page of legal furniture.",
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
        "What you type into a form, the ordinary request records any web host keeps, and anonymous usage measurement.",
      ],
      list: [
        "**Free audit form** — your name, email address, website URL, and the goal you pick from the dropdown.",
        "**Project enquiry form** — your name, email address, the budget range you select, and whatever you write in the project details field.",
        "**Server logs** — my host records standard request data such as IP address, browser user agent and timestamp. This is automatic, applies to every website, and I don't build profiles from it.",
        "**Usage measurement** — which pages were viewed, in what order, how far down them people scrolled, which buttons were clicked, and whether a form was started and finished. Described in full in the next section.",
        "**How you arrived** — if you reached this site from a search advert or a tagged link, the campaign details in that link are recorded with your enquiry, so I know which advert paid for itself.",
      ],
    },
    {
      heading: "Cookies and analytics — what actually runs",
      paragraphs: [
        "I run Google Analytics 4 and Google Ads conversion tracking. The honest reason: I sell search marketing and conversion work, and a site that cannot measure its own funnel has no business charging anyone to fix theirs.",
        "What it is used for is narrow. I look at which pages lead to enquiries, where in a form people give up, and whether an advert produced a client. I do not run session recording, heatmaps, or a Meta, TikTok or LinkedIn pixel, and I do not build advertising audiences from visitors to this site.",
      ],
      list: [
        "**Cookies set** — Google Analytics sets `_ga` and `_ga_*` to recognise a returning browser. Google Ads may set `_gcl_*` to connect an advert click to an enquiry. Nothing else on this site sets a cookie.",
        "**If you're in the UK, EEA or Switzerland** — nothing is stored until you accept the banner. Decline and Google receives an anonymous, cookieless signal that a page was viewed, with no identifier attached to you and nothing written to your device.",
        "**Everywhere else** — measurement is on by default, and the “Cookies” link at the bottom of every page turns it off permanently in one click.",
        "**Changing your mind** — that same “Cookies” link reopens the choice at any time, from any page, in either direction.",
        "**Google's own opt-out** — the [Google Analytics opt-out add-on](https://tools.google.com/dlpage/gaoptout) blocks this across every site you visit, not only mine.",
      ],
    },
    ...assistantSections,
    {
      heading: "What this site still doesn't do",
      paragraphs: [
        "Worth stating explicitly, because most sites can't:",
      ],
      list: [
        "**No session recording or heatmaps.** Nobody watches a replay of your visit.",
        "**No advertising pixels.** No Meta, LinkedIn, TikTok or X tracking. You will not be retargeted for having read this.",
        "**No third-party AI.** The assistant runs on my own server against this site's own text. Nothing you ask it is sent to OpenAI, Anthropic, Google or anyone else.",
        "**No third-party fonts at runtime.** Typefaces are compiled into the site at build time, so your browser never requests one from Google's servers.",
        "**Nothing is sold.** Your details are never sold, rented or shared for anyone else's marketing, ever.",
        "**No dark patterns.** Declining is one click, in the same size and weight as accepting, and the site behaves identically afterwards.",
      ],
    },
    {
      heading: "Why I hold it, and on what basis",
      paragraphs: [
        "For form submissions: to read your message and reply to it. If you asked for an audit, to look at your site and send back what I found. That's the entire purpose. Under UK and EU GDPR the lawful basis is taking steps at your request before entering a contract, and my legitimate interest in responding to people who contact my business.",
        "For analytics: to understand what works on my own website. In the UK, EEA and Switzerland the lawful basis is your consent, given through the banner and withdrawable at any time through the “Cookies” link — withdrawing it doesn't undo measurement that already happened, but it stops all of it from that moment. Elsewhere the basis is my legitimate interest in measuring my own site, which is why the opt-out is one click and permanent.",
      ],
    },
    {
      heading: "Who else can see it",
      paragraphs: [
        "A small number of service providers process data on my behalf. There are no others, and no human outside my business reads your enquiry.",
      ],
      list: [
        "**Vercel** — hosts the site and keeps the server logs described above.",
        "**Resend** — delivers form submissions to my inbox as email.",
        "**My email provider** — where your message then lives, like any other email you send me.",
        "**Google** — receives the analytics and advertising measurement described above, and only that. Your name, email address and the contents of your message are never sent to Google.",
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
        "Analytics records are kept for 14 months, after which Google deletes the visit-level detail and only aggregate totals — how many people, from where — remain. Fourteen months rather than two so that this year can be compared against last year, which is the entire reason for keeping it. The `_ga` cookie, if you accepted it, expires two years after your last visit; declining, or clearing your browser data, removes it immediately.",
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
        "Google processes analytics data in the United States. Google is certified under the EU–US Data Privacy Framework and its UK extension, and offers standard contractual clauses, which is what makes that transfer lawful. If you decline the banner, no transfer relating to you takes place at all.",
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
        "If I add anything that changes the picture — an embedded video, another tag, a third-party AI provider behind the assistant — I'll update this page and the date at the top of it before switching it on. Analytics and the on-site assistant were both added in August 2026, and this page changed in the same commit each time.",
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
      heading: "Prices shown here are ranges",
      paragraphs: [
        "The figures on the service pages are typical ranges, not quotes. Where a project lands inside a range — or outside it — depends on scope, and scope is what we work out together. You get a fixed written quote before any work starts, and that quote is what binds, not a number you read on this website.",
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
