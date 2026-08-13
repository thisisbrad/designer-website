import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/assistant/answer";
import type { Turn } from "@/lib/assistant/query";

/**
 * Scout's backend, reimplemented against this site's own content.
 *
 * Scout's widget sends every question to whatever `__PROJECTHUB_CHAT_API__`
 * points at and renders whatever comes back — the client-side intent matching
 * in `logic.js` is vestigial. That makes the backend a clean seam: keep the
 * chat UI, replace the brain entirely.
 *
 * What that buys, beyond correct answers:
 *
 *   - No third-party AI provider, so nothing a visitor types leaves this
 *     server, and nothing can be published to a public repository by Scout's
 *     self-improvement loop.
 *   - Instant replies. Upstream took ~11 seconds on a good run because it
 *     routes through free-tier LLM providers on a shared VM.
 *   - It cannot invent a price, because it does not generate text.
 *
 * The trade is range: this answers what the site actually says and hands off
 * otherwise, where a generative backend would improvise. On a page selling web
 * design, improvising about price is the failure mode that costs money.
 */

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 5;

/** Scout renders `reply` as HTML, so anything interpolated must be escaped. */
function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string
  );
}

/**
 * Scout's history is `{user, assistant}` pairs — the same shape the grounded
 * engine's contextual rewriter expects, so this is a filter rather than a
 * translation.
 */
function parseHistory(value: unknown): Turn[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (turn): turn is Turn =>
        typeof turn === "object" &&
        turn !== null &&
        typeof (turn as Turn).user === "string" &&
        typeof (turn as Turn).assistant === "string"
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({
      user: turn.user.slice(0, MAX_MESSAGE_LENGTH),
      assistant: turn.assistant.slice(0, 1000),
    }));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = (body ?? {}) as Record<string, unknown>;
  const message =
    typeof record.message === "string" ? record.message.trim() : "";

  if (!message) {
    return NextResponse.json({ error: "Ask a question." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: "That question is too long — try a shorter one." },
      { status: 400 }
    );
  }

  const reply = answerQuestion(message, parseHistory(record.history));

  /* Sources become links inside the reply. Scout has no concept of citations,
     but it does render anchors — and a linked answer is what turns a question
     into a page view. */
  const sources = reply.sources
    .map(
      (source) =>
        `<a href="${escapeHtml(source.url)}">${escapeHtml(source.title)}</a>`
    )
    .join(" · ");

  const escalation = reply.escalate
    ? `<br><br><a href="/#audit">Get a free 15-point audit →</a>`
    : "";

  const html =
    escapeHtml(reply.answer) +
    (sources ? `<br><br>${sources}` : "") +
    escalation;

  // Scout's own response contract: { reply, followUps }. `flavor` and
  // `sessionMemory` are optional and only used by its LLM path.
  return NextResponse.json({
    reply: html,
    followUps: reply.followUps.slice(0, 3),
  });
}
