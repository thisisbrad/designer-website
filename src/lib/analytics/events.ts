/**
 * The event taxonomy — the single place any analytics event is defined.
 *
 * Two rules keep this useful six months from now:
 *
 * 1. Nothing calls `window.gtag` outside this file. Every event goes through a
 *    named function here, so the full list of things the site measures is the
 *    list of exports below rather than a grep across 70 components.
 * 2. Event and parameter names are snake_case and stable. Renaming one breaks
 *    historical continuity in GA4 — reports do not backfill — so treat these
 *    strings as a schema, not as labels.
 *
 * GA4's own recommended names are used wherever one exists (`generate_lead`,
 * `view_item`, `select_content`), because those unlock built-in reporting and
 * import cleanly into Ads. Custom events fill the gaps.
 *
 * Custom parameters do not appear in GA4 reports until they are registered as
 * custom dimensions in Admin → Custom definitions. See docs/measurement-plan.md
 * for the exact list.
 */

import {
  ADS_CONVERSION_LABELS,
  CURRENCY,
  GOOGLE_ADS_ID,
  LEAD_VALUES,
  adsEnabled,
  analyticsDebug,
  analyticsEnabled,
  type AdsConversionKey,
} from "./config";
import { getAttribution } from "./attribution";

/** GA4 truncates string values at 100 characters; do it here so we know what was sent. */
const MAX_VALUE_LENGTH = 100;

type Params = Record<string, string | number | boolean | undefined>;

function clean(params: Params): Params {
  const out: Params = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    out[key] =
      typeof value === "string" ? value.slice(0, MAX_VALUE_LENGTH) : value;
  }
  return out;
}

/**
 * The only path to gtag. Silently does nothing when no property is configured,
 * which is what makes local development safe by default.
 */
