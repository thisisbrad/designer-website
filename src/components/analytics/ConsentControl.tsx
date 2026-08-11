"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_EVENT,
  inConsentRegion,
  readConsent,
  setConsent,
  type ConsentState,
} from "@/lib/analytics/consent";
import { clearStoredAttribution } from "@/lib/analytics/attribution";
import { trackConsentChoice } from "@/lib/analytics/events";

/**
 * The opt-out, made concrete on the page that describes it.
 *
 * The footer link already reaches this from anywhere, but a policy that says
 * "you can turn this off" and then makes you hunt for the switch is only
 * technically true. This states what is currently happening in this browser
 * and changes it in one click.
 */
export default function ConsentControl() {
  // Server-rendered as null: the answer depends on this device's storage, and
  // guessing it would flash the wrong state on hydration.
  const [state, setState] = useState<ConsentState | null>(null);
  const [region, setRegion] = useState(false);

  useEffect(() => {
    setState(readConsent());
    setRegion(inConsentRegion());

    const onChange = () => setState(readConsent());
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (state === null) return null;

  // Undecided outside the EEA means the regional default applies: measured.
  const measuring = state === "granted" || (state === "unset" && !region);

  const choose = (choice: "granted" | "denied") => {
    if (choice === "denied") clearStoredAttribution();
    setConsent(choice);
    trackConsentChoice(choice);
    setState(choice);
  };

  return (
    <aside
      aria-labelledby="consent-control-heading"
      className="mt-16 rounded-2xl border border-line bg-surface-2 p-7 md:p-8"
    >
      <h2
        id="consent-control-heading"
        className="font-mono text-[11px] tracking-[0.25em] text-accent uppercase"
      >
        Your choice, right now
      </h2>

      <p className="mt-5 leading-relaxed text-muted">
        <span className="text-content">
          Analytics is currently {measuring ? "on" : "off"} in this browser.
        </span>{" "}
        {measuring
          ? "Page views and clicks are being counted. Nothing you type into a form is included, and turning this off takes effect immediately."
          : "Nothing is being stored on this device and no measurement is being recorded against you."}
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => choose(measuring ? "denied" : "granted")}
          className="rounded-full bg-accent-fill px-6 py-3 text-sm font-medium text-on-accent transition-colors duration-300 hover:bg-content hover:text-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 focus-visible:outline-none"
        >
          {measuring ? "Turn analytics off" : "Turn analytics on"}
        </button>
        <p
          role="status"
          className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase"
        >
          {state === "unset"
            ? "Using the regional default"
            : "Saved on this device"}
        </p>
      </div>
    </aside>
  );
}
