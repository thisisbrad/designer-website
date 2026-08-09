"use client";

import { useEffect, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* Shared palette for the service scenes. The homepage lighthouse keeps its
   own gold-and-navy night palette; these use the interface colours so the
   six read as one set built from the same parts. */
export const S = {
  accent: "#d7fb44",
  accentDim: "#7f9628",
  paper: "#f2efe8",
  slate: "#2c3347",
  slateDark: "#1b202c",
  ink2: "#111113",
  line: "#3a4152",
} as const;

/**
 * Damped pointer-follow for a whole rig. Rotation is clamped small — these
 * sit behind headline copy, so the scene should acknowledge the cursor
 * rather than perform for it.
 */
export function usePointerRig(
  ref: React.RefObject<THREE.Group | null>,
  {
    reduced,
    amount = 0.12,
    damp = 2.4,
    /** Resting rotation the pointer offset is applied around. Pass the same
     *  values used in JSX — otherwise the first frame damps them to zero and
     *  the rig's intended pose is lost. */
    base = [0, 0],
  }: {
    reduced: boolean;
    amount?: number;
    damp?: number;
    base?: [number, number];
  }
) {
  useFrame((state, delta) => {
    const g = ref.current;
    if (!g || reduced) return;
    const { pointer } = state;
    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      base[1] + pointer.x * amount,
      damp,
      delta
    );
    g.rotation.x = THREE.MathUtils.damp(
      g.rotation.x,
      base[0] - pointer.y * amount * 0.6,
      damp,
      delta
    );
  });
}

/**
 * Shifts a rig toward the right of the frame on wide screens so it clears
 * the headline column, and centres it on portrait — same trick the
 * lighthouse scene uses.
 */
export function useFrameShift(base = 0) {
  const viewport = useThree((state) => state.viewport);
  return (
    base +
    viewport.width * THREE.MathUtils.clamp((viewport.aspect - 1) * 0.3, 0, 0.155)
  );
}

export default function SceneCanvas({
  children,
  className,
  camera = [0, 0, 8],
  fov = 42,
}: {
  children: ReactNode;
  className?: string;
  camera?: [number, number, number];
  fov?: number;
}) {
  const reduced = useReducedMotion();

  /* Arriving by link leaves the hero blank without this.
   *
   * On a client-side navigation the scene chunk is already cached, so the
   * Canvas mounts before layout has given its container a size. R3F measures
   * 0, never creates a <canvas>, and nothing ever tells it to look again:
   * react-use-measure's observer doesn't re-fire, and Lenis suppresses the
   * native scroll events R3F would otherwise remeasure on. A cold load hides
   * the whole problem behind the chunk fetch, which is why it only shows up
   * when clicking through from another page.
   *
   * One window resize after layout settles is what makes it measure. Tested:
   * neither this nor the `resize` prop below fixes it alone — the canvas
   * stays pinned at the 300x150 default. Both are load-bearing. */
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      window.dispatchEvent(new Event("resize"))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: camera, fov }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        /* Always-on, including for reduced motion — those scenes freeze their
           content instead of stopping the loop. A still scene this small is
           cheap to redraw, and it keeps the visible result independent of
           demand-mode invalidation timing. */
        frameloop="always"
        /* R3F defaults react-use-measure to scroll-driven remeasurement with
           a debounce. Lenis suppresses native scroll events, so on a
           client-side navigation the container measures 0, no <canvas> is
           ever created and the hero is blank. Measuring eagerly and ignoring
           scroll is what makes it size on mount. */
        resize={{ scroll: false, debounce: 0 }}
      >
        {children}
      </Canvas>
    </div>
  );
}
