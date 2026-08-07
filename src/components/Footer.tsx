"use client";

import { useEffect, useState } from "react";
import { scrollToTop } from "./SmoothScroll";

export default function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/New_York",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-5 px-6 py-10 font-mono text-[11px] tracking-[0.2em] text-muted uppercase md:flex-row md:px-10">
        <p>© 2026 Beltowski Studio</p>
        <p>
          Florida —{" "}
          <time suppressHydrationWarning className="tabular-nums">
            {time || "··:··:··"}
          </time>{" "}
          ET
        </p>
        <p>Designed &amp; built by hand</p>
        <button
          type="button"
          onClick={scrollToTop}
          data-cursor="hover"
          className="transition-colors hover:text-accent"
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
