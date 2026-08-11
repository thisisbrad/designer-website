"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CONSENT_EVENT,
  resetConsent,
  setConsent,
  shouldPromptForConsent,
} from "@/lib/analytics/consent";
import { clearStoredAttribution } from "@/lib/analytics/attribution";
import { trackConsentChoice } from "@/lib/analytics/events";
import { prefersReducedMotion } from "@/lib/utils";

/** Dispatch this to reopen the banner from anywhere (footer, privacy page). */
export const CONSENT_OPEN_EVENT = "bs:consent-open";

/** Reopen the choice for a visitor who has already decided. */
export function openConsentSettings() {
  resetConsent();
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

/**
 * Shown only to visitors our region check places in the EEA, UK or
 * Switzerland — everyone else is covered by the granted regional default and
 * the permanent opt-out link in the footer.
 *
 * Not a modal. It does not trap focus or block the page, because nothing here
 * requires a decision before the content can be read, and an interstitial that
 * hijacks the first scroll would cost more conversions than the measurement is
 * worth. It is placed last in the DOM and reachable by keyboard in the normal
 * order.
 *
 * Declining is exactly one click, the same weight as accepting. That is a
 * legal requirement in the EEA and, on a site whose privacy page has always
 * been a selling point, also the only version worth shipping.
 */
export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);

  const show = useCallback(() => {
    setOpen(true);
    // Next frame, so the element exists un-transitioned before it animates in.
    requestAnimationFrame(() => setEntered(true));
  }, []);

  useEffect(() => {
    if (shouldPromptForConsent()) show();

    const onOpen = () => show();
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, [show]);

  // Reopening from the footer is a deliberate act, so send focus to the
  // banner. The automatic first-visit appearance does not steal focus.
  useEffect(() => {
    const onOpen = () => acceptRef.current?.focus();
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  const decide = (choice: "granted" | "denied") => {
    if (choice === "denied") clearStoredAttribution();

    setConsent(choice);
    // Under a denial this still leaves as a cookieless ping, which is how the
    // size of the unmeasured audience stays knowable.
    trackConsentChoice(choice);

    setEntered(false);
    if (prefersReducedMotion()) {
      setOpen(false);
      return;
    }
    window.setTimeout(() => setOpen(false), 300);
  };

  // Consent changing elsewhere (a second tab) should close this one.
  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail === "granted" || detail === "denied") setEntered(false);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      aria-describedby="consent-body"
      className={[
        "fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 md:px-6 md:pb-6",
        "motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
        entered ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-[1100px] flex-col gap-5 rounded-2xl border border-line bg-surface-2/95 p-6 shadow-[0_-10px_60px_rgba(0,0,0,0.45)] backdrop-blur-md md:flex-row md:items-center md:gap-8 md:p-7">
        <div className="flex-1">
          <p
            id="consent-heading"
            className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            A quick question about cookies
          </p>
          <p
            id="consent-body"
            className="mt-3 text-sm leading-relaxed text-muted"
          >
            I use Google Analytics to see which pages actually lead to work, and
            Google Ads to measure whether an advert paid for itself. Decline and
            nothing is stored on your device — the site works identically
            either way. Details in the{" "}
            <Link
              href="/privacy"
              className="text-content underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="rounded-full border border-line px-6 py-3 text-sm font-medium text-content transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            Decline
          </button>
          <button
            ref={acceptRef}
            type="button"
            onClick={() => decide("granted")}
            className="rounded-full bg-accent-fill px-6 py-3 text-sm font-medium text-on-accent transition-colors duration-300 hover:bg-content hover:text-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 focus-visible:outline-none"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
