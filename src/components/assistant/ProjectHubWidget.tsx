"use client";

import { useCallback, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { trackAssistantOpen, trackAssistantQuestion } from "@/lib/analytics/events";
import {
  PROJECTHUB_CHAT_API,
  PROJECTHUB_SCRIPT_URL,
  PROJECTHUB_START_MINIMIZED,
} from "@/lib/assistant/mode";
import "./scout-brand.css";

/**
 * Loads Scout, the real ProjectHub widget (github.com/BradleyMatera/ProjectHub).
 *
 * Scout expects to be a plain `<script>` on a static page, and two things
 * about that don't survive the App Router unassisted. Both are handled here
 * rather than by forking, so upstream changes keep flowing.
 *
 * 1. **It bootstraps on `DOMContentLoaded`.** Every Next.js loading strategy
 *    except `beforeInteractive` runs *after* that event has fired, so the
 *    listener never runs and the widget silently never appears — no error, no
 *    warning, just no chat. `beforeInteractive` would fix it by putting 51KB
 *    in front of first paint, a poor trade on a site that sells Core Web
 *    Vitals work. Instead it loads off the critical path and the event is
 *    replayed. Nothing else in this app listens for it, so the replay reaches
 *    only Scout.
 *
 * 2. **It owns its own DOM and styles.** The widget appends to `document.body`
 *    and its `<style>` to `<head>` at runtime — after Next's stylesheets, so
 *    it wins on cascade order. Restyling is therefore done by specificity in
 *    scout-brand.css rather than by load order.
 */
export default function ProjectHubWidget() {
  const pathname = usePathname();
  const booted = useRef(false);

  const boot = useCallback(() => {
    if (booted.current) return;
    booted.current = true;

    // Read at call time by the widget, so setting it here is early enough.
    if (PROJECTHUB_CHAT_API) {
      (window as unknown as Record<string, string>).__PROJECTHUB_CHAT_API__ =
        PROJECTHUB_CHAT_API;
    }

    // The replay that actually starts the widget. See note 1 above.
    if (document.readyState !== "loading") {
      document.dispatchEvent(new Event("DOMContentLoaded", { bubbles: true }));
    }

    if (PROJECTHUB_START_MINIMIZED) collapseOnFirstPaint();
    observe();
  }, []);

  /**
   * Collapse the panel before it can be seen expanded.
   *
   * Scout builds its DOM during bootstrap, but only after the replayed event
   * has been dispatched — so the node does not exist when `boot` runs. A
   * single `requestAnimationFrame` won verifiably *most* of the time and lost
   * the rest, which is the worst kind of bug: the panel occasionally opened
   * over the hero and nothing in the code said why.
   *
   * A MutationObserver removes the guesswork — it fires the moment the node is
   * appended, however long bootstrap takes. The timeout is a leash so the
   * observer cannot outlive a failed load.
   *
   * Applying the class rather than calling an internal keeps this on Scout's
   * public surface: `.projecthub-minimized` is what its own minimise button
   * toggles.
   */
  const collapseOnFirstPaint = () => {
    const collapse = () => {
      const el = document.getElementById("bradley-chat");
      if (!el) return false;
      el.classList.add("projecthub-minimized");
      return true;
    };

    if (collapse()) return;

    const observer = new MutationObserver(() => {
      if (collapse()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true });
    window.setTimeout(() => observer.disconnect(), 10_000);
  };

  /**
   * Scout emits no events, so feeding its usage into this site's analytics
   * means watching for it. Delegated listeners on `document`, never on its own
   * nodes — those are created and replaced by code this app doesn't control.
   */
  const observe = () => {
    let opened = false;

    document.addEventListener(
      "click",
      (event) => {
        const el = event.target as HTMLElement | null;
        if (!el?.closest?.("#bradley-chat")) return;
        if (opened) return;
        opened = true;
        trackAssistantOpen(pathname);
      },
      { capture: true }
    );

    document.addEventListener(
      "submit",
      (event) => {
        const form = event.target as HTMLElement | null;
        if (!form?.closest?.("#bradley-chat")) return;

        const input = form.querySelector<HTMLInputElement>("#chat-input");
        const question = input?.value?.trim();
        if (question) trackAssistantQuestion(question, "projecthub", true);
      },
      { capture: true }
    );
  };

  return (
    <Script
      id="projecthub-widget"
      src={PROJECTHUB_SCRIPT_URL}
      strategy="afterInteractive"
      onReady={boot}
      onError={() => {
        // A third-party host being down must not look like a broken site.
        // eslint-disable-next-line no-console
        console.warn("[assistant] Scout failed to load");
      }}
    />
  );
}
