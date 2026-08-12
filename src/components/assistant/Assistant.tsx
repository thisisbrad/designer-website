"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  trackAssistantHandoff,
  trackAssistantOpen,
  trackAssistantQuestion,
  trackAssistantSourceClick,
  trackCta,
} from "@/lib/analytics/events";
import { cn, prefersReducedMotion } from "@/lib/utils";

/**
 * The site assistant.
 *
 * Built in this repo rather than dropped in as ProjectHub's script tag: that
 * widget is vanilla JS with its own DOM, styling and floating-panel chrome,
 * which would have arrived on a Next.js site with a custom cursor, Lenis
 * smooth scrolling and a GSAP-driven page as a second, competing UI layer.
 * The retrieval engine was worth porting; the chrome was not.
 *
 * Answers come from /api/assistant, which reads the site's own content. There
 * is no external provider and no key, so this costs nothing per message.
 */

type Source = { title: string; url: string };

type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  followUps?: string[];
  escalate?: boolean;
};

const OPENING: Message = {
  role: "assistant",
  text: "Ask me anything about the services here — cost, timelines, process, or which parts of Florida are covered. I answer from this site's own pages, so I'll tell you when something isn't on them.",
  followUps: [
    "What does a website cost?",
    "How long does a project take?",
    "Do you work with businesses in Orlando?",
  ],
};

/** Turns sent as context. Matches the API's own cap. */
const HISTORY_TURNS = 5;

export default function Assistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([OPENING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  /* Scroll the newest message into view, without yanking the whole page. */
  useEffect(() => {
    if (!open) return;
    const log = logRef.current;
    if (!log) return;
    log.scrollTo({
      top: log.scrollHeight,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [messages, open]);

  /* Escape closes and returns focus to the button that opened it. */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      openerRef.current?.focus();
    };

    window.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || busy) return;

      setInput("");
      setBusy(true);
      setMessages((prev) => [...prev, { role: "user", text }]);

      // Only completed exchanges are context; the question in flight is sent
      // separately, and pairing it with itself would confuse the rewriter.
      const history: { user: string; assistant: string }[] = [];
      const prior = messages.filter((m) => m.role !== "assistant" || m !== OPENING);
      for (let i = 0; i < prior.length - 1; i++) {
        if (prior[i].role === "user" && prior[i + 1]?.role === "assistant") {
          history.push({ user: prior[i].text, assistant: prior[i + 1].text });
        }
      }

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: text,
            history: history.slice(-HISTORY_TURNS),
          }),
        });

        if (!res.ok) throw new Error(String(res.status));
        const reply = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: reply.answer,
            sources: reply.sources,
            followUps: reply.followUps,
            escalate: reply.escalate,
          },
        ]);

        const intent = reply.debug?.intent ?? "unknown";
        trackAssistantQuestion(text, intent, !reply.escalate);
        if (reply.escalate) trackAssistantHandoff(text, intent);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Something went wrong on my end. Brad reads every enquiry personally — the contact page is the reliable route.",
            sources: [{ title: "Contact", url: "/contact" }],
            escalate: true,
          },
        ]);
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, messages]
  );

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) trackAssistantOpen(pathname);
  };

  return (
    <>
      {/* Launcher. Sits above the footer and clear of the consent banner,
          which owns the bottom edge when it is showing. */}
      <button
        ref={openerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="assistant-panel"
        data-cursor="hover"
        className={cn(
          "fixed right-4 bottom-4 z-[90] flex items-center gap-2.5 rounded-full border border-accent/30 bg-surface-2/95 py-3 pr-5 pl-4 font-mono text-[11px] tracking-[0.2em] text-content uppercase shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none md:right-6 md:bottom-6",
          open && "pointer-events-none opacity-0"
        )}
      >
        <span
          aria-hidden
          className="size-1.5 rounded-full bg-accent motion-safe:animate-pulse-dot"
        />
        Ask a question
      </button>

      {open && (
        <div
          id="assistant-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-title"
          className="fixed inset-x-0 bottom-0 z-[95] flex max-h-[85svh] flex-col overflow-hidden border-t border-line bg-surface-2/98 shadow-[0_-10px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-h-[min(38rem,80svh)] sm:w-[26rem] sm:rounded-2xl sm:border"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p
                id="assistant-title"
                className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.25em] text-accent uppercase"
              >
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                Ask about the work
              </p>
              <p className="mt-1.5 text-[11px] text-muted">
                Answers come from this site&apos;s pages
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openerRef.current?.focus();
              }}
              aria-label="Close assistant"
              data-cursor="hover"
              className="-mr-2 rounded-full p-2 text-muted transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            >
              <span aria-hidden className="block text-lg leading-none">
                ×
              </span>
            </button>
          </header>

          <div
            ref={logRef}
            // polite, not assertive: answers shouldn't interrupt a screen
            // reader mid-sentence, and the visitor knows one is coming.
            aria-live="polite"
            className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5"
          >
            {messages.map((message, i) => (
              <div key={i}>
                {message.role === "user" ? (
                  <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-accent-fill px-4 py-2.5 text-sm text-on-accent">
                    {message.text}
                  </p>
                ) : (
                  <div className="max-w-[92%]">
                    <p className="rounded-2xl rounded-bl-sm border border-line bg-surface/60 px-4 py-3 text-sm leading-relaxed text-content/90">
                      {message.text}
                    </p>

                    {!!message.sources?.length && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {message.sources.map((source) => (
                          <li key={source.url}>
                            <Link
                              href={source.url}
                              onClick={() => {
                                trackAssistantSourceClick(source.url);
                                setOpen(false);
                              }}
                              data-cursor="hover"
                              className="inline-block rounded-full border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] text-muted uppercase transition-colors hover:border-accent hover:text-accent"
                            >
                              {source.title} ↗
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* The conversion moment: the assistant just admitted it
                        can't answer, which is exactly when a human should be
                        offered rather than another suggestion. */}
                    {message.escalate && (
                      <Link
                        href="/#audit"
                        onClick={() => {
                          trackCta({
                            label: "Get a free audit",
                            location: "assistant",
                            destination: "/#audit",
                          });
                          setOpen(false);
                        }}
                        data-cursor="hover"
                        className="mt-3 block rounded-xl border border-accent/30 bg-accent/[0.06] px-4 py-3 text-sm text-content transition-colors hover:border-accent"
                      >
                        Get a free 15-point audit →
                        <span className="mt-1 block font-mono text-[10px] tracking-[0.15em] text-muted uppercase">
                          48h · No sales call
                        </span>
                      </Link>
                    )}

                    {!!message.followUps?.length && i === messages.length - 1 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {message.followUps.map((followUp) => (
                          <li key={followUp}>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => send(followUp)}
                              data-cursor="hover"
                              className="rounded-full border border-accent/25 px-3 py-1.5 text-left text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
                            >
                              {followUp}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <p
                role="status"
                className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase"
              >
                <span className="motion-safe:animate-pulse-dot">Looking…</span>
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex shrink-0 items-center gap-3 border-t border-line px-5 py-4"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Ask a question about the services
            </label>
            <input
              ref={inputRef}
              id="assistant-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              maxLength={500}
              autoComplete="off"
              placeholder="What does a website cost?"
              className="min-w-0 flex-1 border-b border-line bg-transparent py-2 text-sm text-content transition-colors placeholder:text-muted/50 focus:border-accent focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              data-cursor="hover"
              className="shrink-0 rounded-full bg-accent-fill px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-on-accent uppercase transition-colors hover:bg-content hover:text-surface focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none disabled:opacity-40"
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </>
  );
}
