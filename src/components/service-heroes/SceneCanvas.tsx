"use client";

import type { ReactNode } from "react";
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

/**
 * A reduced-motion scene runs `frameloop="demand"`, which draws once at mount
 * and then only when something asks it to. These scenes build their instance
 * matrices in an effect that runs *after* that first draw, so without an
 * explicit invalidate the canvas stays empty for exactly the users who can't
 * see the animation that would otherwise have filled it.
 */
export function useStaticRender() {
  return useThree((state) => state.invalidate);
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

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: camera, fov }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        // A reduced-motion scene renders one frame and stops rather than
        // burning a rAF loop on a still image.
        frameloop={reduced ? "demand" : "always"}
      >
        {children}
      </Canvas>
    </div>
  );
}
