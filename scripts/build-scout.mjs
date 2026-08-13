#!/usr/bin/env node
/**
 * Build a studio-flavoured Scout from upstream ProjectHub.
 *
 *   npm run scout:build
 *
 * Scout's answers all come from its backend, so repointing
 * `__PROJECTHUB_CHAT_API__` at this site's own endpoint already fixes what it
 * *says*. What it can't fix is what's baked into the widget itself: the
 * suggestion chips, the welcome message, the header, the placeholder. Those
 * are string literals inside a 51KB file, and on a page selling web design to
 * Florida businesses they read "Why is Bradley a good junior candidate?".
 *
 * So this fetches upstream and rewrites those literals into `public/scout.js`.
 *
 * Why a script and not a hand-edited copy in the repo: a hand-edited fork
 * silently rots. This can be re-run against a newer upstream, and the diff is
 * a list of documented intentions rather than 51KB of someone else's code with
 * unmarked edits in it.
 *
 * **Every patch is asserted.** If upstream renames or rewords something, the
 * build fails loudly rather than emitting a file that is 90% rebranded and
 * still says "recruiter assistant" in the header. A silent partial patch is
 * the only genuinely bad outcome here.
 *
 * Self-hosting also removes the third-party request to bradleymatera.github.io,
 * which is what lets the privacy page stop naming GitHub as a processor.
 */

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const UPSTREAM =
  process.env.SCOUT_UPSTREAM ??
  "https://bradleymatera.github.io/ProjectHub/ProjectHub.js";
const OUT = path.join(process.cwd(), "public", "scout.js");

/* The assistant keeps its name. "Scout" is neutral and it is a real thing that
   exists; only the recruiter framing around it has to go. */
const SUGGESTIONS = [
  "What does a website cost?",
  "How long does a project take?",
  "Do you work with businesses in Orlando?",
  "What's included in the free audit?",
  "What services do you offer?",
  "How does the process work?",
  "Do you do SEO?",
  "Can you help with an AI assistant?",
  "How many revisions do I get?",
  "Who owns the website when it's done?",
  "Do you guarantee rankings?",
  "How do I get in touch?",
];

/* Replaces upstream's portfolio array. Kept deliberately thin: nothing reads
   these any more, they just must not contain recruiter copy. */
const STUDIO_PROJECTS = [
  {
    name: "Atlas Studio",
    desc: "Brand and website system for a creative agency — editorial design on a technical-SEO backbone.",
    url: null,
    platform: "Web",
    repo: null,
    tech: ["Next.js", "Technical SEO", "Content Strategy"],
    apiEndpoint: null,
  },
  {
    name: "Verano Motors",
    desc: "Luxury automotive digital experience with an AI concierge and local SEO.",
    url: null,
    platform: "Web",
    repo: null,
    tech: ["Next.js", "AI Integration", "Local SEO"],
    apiEndpoint: null,
  },
];

/** Replacement for upstream's "100% free" header badge. */
const BADGE_LABEL = "From this site";
const BADGE_TITLE =
  "Answers are quoted from this site's own pages rather than generated.";

