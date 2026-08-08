"use client";

import { useState } from "react";
import MagneticButton from "./MagneticButton";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full border-b border-line bg-transparent py-3 text-lg text-paper transition-colors placeholder:text-muted/50 focus:border-accent focus:outline-none disabled:opacity-50";

const labelCls =
  "mb-2 block font-mono text-xs tracking-[0.2em] text-muted uppercase";

const budgets = ["$5k — $10k", "$10k — $25k", "$25k — $50k", "$50k+"];

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Shared by the homepage section and /contact. Field ids take a prefix so the
 * two can coexist on one page without colliding labels.
 */
export default function ContactForm({
  idPrefix = "contact",
  className,
}: {
  idPrefix?: string;
  className?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;

    const data = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          budget: data.get("budget"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong. Try again?");
      }

      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Try again, or email me directly."
      );
    }
  };

  const busy = status === "sending";

  if (status === "sent") {
    return (
      <div
        className={cn(
          "flex flex-col justify-center rounded-2xl border border-accent/25 bg-ink-2 p-8 md:p-10",
          className
        )}
      >
        <p
          role="status"
          className="flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-accent uppercase"
        >
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Message received
        </p>
        <p className="mt-6 font-display text-2xl font-medium tracking-tight text-balance md:text-3xl">
          Thanks — that&apos;s landed with me.
        </p>
        <p className="mt-4 leading-relaxed text-muted">
          I read every enquiry personally and reply within 48 hours, usually
          sooner. If it&apos;s urgent, email me directly at{" "}
          <a
            href="mailto:hello@beltowski.studio"
            className="text-paper underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
          >
            hello@beltowski.studio
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form className={cn("flex flex-col gap-8", className)} onSubmit={onSubmit}>
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-name`} className={labelCls}>
            Name
          </label>
          <input
            id={`${idPrefix}-name`}
            name="name"
            type="text"
            required
            disabled={busy}
            autoComplete="name"
            placeholder="Jane Appleseed"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-email`} className={labelCls}>
            Email
          </label>
          <input
            id={`${idPrefix}-email`}
            name="email"
            type="email"
            required
            disabled={busy}
            autoComplete="email"
            placeholder="jane@studio.com"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-budget`} className={labelCls}>
          Budget
        </label>
        <select
          id={`${idPrefix}-budget`}
          name="budget"
          disabled={busy}
          className={inputCls}
        >
          {budgets.map((budget) => (
            <option key={budget} className="bg-ink">
              {budget}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-message`} className={labelCls}>
          Project details
        </label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          required
          disabled={busy}
          rows={5}
          placeholder="What are we building, and when does it need to exist?"
          className={inputCls}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <MagneticButton type="submit">
          {busy ? "Sending…" : "Send inquiry"}
          <span aria-hidden>↗</span>
        </MagneticButton>
        {status === "error" && (
          <p role="alert" className="text-sm text-paper/80">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
