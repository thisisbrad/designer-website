# beltowski.studio

One-page portfolio and lead-generation site for Brad Beltowski — web design,
SEO marketing and AI solutions for businesses. Next.js App Router, TypeScript,
Tailwind CSS, GSAP and React Three Fiber.

## Running locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Lead capture (the audit form)

The "Get a free 15-point audit" form in the plan section posts to
`src/app/api/audit-lead/route.ts`, which:

1. **Validates** the submission — name, valid email, valid website URL,
   length limits. Invalid payloads get a `400` and the form shows an error
   with a mailto fallback, so a hot lead is never stranded.
2. **Saves to disk first** — every valid lead is appended to
   `var/leads.jsonl` (gitignored) before any email is attempted, so an email
   outage can't lose a lead.
3. **Emails the lead** to `LEAD_TO_EMAIL` through the
   [Resend](https://resend.com) REST API. The notification's `reply-to` is
   set to the lead's own address — hit Reply to answer them directly.

### Setup

```bash
cp .env.example .env.local
```

| Variable          | Required | Purpose                                                          |
| ----------------- | -------- | ---------------------------------------------------------------- |
| `LEAD_TO_EMAIL`   | yes      | Inbox that receives lead notifications.                          |
| `RESEND_API_KEY`  | yes\*    | API key from resend.com (free tier: 100 emails/day).             |
| `LEAD_FROM_EMAIL` | no       | Custom sender, once a domain is verified in Resend.              |

\* Without `RESEND_API_KEY`, the route still accepts leads and stores them in
`var/leads.jsonl` — it just logs a warning instead of emailing. No domain
verification is needed to get started: Resend's default onboarding sender can
deliver to the account owner's own address, which is all a lead notification
needs.

### Testing

```bash
curl -X POST http://localhost:3000/api/audit-lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@example.com","website":"https://example.com","goal":"More traffic"}'
# → {"ok":true}, lead appended to var/leads.jsonl
```

### Deployment notes

- Set `LEAD_TO_EMAIL` and `RESEND_API_KEY` in the host's environment settings
  (e.g. Vercel → Project → Environment Variables).
- On serverless hosts the filesystem is ephemeral, so `var/leads.jsonl` is a
  same-instance safety net there, not durable storage — email is the real
  delivery channel. Add a database or spreadsheet hook if a durable second
  copy is ever needed.

## Portrait assets

`public/portrait-duotone.png` and `public/portrait-face.png` are generated
from a photo: background removed (rembg), remapped to the site's
ink→olive→lime duotone, plus a square face crop for the trust chip. To swap
in a new photo, rerun the processing script with the new source image and the
same output paths — no code changes needed.
