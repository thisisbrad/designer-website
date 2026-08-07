import Link from "next/link";
import { Fragment } from "react";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Renders body copy that may contain `[label](/href)` links, so posts can
 * carry contextual internal links without shipping an HTML parser or
 * dangerouslySetInnerHTML.
 */
export default function RichText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  LINK.lastIndex = 0;
  while ((match = LINK.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    const [, label, href] = match;
    const external = href.startsWith("http");
    const className =
      "text-paper underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent";

    nodes.push(
      external ? (
        <a
          key={match.index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {label}
        </a>
      ) : (
        <Link key={match.index} href={href} className={className}>
          {label}
        </Link>
      )
    );
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));

  return (
    <>
      {nodes.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  );
}
