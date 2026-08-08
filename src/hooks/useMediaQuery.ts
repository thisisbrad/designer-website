"use client";

import { useEffect, useState } from "react";

/**
 * Starts `false` so the server render and the first client render agree, then
 * settles after mount. Gate expensive client-only work on this rather than on
 * a width read during render.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
