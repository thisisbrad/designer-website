"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SceneCanvas, {
  S,
  useFrameShift,
  usePointerRig,
  useStaticRender,
} from "./SceneCanvas";

/* Web design — a page composing itself in space. Editorial panels drift on
   independent phases, then a settle cycle pulls them toward their layout
   positions and releases them again: the moment a scattered set of parts
   resolves into a grid. Panels are flat-shaded slabs so they read as the
   same low-poly family as the lighthouse. */

type Panel = {
  /** Resting layout position — where the panel belongs once composed. */
  p: [number, number, number];
  /** Width/height of the slab. */
  s: [number, number];
  /** Scatter offset, applied when the composition is loose. */
  o: [number, number, number];
  accent?: boolean;
  /** Deep panels sit back and dim, building depth without extra lights. */
  dim?: number;
};

const PANELS: Panel[] = [
  { p: [0, 0.95, 0], s: [2.5, 0.42], o: [-0.5, 0.35, -0.4], accent: true },
  { p: [-0.72, 0.15, 0.12], s: [1.06, 1.06], o: [-0.7, -0.3, 0.5] },
  { p: [0.63, 0.34, 0.06], s: [1.14, 0.24], o: [0.75, 0.5, 0.2] },
  { p: [0.63, -0.02, 0.06], s: [1.14, 0.16], o: [0.9, 0.15, 0.3] },
  { p: [0.63, -0.28, 0.06], s: [0.7, 0.16], o: [1.0, -0.25, 0.15], accent: true },
  { p: [-0.2, -0.92, -0.1], s: [2.1, 0.5], o: [-0.3, -0.7, -0.5], dim: 0.55 },
  { p: [-1.62, -0.66, -0.5], s: [0.62, 0.62], o: [-1.1, -0.5, -0.7], dim: 0.4 },
  { p: [1.52, 0.92, -0.62], s: [0.8, 0.5], o: [1.2, 0.8, -0.8], dim: 0.35 },
  { p: [1.32, -0.78, -0.3], s: [0.9, 0.3], o: [1.0, -0.9, -0.4], dim: 0.5 },
  { p: [-1.5, 0.78, -0.28], s: [0.54, 0.3], o: [-1.2, 0.9, -0.35], dim: 0.6 },
];

/** Seconds for one scatter → compose → scatter cycle. */
const CYCLE = 11;

function Panels({ reduced }: { reduced: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const items = useRef<(THREE.Group | null)[]>([]);
  usePointerRig(rig, { reduced, amount: 0.16 });

  const invalidate = useStaticRender();

  const phases = useMemo(
    () => PANELS.map((_, i) => (i * 2.399) % (Math.PI * 2)),
    []
  );

  const apply = (t: number) => {
    // 0 = scattered, 1 = composed. Long hold at each end, quick transit.
    const tau = (t % CYCLE) / CYCLE;
    const compose =
      THREE.MathUtils.smoothstep(tau, 0.08, 0.32) -
      THREE.MathUtils.smoothstep(tau, 0.62, 0.86);

    for (let i = 0; i < PANELS.length; i++) {
      const g = items.current[i];
      if (!g) continue;
      const panel = PANELS[i];
      const loose = 1 - compose;
      const bob = Math.sin(t * 0.5 + phases[i]) * 0.05 * loose;

      g.position.set(
        panel.p[0] + panel.o[0] * loose,
        panel.p[1] + panel.o[1] * loose + bob,
        panel.p[2] + panel.o[2] * loose
      );
      // Panels rotate out of plane while loose and square up when composed.
      g.rotation.x = Math.sin(t * 0.32 + phases[i]) * 0.22 * loose;
      g.rotation.y = Math.cos(t * 0.27 + phases[i] * 1.4) * 0.3 * loose;
    }
  };

  // Reduced motion still gets the composed layout, just frozen there.
  useEffect(() => {
    apply(reduced ? CYCLE * 0.45 : 0);
    if (reduced) invalidate();
  });

  useFrame(({ clock }) => {
    if (reduced) return;
    apply(clock.elapsedTime);
  });

  return (
    <group ref={rig}>
      {PANELS.map((panel, i) => (
        <group
          key={i}
          ref={(el) => {
            items.current[i] = el;
          }}
        >
          <mesh>
            <boxGeometry args={[panel.s[0], panel.s[1], 0.035]} />
            <meshStandardMaterial
              color={panel.accent ? S.accent : S.slate}
              emissive={panel.accent ? S.accent : "#000000"}
              emissiveIntensity={panel.accent ? 0.35 : 0}
              transparent
              opacity={1 - (panel.dim ?? 0) * 0.55}
              flatShading
              roughness={0.6}
              metalness={0.15}
            />
          </mesh>
          {/* Hairline edge — the detail that makes a slab read as a card
              rather than a block. */}
          <lineSegments>
            <edgesGeometry
              args={[new THREE.BoxGeometry(panel.s[0], panel.s[1], 0.035)]}
            />
            <lineBasicMaterial
              color={panel.accent ? S.accent : S.line}
              transparent
              opacity={panel.accent ? 0.9 : 0.5 - (panel.dim ?? 0) * 0.3}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

/** Baseline grid the composition sits on — a typographic reference plane. */
function Baseline() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(14, 14, 28, 28);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <lineSegments position={[0, -2.1, -1]}>
      <wireframeGeometry args={[geo]} />
      <lineBasicMaterial color={S.line} transparent opacity={0.16} />
    </lineSegments>
  );
}

function Scene() {
  const reduced = useReducedMotion();
  const shiftX = useFrameShift(0.1);

  return (
    <group position={[shiftX, 0.1, 0]}>
      <ambientLight intensity={0.55} color="#aab4d4" />
      <directionalLight position={[2.5, 4, 5]} intensity={0.9} color="#e8ecff" />
      <pointLight position={[-3, 1, 3]} intensity={12} color={S.accent} distance={9} decay={2} />
      <Baseline />
      <Panels reduced={reduced} />
    </group>
  );
}

export default function CompositionScene({ className }: { className?: string }) {
  return (
    <SceneCanvas className={className} camera={[0, 0.2, 6.4]} fov={44}>
      <Scene />
    </SceneCanvas>
  );
}