/** Each patch is asserted; a miss fails the build. `all` replaces every hit. */
const PATCHES = [
  {
    /* "100% free", tooltipped with an explanation about GCP free tiers and
       Ollama fallbacks. Accurate upstream, meaningless here — on a studio site
       a visitor reads it as a claim about pricing. Repurposed to say something
       true and useful about where answers come from. */
    name: "free badge",
    find: /<span class="projecthub-free-badge" title="Scout runs on free[^"]*">100% free<\/span>/,
    replace: `<span class="projecthub-free-badge" title="${BADGE_TITLE}">${BADGE_LABEL}</span>`,
  },
  {
    /* A *second* chip list, prepended to `suggestions` at render time — which
       is why upstream's recruiter questions still appeared after patching the
       array above. Emptied so `suggestions` is the single source. */
    name: "priority chips",
    find: /const prioritySuggestions = \[[\s\S]*?\n\s*\];/,
    replace: "const prioritySuggestions = [];",
  },
  {
    /* A second endpoint definition, used by a different call path. */
    name: "chatApiUrl helper",
    find: /function chatApiUrl\(\) \{[\s\S]*?\n  \}/,
    replace: [
      "function chatApiUrl() {",
      '    return window.__PROJECTHUB_CHAT_API__ || "/api/assistant/scout";',
      "  }",
    ].join("\n"),
  },
  {
    /* Bradley's portfolio, including ProjectHub's own "AI recruiter assistant"
       self-description. handleQuery no longer consults these — every question
       goes to the backend — but they are still passed around and would surface
       in any code path that reads them. */
    name: "project data",
    find: /^const projects = \[[\s\S]*?\n\];/m,
    replace: `const projects = ${JSON.stringify(STUDIO_PROJECTS, null, 2)};`,
  },
  {
    name: "codepen data",
    find: /^const codePens = \[[\s\S]*?\n\];/m,
    replace: "const codePens = [];",
  },
  {
    /* "Reading Bradley's project data…", "Checking his AWS background…",
       "Picking the next available free provider…" — shown while waiting, and
       describing a backend this build does not use. */
    name: "thinking tips",
    find: /const tips = \[\n\s*"Reading Bradley[\s\S]*?\n\s*\];/,
    replace: [
      "const tips = [",
      '      "Searching the site…",',
      '      "Finding the page that answers this…",',
      "    ];",
    ].join("\n"),
  },
  {
    /* Upstream types replies out slowly, which reads as deliberate when the
       backend behind it takes ~11 seconds — the animation hides the wait. This
       build answers in milliseconds, so the same delay is the *only* thing
       between the question and the answer. */
    name: "typing speed",
    find: "const WORD_DELAY_MS = 32;",
    replace: "const WORD_DELAY_MS = 8;",
  },
  {
    name: "suggestion chips",
    find: /^const suggestions = \[[\s\S]*?\n\];/m,
    replace: `const suggestions = ${JSON.stringify(SUGGESTIONS, null, 2)};`,
  },
  {
    name: "header kicker",
    find: `<div class="projecthub-kicker">Bradley Matera · Recruiter assistant\${devLabel}</div>`,
    replace: `<div class="projecthub-kicker">Beltowski Studio · Site assistant\${devLabel}</div>`,
  },
  {
    name: "header subtitle",
    find: `<span class="projecthub-subtitle">Ask me about Bradley's projects, skills, fit, or contact info\${devLabel}</span>`,
    replace: `<span class="projecthub-subtitle">Answers come from this site's own pages\${devLabel}</span>`,
  },
  {
    name: "composer placeholder",
    find: `Ask Scout about Bradley's work, projects, skills, or roles...`,
    replace: `Ask about cost, timelines or process…`,
    all: true,
  },
  {
    name: "offline fallback",
    find: `"I'm here to help with Bradley Matera's work as a junior software engineer. Try asking about ProjectHub, the AWS serverless workflow, CIRIS Ethical AI, his GitHub or LinkedIn, target roles, or strongest technical skills."`,
    replace: `"I can't reach my answers right now. Brad reads every enquiry personally — the contact page is the reliable route, or ask for the free audit."`,
  },
  {
    /* Upstream advertises its free-provider LLM network. Self-hosted against
       this site's own content, that sentence is simply untrue. */
    name: "free-tier notice",
    find: /const freeNote = `<br><br><span style="[^`]*?<\/span>`;/,
    replace:
      "const freeNote = `<br><br><span style=\"display:inline-flex;align-items:center;gap:6px;padding:4px 9px;border-radius:999px;border:1px solid rgba(255,255,255,0.16);font-size:12px;\">I answer from this site's pages, so I'll say when something isn't on them.</span>`;",
  },
  {
    name: "welcome message",
    find: /const welcomeHtml = visitorName\n\s*\? `Welcome back[^`]*`\n\s*: `Hi, I’m Scout[^`]*`;/,
    replace: [
      "const welcomeHtml = visitorName",
      "    ? `Welcome back, ${escapeHtml(visitorName)}. Ask me about cost, timelines, process, or which parts of Florida are covered.${freeNote}${devNote}`",
      "    : `Hi — I'm Scout${devLabel}, the assistant on Brad's site. Ask me what things cost, how long they take, how the process works, or which areas are covered.${freeNote}${devNote}`;",
    ].join("\n"),
  },
  {
    name: "name-capture greeting",
    find: /const greetingHtml = `Nice to meet you, \$\{escapeHtml\(visitorName\)\}\. I’m Scout, Bradley’s assistant\.[^`]*`;/,
    replace:
      "const greetingHtml = `Thanks, ${escapeHtml(visitorName)}. Ask me about cost, timelines, process, or which parts of Florida are covered.`;",
  },
  {
    /* Default both endpoints to this site. The runtime hooks still win, so a
       deployment can still point elsewhere without another build. */
    name: "default chat endpoint",
    find: /const CHAT_API_URL = window\.__PROJECTHUB_CHAT_API__\n[\s\S]*?"https:\/\/projecthub-chat\.bradleymatera\.dev\/api\/chat"\);/,
    replace:
      'const CHAT_API_URL = window.__PROJECTHUB_CHAT_API__ || "/api/assistant/scout";',
  },
  {
    name: "default avatar",
    find: `window.__PROJECTHUB_AVATAR__ || (window.location.protocol === "file:" ? "bot-avatar.png" : "https://bradleymatera.github.io/ProjectHub/bot-avatar.png")`,
    replace: `window.__PROJECTHUB_AVATAR__ || "/portrait-face.png"`,
  },
];

const BANNER = `/* Built by scripts/build-scout.mjs from ProjectHub — do not edit.
 * Upstream: https://github.com/BradleyMatera/ProjectHub (MIT)
 * Source:   ${UPSTREAM}
 * Rebuild:  npm run scout:build
 *
 * Patched for this site: suggestions, header, welcome, placeholder, avatar and
 * the default endpoint. Answers come from /api/assistant/scout, which reads
 * this site's own content — no external provider is involved.
 */
