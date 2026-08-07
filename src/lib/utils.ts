import { useEffect, useLayoutEffect } from "react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Seconds the preloader holds the screen before the hero reveal should begin. */
export const INTRO_DELAY = 1.35;

/** useLayoutEffect on the client, useEffect during SSR (avoids hydration warnings). */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
