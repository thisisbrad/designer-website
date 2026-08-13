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
 * Where Scout's widget script is served from. Defaults to the GitHub Pages
 * build, which is how ProjectHub documents itself. Point at a self-hosted copy
 * to remove the third-party request.
 */
export const PROJECTHUB_SCRIPT_URL =
  process.env.NEXT_PUBLIC_PROJECTHUB_SCRIPT_URL ||
  "https://bradleymatera.github.io/ProjectHub/ProjectHub.js";

/**
 * Optional override for Scout's chat backend. The widget reads
 * `window.__PROJECTHUB_CHAT_API__` at call time and otherwise uses its own
 * host, so this only matters when pointing at a different deployment.
 */
export const PROJECTHUB_CHAT_API =
  process.env.NEXT_PUBLIC_PROJECTHUB_CHAT_API || "";

/**
 * Start Scout collapsed instead of expanded.
 *
 * Left to itself it opens as a 440×680 panel over the hero, which is a lot of
 * viewport to claim before anyone asked. Set to "0" to restore its own
 * behaviour.
 */
export const PROJECTHUB_START_MINIMIZED =
  process.env.NEXT_PUBLIC_PROJECTHUB_START_MINIMIZED !== "0";
