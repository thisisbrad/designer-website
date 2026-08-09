import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type Enquiry = {
  name: string;
  email: string;
  budget: string;
  message: string;
};

const MAX_FIELD_LENGTH = 300;
/** Project details need room to be useful — the rest are one-liners. */
const MAX_MESSAGE_LENGTH = 4000;

function parseEnquiry(body: unknown): Enquiry | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;

  const read = (key: string) =>
    typeof record[key] === "string" ? (record[key] as string).trim() : "";

  const enquiry: Enquiry = {
    name: read("name"),
    email: read("email"),
    budget: read("budget"),
    message: read("message"),
  };

  if (!enquiry.name || !enquiry.email || !enquiry.message) return null;
  if (enquiry.message.length > MAX_MESSAGE_LENGTH) return null;
  if (
    [enquiry.name, enquiry.email, enquiry.budget].some(
      (v) => v.length > MAX_FIELD_LENGTH
    )
  ) {
    return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) return null;

  return enquiry;
}

/** Serverless filesystems are read-only and ephemeral, so the disk backup
 *  only makes sense when running on a real machine. Hosted deployments rely
 *  on email, with the log line below as the recoverable fallback. */
const CAN_WRITE_DISK = !process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME;

/** Local backup, written before any email is attempted. */
async function saveToDisk(enquiry: Enquiry & { receivedAt: string }) {
  const dir = path.join(process.cwd(), "var");
  await mkdir(dir, { recursive: true });
  await appendFile(
    path.join(dir, "enquiries.jsonl"),
    JSON.stringify(enquiry) + "\n"
  );
}

async function sendEmail(enquiry: Enquiry & { receivedAt: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_TO_EMAIL;
  if (!apiKey || !to) return { sent: false as const, reason: "not configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL ?? "Audit Leads <onboarding@resend.dev>",
      to: [to],
      reply_to: enquiry.email,
      subject: `New project enquiry: ${enquiry.name}`,
      text: [
        `New project enquiry from the website:`,
        ``,
        `Name:   ${enquiry.name}`,
        `Email:  ${enquiry.email}`,
        `Budget: ${enquiry.budget || "—"}`,
        ``,
        `Details:`,
        enquiry.message,
        ``,
        `Received ${enquiry.receivedAt}`,
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

  const enquiry = parseEnquiry(body);
  if (!enquiry) {
    return NextResponse.json(
      { error: "Please fill in a valid name, email and project description." },
      { status: 400 }
    );
  }

  const stamped = { ...enquiry, receivedAt: new Date().toISOString() };

  // Disk first so an enquiry is never lost to an email hiccup.
  let backedUp = false;
  if (CAN_WRITE_DISK) {
    try {
      await saveToDisk(stamped);
      backedUp = true;
    } catch (err) {
      console.error("Failed to write enquiry backup:", err);
    }
  }

  const email = await sendEmail(stamped);
  if (!email.sent) {
    // Loud and structured: on a hosted deploy this log line is the only
    // remaining copy of the enquiry, so it must be greppable.
    console.error(
      `ENQUIRY_NOT_EMAILED reason=${email.reason} backedUpToDisk=${backedUp}`,
      JSON.stringify(stamped)
    );
  }

  return NextResponse.json({ ok: true });
}
