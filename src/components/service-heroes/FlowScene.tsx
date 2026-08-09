"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SceneCanvas, { S, useFrameShift, usePointerRig } from "./SceneCanvas";

/* UI/UX design — a flow untangling itself.
 *
 * The graph opens as a knot: the same nodes and the same edges, but thrown
 * through depth so the connections cross. It resolves left to right into
 * flat tiers with forward-only edges, and the dead-end branches dissolve as
 * it goes — the work doesn't tidy the wrong turns, it removes them.
 *
 * Depth carries the meaning: chaotic z while tangled, near-flat once
 * resolved, so the resolved state reads as a diagram you could follow. That
 * flattening is also what keeps it distinct from the AI scene's swarm,
 * which converges the other way — into a solid.
 */

type Node = {
  /** Tier index — also the resolve order, so it unknots from the entry out. */
  tier: number;
  y: number;
  /** Dead ends exist only in the tangled state. */
  dead?: boolean;
  goal?: boolean;
};

/* Narrower than it looks like it wants to be: at a wider span the entry
   node lands behind the headline and the flow appears to start nowhere. */
const TIER_X = [-2.1, -1.05, 0, 1.05, 2.1];

const NODES: Node[] = [
  { tier: 0, y: 0 }, // 0 entry
  { tier: 1, y: 0.95 }, // 1
  { tier: 1, y: 0 }, // 2
  { tier: 1, y: -0.95 }, // 3
  { tier: 2, y: 1.24 }, // 4
  { tier: 2, y: 0.42 }, // 5
  { tier: 2, y: -0.42 }, // 6
  { tier: 2, y: -1.24 }, // 7
  { tier: 3, y: 0.8 }, // 8
  { tier: 3, y: 0 }, // 9
  { tier: 3, y: -0.8 }, // 10
  { tier: 4, y: 0, goal: true }, // 11 done
  { tier: 2, y: 2.05, dead: true }, // 12
  { tier: 3, y: -1.95, dead: true }, // 13
];

/** Forward-only in the resolved layout, so nothing doubles back. */
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 4],
  [1, 5],
  [2, 5],
  [2, 6],
  [3, 6],
  [3, 7],
  [4, 8],
  [5, 8],
  [5, 9],
  [6, 9],
  [6, 10],
  [7, 10],
  [8, 11],
  [9, 11],
  [10, 11],
  // the branches that go nowhere
  [1, 12],
  [7, 13],
];

/** The route the pulses take once the flow is legible. */
const MAIN_PATH = [0, 2, 5, 9, 11];

const PULSES = 2;
/** Seconds for one tangled → resolved → tangled cycle. */
const CYCLE = 13;
/** Seconds for a pulse to run the main path once. */
const TRIP = 3.4;

const dummy = new THREE.Object3D();
const color = new THREE.Color();
const accent = new THREE.Color(S.accent);
const slate = new THREE.Color(S.slate);
const edgeIdle = new THREE.Color(S.line);
const ink = new THREE.Color("#0a0a0b");
const vecA = new THREE.Vector3();

