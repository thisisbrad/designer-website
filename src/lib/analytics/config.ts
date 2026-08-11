/**
 * Measurement configuration, read once from the environment.
 *
 * Everything here is `NEXT_PUBLIC_*` because it is inlined into the client
 * bundle at build time. These are public identifiers by design — a GA4
 * measurement ID and an Ads conversion label are visible in any page source.
 * Nothing secret belongs in this file.
 *
 * With no IDs set, every analytics call in the app becomes a no-op. That is
 * the intended state for local development: you can run the site, click
 * through the funnel, and never pollute the production property.
 */

/** GA4 measurement ID, e.g. `G-XXXXXXXXXX`. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

/** Google Ads conversion ID, e.g. `AW-XXXXXXXXXX`. */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";

/**
 * Conversion labels from Google Ads — the second half of a `send_to` value.
 * Each maps to one conversion action created in the Ads UI.
 */
export const ADS_CONVERSION_LABELS = {
  /** Free-audit request — the primary lead, and the PPC landing goal. */
  audit: process.env.NEXT_PUBLIC_ADS_LABEL_AUDIT ?? "",
  /** Project enquiry — lower volume, much higher intent. */
  enquiry: process.env.NEXT_PUBLIC_ADS_LABEL_ENQUIRY ?? "",
} as const;

export type AdsConversionKey = keyof typeof ADS_CONVERSION_LABELS;

/**
 * Estimated value of each lead type, reported with the conversion so Ads can
 * bid toward revenue rather than raw lead count. These are deliberately
 * conservative: audit requests convert to paid work at a far lower rate than
 * a budgeted project enquiry, and telling Ads they are worth the same trains
 * it to chase the cheaper, weaker lead.
 *
 * Revisit once there is real close-rate data — the numbers below are a
 * starting hypothesis, not a measurement.
 */
export const LEAD_VALUES: Record<AdsConversionKey, number> = {
  audit: 50,
  enquiry: 250,
};

export const CURRENCY = "USD";

/** True when a GA4 property is configured for this build. */
export const analyticsEnabled = GA_MEASUREMENT_ID !== "";

/** True when Ads conversion tracking is configured for this build. */
export const adsEnabled = GOOGLE_ADS_ID !== "";

/**
 * Verbose console logging of every event, without sending anything.
 * Set `NEXT_PUBLIC_ANALYTICS_DEBUG=1` to inspect the taxonomy while building.
 */
export const analyticsDebug = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1";
