"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SceneCanvas, { S, useFrameShift, usePointerRig, useStaticRender } from "./SceneCanvas";

/* UI/UX design — a user flow, running. Faceted screens sit along a path;
   pulses travel the connections between them and each screen lights as a
   pulse arrives. One screen branches to a dead end that never lights: the
   drop-off the work exists to remove. */

type Node = {
  p: [number, number, number];
  s: [number, number];
  /** Dead ends stay dark — nothing completes through them. */
  dead?: boolean;
};

const NODES: Node[] = [
  { p: [-2.35, -0.72, 0.35], s: [0.62, 0.82] },
  { p: [-1.15, 0.12, 0.1], s: [0.72, 0.94] },
  { p: [0.1, -0.34, -0.05], s: [0.8, 1.02] },
  { p: [1.32, 0.5, -0.25], s: [0.72, 0.92] },
  { p: [2.45, -0.16, -0.5], s: [0.66, 0.86] },
  // the branch that goes nowhere
  { p: [0.62, -1.62, 0.2], s: [0.5, 0.64], dead: true },
];

/** Index pairs the pulses travel along, in order. */
const PATH: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
];
const BRANCH: [number, number] = [2, 5];

const PULSES = 3;
/** Seconds for one pulse to traverse the whole path. */
const TRIP = 6;

const vecA = new THREE.Vector3();

function Flow({ reduced }: { reduced: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const screens = useRef<(THREE.Mesh | null)[]>([]);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  usePointerRig(rig, { reduced, amount: 0.14 });

  const invalidate = useStaticRender();

  const points = useMemo(
    () => NODES.map((n) => new THREE.Vector3(...n.p)),
    []
  );

  // Connection lines, built once. The branch is drawn dimmer.
  const { pathGeo, branchGeo } = useMemo(() => {
    const pathPts: THREE.Vector3[] = [];
    for (const [a, b] of PATH) {
      pathPts.push(points[a], points[b]);
    }
    return {
      pathGeo: new THREE.BufferGeometry().setFromPoints(pathPts),
      branchGeo: new THREE.BufferGeometry().setFromPoints([
        points[BRANCH[0]],
        points[BRANCH[1]],
      ]),
    };
  }, [points]);

  useEffect(
    () => () => {
      pathGeo.dispose();
      branchGeo.dispose();
    },
    [pathGeo, branchGeo]
  );

  /** Position along the whole path at progress u (0..1), plus the leg index. */
  const sample = (u: number, out: THREE.Vector3) => {
    const scaled = THREE.MathUtils.clamp(u, 0, 0.9999) * PATH.length;
    const leg = Math.floor(scaled);
    const [a, b] = PATH[leg];
    out.copy(points[a]).lerp(points[b], scaled - leg);
    return leg;
  };

  const apply = (t: number) => {
    // Screens brighten as a pulse passes through them.
    const lit = new Array(NODES.length).fill(0);

    for (let i = 0; i < PULSES; i++) {
      const mesh = pulses.current[i];
      const u = ((t / TRIP + i / PULSES) % 1 + 1) % 1;
      const leg = sample(u, vecA);
      if (mesh) {
        mesh.position.copy(vecA);
        // Fade in and out at the ends so pulses don't pop at the boundary.
        const edge =
          THREE.MathUtils.smoothstep(u, 0, 0.06) *
          (1 - THREE.MathUtils.smoothstep(u, 0.93, 1));
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.95 * edge;
        mesh.scale.setScalar(0.6 + edge * 0.4);
      }
      // Light the node the pulse is closest to on this leg.
      const [a, b] = PATH[leg];
      const local = u * PATH.length - leg;
      lit[a] = Math.max(lit[a], Math.exp(-Math.pow(local * 3.2, 2)));
      lit[b] = Math.max(lit[b], Math.exp(-Math.pow((1 - local) * 3.2, 2)));
    }

    for (let i = 0; i < NODES.length; i++) {
      const mesh = screens.current[i];
      if (!mesh) continue;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const glow = NODES[i].dead ? 0 : lit[i];
      mat.emissiveIntensity = 0.02 + glow * 0.5;
      // Screens lean toward the viewer as they receive the pulse.
      mesh.rotation.y = -0.35 + glow * 0.2;
      mesh.position.z = NODES[i].p[2] + glow * 0.12;
    }
  };

  useEffect(() => {
    apply(reduced ? TRIP * 0.4 : 0);
    if (reduced) invalidate();
  });

  useFrame(({ clock }) => {
    if (reduced) return;
    apply(clock.elapsedTime);
  });

  return (
    <group ref={rig}>
      <lineSegments>
        <primitive object={pathGeo} attach="geometry" />
        <lineBasicMaterial color={S.accent} transparent opacity={0.4} />
      </lineSegments>
      <lineSegments>
        <primitive object={branchGeo} attach="geometry" />
        <lineBasicMaterial color={S.line} transparent opacity={0.28} />
      </lineSegments>

      {NODES.map((node, i) => (
        <group key={i} position={node.p}>
          <mesh
            ref={(el) => {
              screens.current[i] = el;
            }}
            rotation={[0, -0.35, 0]}
          >
            <boxGeometry args={[node.s[0], node.s[1], 0.05]} />
            <meshStandardMaterial
              color={node.dead ? S.slateDark : S.slate}
              emissive={S.accent}
              emissiveIntensity={0.02}
              flatShading
              roughness={0.55}
              metalness={0.2}
            />
          </mesh>
          {/* Header bar, so each slab reads as a screen rather than a tile */}
          <mesh position={[0, node.s[1] / 2 - 0.1, 0.04]} rotation={[0, -0.35, 0]}>
            <boxGeometry args={[node.s[0] * 0.7, 0.05, 0.02]} />
            <meshBasicMaterial
              color={node.dead ? S.line : S.accent}
              transparent
              opacity={node.dead ? 0.25 : 0.55}
            />
          </mesh>
        </group>
      ))}

      {Array.from({ length: PULSES }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            pulses.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.075, 10, 10]} />
          <meshBasicMaterial color={S.accent} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const reduced = useReducedMotion();
  const shiftX = useFrameShift(0.05);

  return (
    <group position={[shiftX, 0.25, 0]} rotation={[0.12, 0, 0]} scale={0.86}>
      <ambientLight intensity={0.5} color="#aab4d4" />
      <directionalLight position={[2, 4, 5]} intensity={0.8} color="#e8ecff" />
      <Flow reduced={reduced} />
    </group>
  );
}

export default function FlowScene({ className }: { className?: string }) {
  return (
    <SceneCanvas className={className} camera={[0, 0.1, 6.2]} fov={44}>
      <Scene />
    </SceneCanvas>
  );
}