/** Deterministic jitter — a fixed tangle beats one that's occasionally bad. */
function noise(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function Graph({ reduced }: { reduced: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  usePointerRig(rig, { reduced, amount: 0.13 });

  const { resolved, tangled, live } = useMemo(() => {
    const resolved: THREE.Vector3[] = [];
    const tangled: THREE.Vector3[] = [];
    const live: THREE.Vector3[] = [];
    NODES.forEach((node, i) => {
      resolved.push(new THREE.Vector3(TIER_X[node.tier], node.y, 0));
      // Thrown off their tiers and through depth so the edges cross.
      tangled.push(
        new THREE.Vector3(
          noise(i, 1) * 2.45,
          noise(i, 2) * 1.75,
          noise(i, 3) * 1.9
        )
      );
      // Reused every frame rather than reallocated.
      live.push(new THREE.Vector3());
    });
    return { resolved, tangled, live };
  }, []);

  /* One LineSegments for every edge. Positions are rewritten each frame
     because the nodes move; per-edge fade rides on vertex colours, since a
     single material has only one opacity to give. */
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const position = new THREE.BufferAttribute(
      new Float32Array(EDGES.length * 6),
      3
    );
    const colors = new THREE.BufferAttribute(
      new Float32Array(EDGES.length * 6),
      3
    );
    position.setUsage(THREE.DynamicDrawUsage);
    colors.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", position);
    geo.setAttribute("color", colors);
    return geo;
  }, []);

  useEffect(() => () => lineGeo.dispose(), [lineGeo]);

  const apply = (t: number) => {
    const mesh = nodes.current;
    if (!mesh) return;
    const smooth = THREE.MathUtils.smoothstep;
    const tau = (t % CYCLE) / CYCLE;
    // Knot → resolve → hold → knot again.
    const resolve = smooth(tau, 0.1, 0.42) - smooth(tau, 0.72, 0.95);

    // --- nodes ---
    for (let i = 0; i < NODES.length; i++) {
      const node = NODES[i];
      const p = live[i];

      // Tiers settle in order, so the flow straightens out from the entry.
      const lead = smooth(resolve, node.tier * 0.1, 0.45 + node.tier * 0.1);
      p.copy(tangled[i]).lerp(resolved[i], lead);
      // Loose nodes drift; settled ones hold still.
      const loose = 1 - lead;
      p.x += Math.sin(t * 0.42 + i) * 0.12 * loose;
      p.y += Math.cos(t * 0.37 + i * 1.7) * 0.12 * loose;
      p.z += Math.sin(t * 0.31 + i * 2.3) * 0.16 * loose;

      // Dead ends only exist while the flow is a mess.
      const alive = node.dead ? 1 - lead : 1;
      const scale = (node.goal ? 0.2 : 0.13) * alive;

      dummy.position.copy(p);
      dummy.rotation.set(t * 0.2 + i, t * 0.16 + i, 0);
      dummy.scale.setScalar(Math.max(scale, 0.0001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      if (node.goal) color.copy(accent);
      else if (node.dead) color.copy(slate).lerp(ink, lead);
      else color.copy(slate).lerp(accent, lead * 0.5);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // --- edges ---
    const pos = lineGeo.attributes.position as THREE.BufferAttribute;
    const col = lineGeo.attributes.color as THREE.BufferAttribute;
    const pArr = pos.array as Float32Array;
    const cArr = col.array as Float32Array;

    for (let e = 0; e < EDGES.length; e++) {
      const [a, b] = EDGES[e];
      const pa = live[a];
      const pb = live[b];
      pArr[e * 6] = pa.x;
      pArr[e * 6 + 1] = pa.y;
      pArr[e * 6 + 2] = pa.z;
      pArr[e * 6 + 3] = pb.x;
      pArr[e * 6 + 4] = pb.y;
      pArr[e * 6 + 5] = pb.z;

      /* A dead branch fades to the background as the flow resolves; the rest
         warm toward accent. Fading to ink rather than using alpha is what
         keeps the whole graph in a single draw call. */
      const dead = NODES[a].dead || NODES[b].dead;
      if (dead) color.copy(edgeIdle).lerp(ink, resolve);
      else color.copy(edgeIdle).lerp(accent, resolve * 0.75);

      for (let v = 0; v < 2; v++) {
        cArr[e * 6 + v * 3] = color.r;
        cArr[e * 6 + v * 3 + 1] = color.g;
        cArr[e * 6 + v * 3 + 2] = color.b;
      }
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;

    // --- pulses: only once there's a legible path to run ---
    const running = smooth(resolve, 0.72, 0.95);
    for (let i = 0; i < PULSES; i++) {
      const pulse = pulses.current[i];
      if (!pulse) continue;
      const mat = pulse.material as THREE.MeshBasicMaterial;
      if (running <= 0.001) {
        mat.opacity = 0;
        continue;
      }
      const u = (((t / TRIP + i / PULSES) % 1) + 1) % 1;
      const legs = MAIN_PATH.length - 1;
      const scaled = u * legs;
      const leg = Math.min(Math.floor(scaled), legs - 1);
      vecA
        .copy(live[MAIN_PATH[leg]])
        .lerp(live[MAIN_PATH[leg + 1]], scaled - leg);
      pulse.position.copy(vecA);
      // Fade at both ends so a pulse never pops at the boundary.
      const edge = smooth(u, 0, 0.08) * (1 - smooth(u, 0.9, 1));
      mat.opacity = running * edge;
      pulse.scale.setScalar(0.7 + edge * 0.3);
    }
  };

  useEffect(() => {
    // Reduced motion holds the resolved state — the point of the scene.
    apply(reduced ? CYCLE * 0.55 : 0);
  });

  useFrame(({ clock }) => {
    if (reduced) return;
    apply(clock.elapsedTime);
  });

  return (
    <group ref={rig}>
      <lineSegments frustumCulled={false}>
        <primitive object={lineGeo} attach="geometry" />
        <lineBasicMaterial vertexColors transparent opacity={0.9} />
      </lineSegments>

      {/* Octahedra rather than slabs: the web-design hero owns panels. */}
      <instancedMesh
        ref={nodes}
        args={[undefined, undefined, NODES.length]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading roughness={0.45} metalness={0.25} />
      </instancedMesh>

      {Array.from({ length: PULSES }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            pulses.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshBasicMaterial color={S.paper} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const reduced = useReducedMotion();
  const shiftX = useFrameShift(0.5);

  return (
    <group position={[shiftX, 0.1, 0]} scale={0.95}>
      <ambientLight intensity={0.5} color="#aab4d4" />
      <directionalLight position={[2, 4, 5]} intensity={0.85} color="#e8ecff" />
      {/* Sits near the goal node so "done" is the brightest thing in frame —
          but kept low, because accent light on an accent node saturates
          straight past lime into white and loses the brand colour. */}
      <pointLight
        position={[2.3, 0, 1.6]}
        intensity={3.2}
        color={S.accent}
        distance={5.5}
        decay={2}
      />
      <Graph reduced={reduced} />
    </group>
  );
}

export default function FlowScene({ className }: { className?: string }) {
  return (
    <SceneCanvas className={className} camera={[0, 0.1, 6.4]} fov={44}>
      <Scene />
    </SceneCanvas>
  );
}
