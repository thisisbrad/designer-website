/**
 * Campaign attribution — answering "which click paid for this client".
 *
 * GA4 answers that inside GA4. This module answers it inside the lead itself:
 * the gclid and campaign that produced an enquiry ride along with the form
 * submission into the notification email and the leads log. When a lead closes
 * three months later, the keyword that produced it is in the email thread
 * rather than lost to a GA4 attribution window that has already rolled over.
 *
 * Two touches are kept:
 *   first — the campaign that introduced the visitor, persisted across visits
 *   last  — the campaign on the visit that converted, per session
 *
 * Storage respects consent. Where consent is required and not granted, both
 * touches live in memory for the current page view only, which still covers
 * the common case of "landed from an ad and filled the form in one sitting"
 * without persisting anything to the device.
 */

import { storageAllowed } from "./consent";

export type Touch = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  /** Google Ads click id. gbraid/wbraid are its iOS privacy-safe equivalents. */
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  /** Microsoft Ads click id, in case the PPC plan expands to Bing. */
  msclkid?: string;
  referrer?: string;
  landing_page?: string;
  at: string;
};

export type Attribution = {
  first?: Touch;
  last?: Touch;
};

const FIRST_KEY = "bs-attr-first";
const LAST_KEY = "bs-attr-last";

/** Fallback store for when persistence is not permitted. */
const memory: Attribution = {};

const CLICK_IDS = ["gclid", "gbraid", "wbraid", "msclkid"] as const;

/**
 * Derive source/medium the way GA4 would, for visits that arrive without UTM
 * tags. Deliberately shallow — this exists so a direct or organic lead is not
 * a blank row, not to rebuild Google's channel grouping.
 */
function deriveChannel(params: URLSearchParams, referrer: string) {
  if (params.get("gclid") || params.get("gbraid") || params.get("wbraid")) {
    return { source: "google", medium: "cpc" };
  }
  if (params.get("msclkid")) return { source: "bing", medium: "cpc" };

  if (!referrer) return { source: "(direct)", medium: "(none)" };

  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return { source: "(direct)", medium: "(none)" };
  }

  // Same-site referrers are internal navigation, not an acquisition source.
  if (typeof window !== "undefined" && host === window.location.hostname) {
    return {};
  }

  const engines = ["google.", "bing.", "duckduckgo.", "yahoo.", "ecosia.", "brave."];
  if (engines.some((engine) => host.startsWith(engine))) {
    return { source: host.split(".")[0], medium: "organic" };
  }

  const social = ["facebook.", "instagram.", "linkedin.", "x.com", "twitter.", "reddit.", "youtube."];
  if (social.some((network) => host.startsWith(network))) {
    return { source: host.split(".")[0], medium: "social" };
  }

  return { source: host, medium: "referral" };
}

/** Build a touch from the current URL, or null if there is nothing worth recording. */
function readCurrentTouch(): Touch | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || "";
  const channel = deriveChannel(params, referrer);

  const touch: Touch = {
    source: params.get("utm_source") ?? channel.source,
    medium: params.get("utm_medium") ?? channel.medium,
    campaign: params.get("utm_campaign") ?? undefined,
    term: params.get("utm_term") ?? undefined,
    content: params.get("utm_content") ?? undefined,
    referrer: referrer || undefined,
    landing_page: window.location.pathname,
    at: new Date().toISOString(),
  };

  for (const key of CLICK_IDS) {
    const value = params.get(key);
    if (value) touch[key] = value;
  }

  // Internal navigation produced no channel and no campaign — nothing new here.
  if (!touch.source && !touch.campaign) return null;

  return touch;
}

function read(storage: Storage | null, key: string): Touch | undefined {
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as Touch) : undefined;
  } catch {
    return undefined;
  }
}

function write(storage: Storage | null, key: string, touch: Touch) {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(touch));
  } catch {
    /* quota or blocked storage — memory copy still serves this page view */
  }
}

/**
 * Record the current visit's campaign data. Safe to call on every route
 * change: first touch is only ever written once, and last touch only updates
 * when the visit actually carries new campaign information.
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;

  const touch = readCurrentTouch();
  if (!touch) return;

  const persist = storageAllowed();
  const local = persist ? window.localStorage : null;
  const session = persist ? window.sessionStorage : null;

  memory.last = touch;
  write(session, LAST_KEY, touch);

  const existingFirst = read(local, FIRST_KEY) ?? memory.first;
  if (!existingFirst) {
    memory.first = touch;
    write(local, FIRST_KEY, touch);
  } else {
    memory.first = existingFirst;
  }
}

/** Everything known about how this visitor got here. */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};

  const persist = storageAllowed();
  return {
    first: (persist ? read(window.localStorage, FIRST_KEY) : undefined) ?? memory.first,
    last: (persist ? read(window.sessionStorage, LAST_KEY) : undefined) ?? memory.last,
  };
}

/**
 * Flattened form for the lead API — one shallow object of short strings,
 * which is far easier to read in an email and to grep in leads.jsonl than
 * nested JSON.
 */
export function attributionPayload(): Record<string, string> {
  const { first, last } = getAttribution();
  const payload: Record<string, string> = {};

  const add = (prefix: string, touch?: Touch) => {
    if (!touch) return;
    for (const [key, value] of Object.entries(touch)) {
      if (typeof value === "string" && value) {
        payload[`${prefix}_${key}`] = value.slice(0, 300);
      }
    }
  };

  add("first", first);
  add("last", last);
  return payload;
}

/** Called when a visitor withdraws consent — clears anything already persisted. */
export function clearStoredAttribution() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(FIRST_KEY);
    window.sessionStorage.removeItem(LAST_KEY);
  } catch {
    /* nothing to clear */
  }
}
