# Measurement Plan

What this site measures, why, and what has to be configured outside the
codebase before any of it produces a usable report.

The code is in `src/lib/analytics/` and `src/components/analytics/`. Nothing
calls `window.gtag` outside `src/lib/analytics/events.ts` — that file is the
complete list of everything the site measures.

---

## 1. The question this exists to answer

> Which marketing spend produces clients, and where does everyone else drop out?

Everything below is subordinate to that. Events that would be interesting but
not decision-changing were deliberately left out: no rage-click detection, no
mouse tracking, no time-on-element. Pageviews and vanity engagement metrics do
not tell you whether to keep running an ad in Lakeland.

---

## 2. Configuration required before this reports anything

The code is inert until these exist. With no IDs set, every call is a no-op —
which is what makes local development and preview deploys safe by default.

### 2.1 Google Analytics 4

1. Create a GA4 property and a **Web** data stream for `beltowski.studio`.
2. Copy the measurement ID (`G-XXXXXXXXXX`) into `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   in the **production** environment only.
3. **Admin → Data settings → Data retention**: set event data retention to
   **14 months** (the default is 2, which makes year-on-year comparison
   impossible). `/privacy` states 14 months — if you change this setting,
   change that sentence in `src/data/legal.ts` in the same commit.
4. **Admin → Data streams → Configure tag settings → Show all → Internal traffic**:
   add your own IP so your clicking around does not become the data.
5. Mark `generate_lead` as a **key event** (Admin → Events). Nothing else should
   be a key event — if everything converts, nothing does.
6. Register the custom dimensions in §4. **Until you do this, the parameters
   are collected but invisible in reports**, which is the single most common
   way a GA4 setup silently fails to be useful.

### 2.2 Google Ads

1. Create two conversion actions under Goals → Conversions:
   - **Free audit request** — value $50, count *one*
   - **Project enquiry** — value $250, count *one*
2. From each action's tag setup, copy the `send_to` value. It looks like
   `AW-123456789/AbCdEfGhIj`. The part before the slash goes in
   `NEXT_PUBLIC_GOOGLE_ADS_ID`; the part after goes in
   `NEXT_PUBLIC_ADS_LABEL_AUDIT` / `NEXT_PUBLIC_ADS_LABEL_ENQUIRY`.
3. Use *one* of these two paths, never both:
   - the direct `conversion` events this site already fires (current setup), **or**
   - importing `generate_lead` from GA4 into Ads.

   Doing both double-counts every lead and will train Smart Bidding on numbers
   that are twice reality. If you later prefer the GA4 import, delete the
   `trackAdsConversion` call in `src/lib/analytics/events.ts` rather than
   trying to reconcile the two.
4. Link the GA4 property to the Ads account (Admin → Product links) so audience
   and attribution data flows even on the direct-tag path.

### 2.3 Search Console

Link Search Console to GA4 (Admin → Product links). Free, five minutes, and it
is the only way to see which query produced an organic landing.

---

## 3. Event taxonomy

`generate_lead` is the only key event. Everything else exists to explain it.

### Conversions

| Event | Fires when | Parameters |
|---|---|---|
| `generate_lead` | Either form submits successfully | `form_id`, `form_location`, `lead_qualifier`, `value`, `currency`, `first_touch_source`, `first_touch_medium`, `first_touch_campaign`, `has_gclid` |
| `conversion` | Same moment, sent to Google Ads only | `send_to`, `value`, `currency` |

`form_id` is `audit` or `enquiry`. Values are $50 and $250 respectively —
deliberately different, so Ads bids toward the enquiry rather than the cheaper,
weaker audit lead. These are a hypothesis until there is close-rate data;
revisit `LEAD_VALUES` in `src/lib/analytics/config.ts` once there is.

### Form funnel

| Event | Fires when | Parameters |
|---|---|---|
| `form_start` | First focus of any field, once per form | `form_id`, `form_location` |
| `form_error` | A submit attempt fails | `form_id`, `form_location`, `error_reason` |

**`form_start` → `generate_lead` is the abandonment rate, and it is the most
actionable number on the site.** A high start rate with a low finish rate is a
form problem you can fix this afternoon. A low start rate is a copy, offer or
traffic-quality problem, and no amount of form tweaking will touch it.

### Intent, before a form is touched

| Event | Fires when | Parameters |
|---|---|---|
| `cta_click` | Any `MagneticButton` or nav CTA click | `cta_label`, `cta_location`, `cta_destination` |
| `view_item` | A service, project, location or article is viewed | `item_list_name`, `item_id`, `item_name` |
| `faq_open` | An FAQ is expanded | `faq_question`, `page_group` |
| `scroll_depth` | 25 / 50 / 75 / 90%, once each per page | `percent_scrolled`, `page_path` |
| `section_view` | A `section[id]` is a third visible | `section_id`, `page_path` |
| `email_click` | A `mailto:` link is clicked | `link_location` |
| `phone_click` | A `tel:` link is clicked | `link_location` |
| `outbound_click` | Any link leaving the site | `link_url`, `link_location` |
| `consent_choice` | The banner or opt-out is used | `consent_state` |

`email_click` matters more than it looks: it is a conversion that never touches
a form, so a funnel that only counts `generate_lead` undercounts real enquiries.

Submit buttons deliberately do **not** fire `cta_click` — the form funnel
already describes them, and counting a rejected submit as a CTA click would
inflate exactly the numbers you most need to trust.

---

## 4. Custom dimensions to register

**GA4 discards these from reports until they are registered.** Admin → Custom
definitions → Create custom dimension, all scoped to **Event**.

| Dimension name | Event parameter |
|---|---|
| Form ID | `form_id` |
| Form location | `form_location` |
| Lead qualifier | `lead_qualifier` |
| CTA label | `cta_label` |
| CTA location | `cta_location` |
| Section ID | `section_id` |
| Link location | `link_location` |
| First touch source | `first_touch_source` |
| First touch campaign | `first_touch_campaign` |
| Error reason | `error_reason` |
| Consent state | `consent_state` |

There is a 50-dimension limit per property; this uses 11.

---

## 5. Consent

Geo-gated Google Consent Mode v2. Implementation in
`src/lib/analytics/consent.ts`, and the reasoning is documented at the top of
that file.

- **EEA, UK, Switzerland (32 countries)** — all four storage types default to
  `denied`. Google enforces this server-side from the request IP, which is the
  authoritative signal. A banner asks; declining leaves cookieless pings only.
- **Everywhere else** — granted by default, with a permanent one-click opt-out
  in the footer of every page and a live switch on `/privacy`.
- The browser-side region guess (timezone + language) only decides whether to
  **show a banner**. If it guesses wrong for an EEA visitor, Google still
  withholds storage — the failure mode is lost data, not an unlawful cookie.
- Consent is stored in `localStorage`, not a cookie, so a visitor who declines
  leaves with genuinely zero cookies set.

### Expected effect on the numbers

EEA/UK traffic will under-report by roughly the banner decline rate. This is
correct behaviour, not a bug, and `consent_choice` measures its size. Given
this business sells into Central Florida, the affected share of traffic should
be small — check it before drawing conclusions from any EU-heavy report.

Turn on **behavioural and conversion modelling** in GA4 (Admin → Reporting
identity → Blended) so Google fills the consent gap statistically.

---

## 6. Attribution

`src/lib/analytics/attribution.ts` captures first touch (persisted) and last
touch (per session): `utm_*`, `gclid`/`gbraid`/`wbraid`, `msclkid`, referrer and
landing page.

This rides along with the form submission into the notification email and
`var/leads.jsonl`, which is the point. **When a lead closes three months later,
the keyword that produced it is in the email thread** rather than lost to a GA4
attribution window that has already rolled over. A lead email now reads:

```
— How they found you —
First touch: google / cpc · campaign "orlando-web-design" · term "web designer orlando" · click id EAIaIQobChMI… · landed on /services/web-design/orlando
This visit: google / organic · landed on /
```

Direct, untagged visits produce no such block, so emails stay short when there
is nothing to say.

Where consent is required and not granted, both touches are held in memory for
the current page view only — which still covers "landed from an ad and filled
the form in one sitting" without persisting anything to the device.

The server whitelists these fields (`src/lib/analytics/server.ts`): unknown keys
are dropped, values are capped at 300 characters, and control characters are
stripped so nothing submitted from a browser can forge lines in a lead email.

---

## 7. UTM tagging convention for the PPC campaigns

Google Ads auto-tagging (`gclid`) handles Ads by itself — do **not** add manual
UTMs to Ads campaigns, or you will overwrite the auto-tagged data. Use these
only for non-Ads links: directories, email signatures, print QR codes, GBP posts.

```
utm_source   = google | bing | gbp | directory name | newsletter
utm_medium   = cpc | organic | referral | email | print
utm_campaign = market-service   e.g. orlando-web-design, volusia-seo
utm_term     = the keyword, for manually tagged search links
utm_content  = the specific creative or placement
```

Keep `utm_campaign` aligned with the five markets in `market-strategy.md`, so
campaign performance and market strategy are readable against each other
without a translation step.

---

## 8. Reports worth building first

Four, in order of how quickly they change a decision:

1. **Lead source** — Explore → free-form, dimension `Session campaign`,
   metric `Key events`. Which campaign produces leads, not clicks.
2. **Form abandonment** — funnel exploration: `form_start` → `generate_lead`,
   broken down by `form_location`. Compare the homepage band against
   `/contact`; if one is dramatically worse, the difference is the fix.
3. **Path to conversion** — path exploration ending at `generate_lead`. Shows
   which pages actually precede an enquiry, which is usually not the pages you
   would guess, and tells you where the next CTA belongs.
4. **City page performance** — landing page report filtered to
   `/services/*/[city]`, with `Key events` as the metric. This is the report
   that says whether the location-page strategy is earning its keep.

---

## 9. What was deliberately not built

- **A/B testing harness.** Worth adding once there is enough traffic for a test
  to reach significance in under a month. Below that it produces confident
  noise, and acting on noise is worse than acting on judgement.
- **Server-side tagging.** Meaningful accuracy gain against ad blockers, real
  infrastructure cost. Revisit when ad spend justifies it.
- **Enhanced conversions.** `allow_enhanced_conversions` is on in the Ads
  config, but hashed email is not yet sent from the form. It measurably
  improves Ads attribution and is the natural next step — it needs the
  customer-data terms accepted in the Ads UI first.
- **Session recording / heatmaps.** The privacy page commits to not doing this,
  and that commitment is worth more here than the data would be.
