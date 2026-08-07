import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type Lead = {
  name: string;
  email: string;
  website: string;
  goal: string;
};

const MAX_FIELD_LENGTH = 300;

function parseLead(body: unknown): Lead | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;

  const read = (key: string) =>
    typeof record[key] === "string" ? (record[key] as string).trim() : "";

  const lead: Lead = {
    name: read("name"),
    email: read("email"),
    website: read("website"),
    goal: read("goal"),
  };

  if (!lead.name || !lead.email || !lead.website) return null;
  if (Object.values(lead).some((v) => v.length > MAX_FIELD_LENGTH)) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return null;

  try {
    new URL(lead.website);
  } catch {
    return null;
  }

  return lead;
}

/** Leads always land here as a local backup, whether or not email works. */
async function saveToDisk(lead: Lead & { receivedAt: string }) {
  const dir = path.join(process.cwd(), "var");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "leads.jsonl"), JSON.stringify(lead) + "\n");
}

async function sendEmail(lead: Lead & { receivedAt: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_TO_EMAIL;
  if (!apiKey || !to) return { sent: false as const, reason: "not configured" };

  const site = new URL(lead.website).hostname;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL ?? "Audit Leads <onboarding@resend.dev>",
      to: [to],
      reply_to: lead.email,
      subject: `New audit lead: ${lead.name} — ${site}`,
      text: [
        `New free-audit request from the website:`,
        ``,
        `Name:    ${lead.name}`,
        `Email:   ${lead.email}`,
        `Website: ${lead.website}`,
        `Goal:    ${lead.goal || "—"}`,
        ``,
        `Received ${lead.receivedAt}`,
        `Reply directly to this email to reach them.`,
      ].join("\n"),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`Resend error ${res.status}: ${detail}`);
    return { sent: false as const, reason: `resend ${res.status}` };
  }
  return { sent: true as const };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lead = parseLead(body);
  if (!lead) {
    return NextResponse.json(
      { error: "Please fill in a valid name, email and website." },
      { status: 400 },
    );
  }

  const stamped = { ...lead, receivedAt: new Date().toISOString() };

  // Disk first so a lead is never lost to an email hiccup.
  try {
    await saveToDisk(stamped);
  } catch (err) {
    console.error("Failed to write lead backup:", err);
  }

  const email = await sendEmail(stamped);
  if (!email.sent) {
    console.warn(`Lead saved but not emailed (${email.reason}):`, stamped);
  }

  return NextResponse.json({ ok: true });
}
