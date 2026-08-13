/**
 * Which assistant the site runs.
 *
 * Two exist and they are mutually exclusive — both pin themselves to the
 * bottom-right corner, so running them together stacks two chat panels.
 *
 *   "projecthub" — Scout, the real ProjectHub widget
 *                  (github.com/BradleyMatera/ProjectHub), loaded as its own
 *                  script and talking to its own backend. A *recruiter*
 *                  assistant: projects, skills, AWS experience, target roles.
 *
 *   "grounded"   — the in-repo assistant in src/lib/assistant, answering from
 *                  this site's services, pricing, locations and posts.
 *
 *   "off"        — neither.
 *
 * Build-time rather than runtime, because the privacy page has to describe
 * whichever is actually running: the two have genuinely different answers to
 * "where does what I type go", and a policy hedging across both would be true
 * of neither.
 */

export type AssistantMode = "projecthub" | "grounded" | "off";

function readMode(): AssistantMode {
  const raw = process.env.NEXT_PUBLIC_ASSISTANT_MODE?.trim().toLowerCase();
  if (raw === "projecthub" || raw === "off" || raw === "grounded") return raw;
  // Default to the in-repo assistant: it needs no third party and is the one
  // the privacy page currently describes.
  return "grounded";
}

export const ASSISTANT_MODE: AssistantMode = readMode();

/**
 * Where Scout's widget script is served from.
 *
 * Self-hosted by default: `public/scout.js`, produced by
 * `npm run scout:build` from upstream. Loading it from this origin rather than
 * GitHub Pages removes a third-party request, and the build is where the
 * recruiter-facing copy gets rewritten — upstream's suggestion chips ask why
 * Bradley is a good junior candidate.
 *
 * Set this to the upstream URL to run the unmodified widget instead.
 */
export const PROJECTHUB_SCRIPT_URL =
  process.env.NEXT_PUBLIC_PROJECTHUB_SCRIPT_URL || "/scout.js";

/**
 * Scout's backend. Defaults to this site's own route, which answers from the
 * site's content with no external provider — see the route for what that
 * trades away. Point elsewhere to use upstream's GCP deployment.
 */
export const PROJECTHUB_CHAT_API =
  process.env.NEXT_PUBLIC_PROJECTHUB_CHAT_API || "/api/assistant/scout";

/** The face in the chat header. Upstream ships its own. */
export const PROJECTHUB_AVATAR =
  process.env.NEXT_PUBLIC_PROJECTHUB_AVATAR || "/portrait-face.png";

/**
 * Start Scout collapsed instead of expanded.
 *
 * Left to itself it opens as a 440×680 panel over the hero, which is a lot of
 * viewport to claim before anyone asked. Set to "0" to restore its own
 * behaviour.
 */
export const PROJECTHUB_START_MINIMIZED =
  process.env.NEXT_PUBLIC_PROJECTHUB_START_MINIMIZED !== "0";
