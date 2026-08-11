/**
 * Google Consent Mode v2, geo-gated.
 *
 * The model in one paragraph: storage is denied by default for visitors in the
 * EEA, UK and Switzerland, and granted by default everywhere else. Google
 * enforces the regional half server-side from the request IP, which is the
 * authoritative signal — the browser-side region guess below only decides
 * whether to *show a banner*. If the guess is wrong and an EEA visitor never
 * sees the banner, Google still withholds storage and sends cookieless pings,
 * so the failure mode is lost data rather than an unlawful cookie.
 *
 * The visitor's own choice, once made, applies globally and outranks region:
 * a Florida visitor who opts out through the footer link is opted out.
 *
 * Consent is remembered in localStorage rather than a cookie. Storing a
 * consent decision is "strictly necessary" and needs no consent of its own,
 * but keeping it out of the cookie jar means a visitor who declines really
 * does leave with zero cookies set.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** Set by the bootstrap script; read by the banner to decide visibility. */
    __consentRegion?: boolean;
  }
}

export type ConsentChoice = "granted" | "denied";
export type ConsentState = ConsentChoice | "unset";

export const CONSENT_STORAGE_KEY = "bs-consent-v1";

/** Broadcast on the window whenever consent changes, so any listener can react. */
export const CONSENT_EVENT = "bs:consent-change";

/**
 * Countries where storage is denied until the visitor opts in: the EEA
 * (EU-27 plus Iceland, Liechtenstein and Norway), the UK, and Switzerland.
 * Switzerland is not in the EEA and its revFADP has no consent-banner
 * requirement, but it is cheap to include and removes a judgement call.
 */
export const CONSENT_REQUIRED_REGIONS = [
  // EU-27
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // Rest of the EEA
  "IS", "LI", "NO",
  // United Kingdom and Switzerland
  "GB", "CH",
] as const;

/* ------------------------------------------------------------------ *
 * Bootstrap — runs in <head>, before gtag.js
 * ------------------------------------------------------------------ */

/**
 * The inline script that establishes consent defaults.
 *
 * This must execute before gtag.js loads, otherwise the library has already
 * decided what to write to storage by the time we tell it not to. It is
 * rendered synchronously in <head> for exactly that reason — the same pattern
 * the theme script already uses to beat first paint.
 *
 * Kept dependency-free and small enough to read in a browser's view-source.
 */
export function buildConsentBootstrap({
  measurementId,
  adsId,
}: {
  measurementId: string;
  adsId: string;
}) {
  const regions = JSON.stringify(CONSENT_REQUIRED_REGIONS);

  return `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
window.gtag=gtag;

// Region-scoped default wins over the global default below, per Consent Mode
// precedence rules — order here matches Google's documented example.
gtag('consent','default',{
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  analytics_storage:'denied',
  region:${regions},
  wait_for_update:500
});
gtag('consent','default',{
  ad_storage:'granted',
  ad_user_data:'granted',
  ad_personalization:'granted',
  analytics_storage:'granted'
});

// Without cookies, gclid survives only if it is carried in the URL, and ad
// click identifiers should be stripped from requests rather than merely unstored.
gtag('set','url_passthrough',true);
gtag('set','ads_data_redaction',true);

// Restore a previous decision synchronously, before any tag fires.
try{
  var c=localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});
  if(c==='granted'||c==='denied'){
    gtag('consent','update',{
      ad_storage:c,ad_user_data:c,ad_personalization:c,analytics_storage:c
    });
  }
}catch(e){}

// Best-effort region guess for banner visibility only. Over-inclusive on
// purpose: Europe/Istanbul and Europe/Moscow are not EEA, but showing a
// banner to someone who did not need one is a far better error than the
// reverse. Travellers and VPN users are the known blind spot.
try{
  var tz=(Intl.DateTimeFormat().resolvedOptions().timeZone)||'';
  var langs=(navigator.languages||[navigator.language||'']).join(',').toUpperCase();
  var codes=${regions};
  var byLang=codes.some(function(c){return langs.indexOf('-'+c)>-1});
  window.__consentRegion=/^(Europe\\/|Atlantic\\/(Canary|Azores|Madeira|Faroe|Reykjavik))/.test(tz)||byLang;
}catch(e){window.__consentRegion=false}

gtag('js',new Date());
${
  measurementId
    ? `gtag('config',${JSON.stringify(measurementId)},{send_page_view:false});`
    : "// no GA4 measurement id configured for this build"
}
${
  adsId
    ? `gtag('config',${JSON.stringify(adsId)},{allow_enhanced_conversions:true});`
    : "// no Google Ads id configured for this build"
}
`.trim();
}

/* ------------------------------------------------------------------ *
 * Client runtime
 * ------------------------------------------------------------------ */

/** The visitor's stored decision, or "unset" if they have not made one. */
export function readConsent(): ConsentState {
  if (typeof window === "undefined") return "unset";
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch {
    // Private browsing with storage blocked. Treat as undecided rather than
    // assuming either way; the region default still governs what gets stored.
    return "unset";
  }
}

/** True when this visitor is (probably) somewhere a banner is required. */
export function inConsentRegion(): boolean {
  if (typeof window === "undefined") return false;
  return window.__consentRegion === true;
}

/**
 * Whether to show the banner: only for undecided visitors in a consent region.
 * Everyone else is covered by the granted default and the footer opt-out.
 */
export function shouldPromptForConsent(): boolean {
  return inConsentRegion() && readConsent() === "unset";
}

/** Record a decision, tell Google about it, and notify the app. */
export function setConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Non-fatal: the update below still applies for this page view.
  }

  window.gtag?.("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });

  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

/**
 * Forget the stored decision so the banner can be shown again.
 * Backs the "change your mind" path from the privacy page and footer.
 */
export function resetConsent() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    /* nothing to remove */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: "unset" }));
}

/**
 * True when persistent, non-essential storage is permitted right now.
 * Used to decide whether attribution may be kept across visits.
 */
export function storageAllowed(): boolean {
  const stored = readConsent();
  if (stored !== "unset") return stored === "granted";
  return !inConsentRegion();
}
