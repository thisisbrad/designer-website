/**
 * Whether the site runs Beacon, the in-repo assistant in src/lib/assistant —
 * answering from this site's services, pricing, locations and posts.
 *
 * Build-time rather than runtime, because the privacy page has to describe
 * what is actually running — including the in-chat audit form and where a
 * question goes when one is asked.
 */

export type AssistantMode = "grounded" | "off";

function readMode(): AssistantMode {
  const raw = process.env.NEXT_PUBLIC_ASSISTANT_MODE?.trim().toLowerCase();
  return raw === "off" ? "off" : "grounded";
}

export const ASSISTANT_MODE: AssistantMode = readMode();