`;

const res = await fetch(UPSTREAM);
if (!res.ok) {
  console.error(`✗ could not fetch upstream: HTTP ${res.status} — ${UPSTREAM}`);
  process.exit(1);
}

let source = await res.text();
const originalLength = source.length;
const failures = [];

for (const patch of PATCHES) {
  const before = source;

  if (patch.find instanceof RegExp) {
    if (!patch.find.test(source)) {
      failures.push(patch.name);
      continue;
    }
    source = source.replace(patch.find, () => patch.replace);
  } else {
    if (!source.includes(patch.find)) {
      failures.push(patch.name);
      continue;
    }
    source = patch.all
      ? source.split(patch.find).join(patch.replace)
      : source.replace(patch.find, patch.replace);
  }

  console.log(`  ✓ ${patch.name}`);
  if (before === source) failures.push(`${patch.name} (no-op)`);
}

if (failures.length) {
  console.error(
    `\n✗ ${failures.length} patch(es) did not apply:\n` +
      failures.map((f) => `    - ${f}`).join("\n") +
      "\n\n  Upstream has changed. Fix the patterns in this script rather than\n" +
      "  shipping a partly-rebranded widget that still says 'recruiter'.\n"
  );
  process.exit(1);
}

/* Belt and braces: prove no recruiter framing survived. The person's name is
   allowed — it is his site — but the recruiter positioning is not. */
const BANNED = [
  "recruiter assistant",
  "Bradley's project data",
  "AWS background",
  "free provider",
  "100% free",
  "no paid AI required",
  "Recruiter assistant",
  "junior software engineer",
  "Why is Bradley a good junior candidate",
  "projecthub-chat.bradleymatera.dev",
];
const leaked = BANNED.filter((needle) => source.includes(needle));
if (leaked.length) {
  console.error(
    `\n✗ recruiter framing survived the patch:\n` +
      leaked.map((l) => `    - "${l}"`).join("\n") +
      "\n"
  );
  process.exit(1);
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, BANNER + source, "utf8");

console.log(
  `\n  wrote public/scout.js — ${(source.length / 1024).toFixed(1)}KB ` +
    `(upstream ${(originalLength / 1024).toFixed(1)}KB)\n`
);