function send(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;

  const payload = clean(params);

  if (analyticsDebug) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event}`, payload);
  }

  if (!analyticsEnabled) return;
  window.gtag?.("event", event, payload);
}

/* ------------------------------------------------------------------ *
 * Page views
 * ------------------------------------------------------------------ */

/**
 * Fired manually rather than automatically. The App Router changes routes
 * without a document load, and gtag's automatic page_view only catches the
 * first one — so `send_page_view` is off in the config call and this runs on
 * every navigation instead.
 */
export function trackPageView(path: string, title?: string) {
  send("page_view", {
    page_path: path,
    page_location: typeof window !== "undefined" ? window.location.href : path,
    page_title: title ?? (typeof document !== "undefined" ? document.title : ""),
  });
}

/* ------------------------------------------------------------------ *
 * Conversions — the events that decide whether the marketing works
 * ------------------------------------------------------------------ */

/** Which form a lead came from. Kept short because it becomes a dimension value. */
export type LeadForm = "audit" | "enquiry";

type LeadDetail = {
  /** Where on the site the form sat, e.g. "home_band", "contact_page". */
  location: string;
  /** The goal or budget the visitor selected — the qualifying answer. */
  qualifier?: string;
};

/**
 * A completed lead. This is the event everything else exists to explain, and
 * the one marked as a key event in GA4 and imported into Ads.
 *
 * Fires the GA4 event and the Ads conversion as a pair so the two never drift.
 */
export function trackLead(form: LeadForm, detail: LeadDetail) {
  const attribution = getAttribution();

  send("generate_lead", {
    form_id: form,
    form_location: detail.location,
    lead_qualifier: detail.qualifier,
    value: LEAD_VALUES[form],
    currency: CURRENCY,
    // First touch travels with the conversion so GA4 can answer "which
    // campaign started this relationship", not just "which one closed it".
    first_touch_source: attribution.first?.source,
    first_touch_medium: attribution.first?.medium,
    first_touch_campaign: attribution.first?.campaign,
    has_gclid: Boolean(attribution.last?.gclid ?? attribution.first?.gclid),
  });

  trackAdsConversion(form);
}

/**
 * The Google Ads side of a conversion. Separate from GA4 so a lead is counted
 * even if the GA4 property and the Ads account are configured independently —
 * and so that importing GA4 key events into Ads later does not double-count,
 * because you would drop this call rather than untangle a merged one.
 */
function trackAdsConversion(key: AdsConversionKey) {
  if (!adsEnabled) return;

  const label = ADS_CONVERSION_LABELS[key];
  if (!label) {
    if (analyticsDebug) {
      // eslint-disable-next-line no-console
      console.warn(`[analytics] no Ads conversion label configured for "${key}"`);
    }
    return;
  }

  window.gtag?.("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    value: LEAD_VALUES[key],
    currency: CURRENCY,
  });
}

/* ------------------------------------------------------------------ *
 * Form funnel — where a lead is lost, step by step
 * ------------------------------------------------------------------ */

/**
 * First interaction with any field. The gap between `form_start` and
 * `generate_lead` is the abandonment rate, and it is usually the single
 * most actionable number on the site.
 */
export function trackFormStart(form: LeadForm, location: string) {
  send("form_start", { form_id: form, form_location: location });
}

/** A submit attempt that failed — validation, network, or a server error. */
export function trackFormError(
  form: LeadForm,
  location: string,
  reason: string
) {
  send("form_error", {
    form_id: form,
    form_location: location,
    error_reason: reason,
  });
}

/* ------------------------------------------------------------------ *
 * Intent signals — the steps before a form is ever touched
 * ------------------------------------------------------------------ */

type CtaDetail = {
  /** The button's visible text, e.g. "Get my free audit". */
  label: string;
  /** Where it lives, e.g. "hero", "nav", "service_footer". */
  location: string;
  /** Where it points — an anchor, route, or external URL. */
  destination?: string;
};

/** Any call-to-action click. The map of which CTAs actually pull weight. */
export function trackCta({ label, location, destination }: CtaDetail) {
  send("cta_click", {
    cta_label: label,
    cta_location: location,
    cta_destination: destination,
  });
}

/** A service, project or location page reaching the viewport in a meaningful way. */
export function trackContentView(
  contentType: "service" | "project" | "location" | "article",
  id: string,
  name?: string
) {
  send("view_item", {
    item_list_name: contentType,
    item_id: id,
    item_name: name ?? id,
  });
}

/** Someone opening an FAQ — a direct read on which objection is live. */
export function trackFaqOpen(question: string, page: string) {
  send("faq_open", { faq_question: question, page_group: page });
}

/** Reaching a scroll milestone. Only 25/50/75/90 fire, once each per page. */
export function trackScrollDepth(percent: number, path: string) {
  send("scroll_depth", { percent_scrolled: percent, page_path: path });
}

/** A major section entering the viewport — the section-level funnel. */
export function trackSectionView(section: string, path: string) {
  send("section_view", { section_id: section, page_path: path });
}

/** A click on a mailto: link — a conversion that bypasses the form entirely. */
export function trackEmailClick(location: string) {
  send("email_click", { link_location: location });
}

/** A click on a tel: link. */
export function trackPhoneClick(location: string) {
  send("phone_click", { link_location: location });
}

/** Any click leaving the site, so referral leakage is visible. */
export function trackOutboundClick(url: string, location: string) {
  send("outbound_click", { link_url: url, link_location: location });
}

/** Consent decisions, so the shape of the measurement gap is itself measurable. */
export function trackConsentChoice(choice: "granted" | "denied") {
  send("consent_choice", { consent_state: choice });
}

/* ------------------------------------------------------------------ *
 * Assistant
 *
 * The questions visitors ask are the most direct read on what the site
 * fails to answer that exists. A question the assistant has to hand off is
 * a page that needs writing — `assistant_handoff` is effectively a content
 * backlog generating itself.
 * ------------------------------------------------------------------ */

export function trackAssistantOpen(location: string) {
  send("assistant_open", { page_path: location });
}

/** Every question asked, with how retrieval classified and scored it. */
export function trackAssistantQuestion(
  question: string,
  intent: string,
  answered: boolean
) {
  send("assistant_question", {
    // Truncated to GA4's parameter limit; long questions are rare and the
    // first 100 characters carry the topic.
    question_text: question,
    question_intent: intent,
    question_answered: answered,
  });
}

/** The assistant could not answer — a content gap, recorded as one. */
export function trackAssistantHandoff(question: string, intent: string) {
  send("assistant_handoff", {
    question_text: question,
    question_intent: intent,
  });
}

/** A visitor following a cited source, i.e. the assistant driving a pageview. */
export function trackAssistantSourceClick(url: string) {
  send("assistant_source_click", { link_url: url });
}
