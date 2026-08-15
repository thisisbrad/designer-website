/**
 * PII redaction for the one analytics event that carries free text.
 *
 * Lives in its own module so it can be unit-tested directly: events.ts pulls
 * in the whole gtag surface, which needs a browser.
 */

/**
 * Strip anything that identifies a person before text leaves the browser.
 *
 * Deliberately blunt. Over-redacting a question costs a little insight;
 * under-redacting one puts personal data into Google Analytics, which their
 * terms prohibit and the privacy page says never happens.
 */
export function scrubPii(text: string): string {
  return text
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[email]")
    .replace(/https?:\/\/\S+/gi, "[url]")
    // Any run of 7+ digits, however punctuated — phone numbers, card numbers,
    // account references. Catches more than phone numbers on purpose.
    .replace(/\+?\d[\d\s().-]{5,}\d/g, (match) =>
      (match.match(/\d/g) ?? []).length >= 7 ? "[number]" : match
    )
    .trim();
}

/** Test-only alias, so the intent of importing it from a test is obvious. */
export const scrubPiiForTest = scrubPii;
