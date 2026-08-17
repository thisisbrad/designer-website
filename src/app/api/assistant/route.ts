import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/assistant/answer";
import type { Turn } from "@/lib/assistant/query";

/**
 * The assistant endpoint.
 *
 * Runs entirely in-process against the site's own content — no external
 * provider, no API key, no per-message cost. That is what makes it safe to
 * leave switched on: the worst a flood of traffic can do here is burn CPU,
 * not money.
 */

const MAX_QUESTION_LENGTH = 500;
const MAX_HISTORY_TURNS = 5;

/* Light per-instance throttle. Serverless means each instance keeps its own
   counter, so this is a speed bump rather than a guarantee — which is the
   right level of effort for an endpoint with no marginal cost to abuse. */
const RATE_LIMIT = { windowMs: 60_000, max: 60 };
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });

    // Opportunistic sweep — without it the map grows for the instance's life.
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT.max;
}

/** Accept only well-formed turns; anything else is dropped rather than repaired. */
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
      user: turn.user.slice(0, MAX_QUESTION_LENGTH),
      assistant: turn.assistant.slice(0, 1000),
    }));
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many questions at once. Give it a moment." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = (body ?? {}) as Record<string, unknown>;
  const question =
    typeof record.question === "string" ? record.question.trim() : "";

  if (!question) {
    return NextResponse.json({ error: "Ask a question." }, { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return NextResponse.json(
      { error: "That question is too long — try a shorter one." },
      { status: 400 }
    );
  }

  const reply = answerQuestion(question, parseHistory(record.history));

  // Retrieval internals are useful while building and noise in production.
  const { debug, ...publicReply } = reply;
  return NextResponse.json(
    process.env.NODE_ENV === "development" ? { ...publicReply, debug } : publicReply
  );
}
