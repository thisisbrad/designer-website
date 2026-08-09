"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SceneCanvas, { S, useFrameShift, usePointerRig } from "./SceneCanvas";

/* UI/UX design — a user flow happening.
 *
 * The graph opens as a knot: the same nodes and edges, thrown through depth
 * so the connections cross. It settles into flat tiers left to right, and as
 * each tier lands an accent light runs its edges — the flow doesn't just
 * tidy itself, you watch it connect, entry to goal, in order. Once the path
 * is legible, pulses launch from the entry and ride it end to end; arriving
 * at the goal rings a ripple. Dead-end branches dissolve as it resolves —
 * the work doesn't tidy the wrong turns, it removes them.
 *
 * The first connect is choreographed to the copy: the knot holds while the
 * headline sets, then the cascade lands just after "right on the first try".
 * From there the loop never fully undoes itself — it loosens from the goal
 * end backwards and reconnects, so the payoff repeats but the solved flow is
 * never thrown back into the knot.
 *
 * Edges are fat-line curves (LineSegments2): gl.lineWidth is capped at 1px
 * on most platforms, and straight hairlines read as a network demo rather
 * than a designed flow diagram. Tangled, they sag on per-edge noise; settled,
 * they become the horizontal-handled S-curves of a flowchart. Every edge
 * lives in one instanced geometry whose interleaved buffers are rewritten in
 * place each frame — no per-frame allocation, one draw call, per-vertex
 * colour carrying the travelling light.
 *
 * The cursor shoves nearby nodes and the flow pulls itself straight again —
 * pulses keep finding the goal while you bend the path. The scene only
 * mounts at ≥768px, so pointer-only interaction has no mobile cost.
 *
 * Depth carries the meaning: chaotic z while tangled, near-flat once
 * resolved, so the connected state reads as a diagram you could follow.
 * That flattening also keeps it distinct from the AI scene's swarm, which
 * converges the other way — into a solid.
 */

type Node = {
  /** Tier index — also the resolve order, so it connects from the entry out. */
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

/* --- timeline ---
 * The knot holds while headline line one sets (word stagger ends ~1.1s of
 * page time; the scene clock starts a beat later behind the dynamic import),
 * then the connect cascade lands as punctuation after "right on the first
 * try". The loop after that is hold → loosen → reconnect. */
const INTRO_HOLD = 0.55;
const INTRO_DUR = 1.3;
const INTRO_END = INTRO_HOLD + INTRO_DUR;
const HOLD = 7.6;
const LOOSEN = 1.6;
const LOOSE_HOLD = 1.1;
const RESOLVE = 1.5;
const PERIOD = HOLD + LOOSEN + LOOSE_HOLD + RESOLVE;
/** How far the loop relaxes — never all the way back to the knot. */
const SLACK = 0.62;

const PULSES = 2;
/** Ghost copies trailing each pulse. */
const TRAIL = 4;
/** Seconds for a pulse to run the main path once. */
const TRIP = 3.2;
/** Curve subdivisions per edge — 20 keeps the sweep head gradient smooth. */
const SEGS = 20;

/** Cursor influence: radius, shove strength. */
const PUSH_R = 1.15;
const PUSH_F = 0.55;

const dummy = new THREE.Object3D();
const color = new THREE.Color();
const color2 = new THREE.Color();
const accent = new THREE.Color(S.accent);
const slate = new THREE.Color(S.slate);
const edgeIdle = new THREE.Color(S.line);
const paper = new THREE.Color(S.paper);
const ink = new THREE.Color("#0a0a0b");
const vecA = new THREE.Vector3();
const vecB = new THREE.Vector3();
const vecC = new THREE.Vector3();
/** The resolved flow lives near z=0, so the cursor maps onto that plane. */
const POINTER_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

/* Scratch curves, one per edge, reused every frame. Control points are
   rewritten before each evaluation, so nothing here is stateful. */
const curves = EDGES.map(
  () =>
    new THREE.CubicBezierCurve3(
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    )
);

/** Edge index for each main-path leg, so pulses ride the drawn curves. */
const EDGE_AT = new Map(EDGES.map(([a, b], i) => [`${a}-${b}`, i]));
const LEG_EDGES = MAIN_PATH.slice(0, -1).map(
  (a, i) => EDGE_AT.get(`${a}-${MAIN_PATH[i + 1]}`)!
);

/* The main journey warms brighter than the side routes — a flow diagram
   with every line at full accent has no hierarchy, and the pulses' route
   should read as THE path. */
const MAIN_EDGE = new Set(LEG_EDGES);
const MAIN_NODE = new Set(MAIN_PATH);

/** Deterministic jitter — a fixed tangle beats one that's occasionally bad. */
function noise(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** Intro ramp once, then hold → loosen → reconnect forever. */
function resolveAt(t: number) {
  const smooth = THREE.MathUtils.smoothstep;
  if (t < INTRO_END) return smooth(t, INTRO_HOLD, INTRO_END);
  const phase = (t - INTRO_END) % PERIOD;
  const slack =
    smooth(phase, HOLD, HOLD + LOOSEN) -
    smooth(phase, HOLD + LOOSEN + LOOSE_HOLD, PERIOD);
  return 1 - SLACK * slack;
}

/** Tiers settle in order, so the flow connects from the entry out. */
function leadOf(resolve: number, tier: number) {
  return THREE.MathUtils.smoothstep(resolve, tier * 0.1, 0.45 + tier * 0.1);
}

/**
 * Colour along an edge: idle slate ahead of the sweep, warmed to accent
 * behind it, with a paper-bright head where the light currently is. Dead
 * branches never get the light — they fade to the page background instead,
 * which is what keeps everything in a single draw call (no per-edge alpha).
 */
function edgeColorAt(
  u: number,
  h: number,
  headOn: number,
  dead: boolean,
  main: boolean,
  resolve: number,
  out: THREE.Color
) {
  if (dead) {
    out.copy(edgeIdle).lerp(ink, resolve);
    return;
  }
  const warm = THREE.MathUtils.smoothstep(h - u, 0, 0.16);
  out.copy(edgeIdle).lerp(accent, (main ? 0.85 : 0.42) * warm);
  const head = Math.exp(-((u - h) ** 2) / 0.0072) * headOn * (main ? 1 : 0.55);
  if (head > 0.01) out.lerp(paper, 0.55 * head);
}

function Graph({ reduced }: { reduced: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  const trails = useRef<(THREE.Mesh | null)[]>([]);
  const ripple = useRef<THREE.Mesh>(null);
  /** Completed-trip counter per pulse; a bump means a goal arrival. */
  const prevTrip = useRef<number[]>(Array(PULSES).fill(-1));
  const lastArrival = useRef(-99);
  const cursor = useRef(new THREE.Vector3());
  /** Armed on the first real pointer move — r3f's pointer starts at (0,0),
   *  which would otherwise read as a cursor parked mid-scene on load. */
  const cursorOn = useRef(false);
  const pointerSeen = useRef<[number, number] | null>(null);
  const size = useThree((state) => state.size);
  usePointerRig(rig, { reduced, amount: 0.13 });

  const { resolved, tangled, live, offsets } = useMemo(() => {
    const resolved: THREE.Vector3[] = [];
    const tangled: THREE.Vector3[] = [];
    const live: THREE.Vector3[] = [];
    const offsets: THREE.Vector3[] = [];
    NODES.forEach((node, i) => {
      resolved.push(new THREE.Vector3(TIER_X[node.tier], node.y, 0));
      // Thrown off their tiers and through depth so the edges cross.
      // Slightly narrower than the resolved span, or the knot spills
      // past the frame's right edge before it settles.
      tangled.push(
        new THREE.Vector3(
          noise(i, 1) * 2.15,
          noise(i, 2) * 1.75,
          noise(i, 3) * 1.9
        )
      );
      // Reused every frame rather than reallocated.
      live.push(new THREE.Vector3());
      // Cursor displacement, springing back to zero — the heal.
      offsets.push(new THREE.Vector3());
    });
    return { resolved, tangled, live, offsets };
  }, []);

  /* One LineSegments2 for every edge: SEGS instanced segments per curve in a
     shared interleaved buffer we rewrite in place each frame. setPositions/
     setColors allocate fresh buffers per call, so they run once here and the
     frame loop writes straight into the arrays. */
  const { lineObj, lineGeo, lineMat, posBuf, colBuf } = useMemo(() => {
    const geo = new LineSegmentsGeometry();
    geo.setPositions(new Float32Array(EDGES.length * SEGS * 6));
    geo.setColors(new Float32Array(EDGES.length * SEGS * 6));
    const posBuf = (
      geo.attributes.instanceStart as THREE.InterleavedBufferAttribute
    ).data as THREE.InstancedInterleavedBuffer;
    const colBuf = (
      geo.attributes.instanceColorStart as THREE.InterleavedBufferAttribute
    ).data as THREE.InstancedInterleavedBuffer;
    posBuf.setUsage(THREE.DynamicDrawUsage);
    colBuf.setUsage(THREE.DynamicDrawUsage);
    const mat = new LineMaterial({
      vertexColors: true,
      linewidth: 1.7,
      transparent: true,
      opacity: 0.92,
      // Fat lines are camera-facing quads; writing depth would let the
      // transparent overlaps punch holes in each other at the crossings.
      depthWrite: false,
    });
    const obj = new LineSegments2(geo, mat);
    // The bounding sphere never updates from our raw writes.
    obj.frustumCulled = false;
    return { lineObj: obj, lineGeo: geo, lineMat: mat, posBuf, colBuf };
  }, []);

  useEffect(
    () => () => {
      lineGeo.dispose();
      lineMat.dispose();
    },
    [lineGeo, lineMat]
  );

  /* LineMaterial converts clip space to pixels itself; it needs the CSS
     canvas size (DPR is already inside the projection). */
  useEffect(() => {
    lineMat.resolution.set(size.width, size.height);
  }, [lineMat, size]);

  const apply = (t: number, dt: number) => {
    const mesh = nodes.current;
    if (!mesh) return;
    const smooth = THREE.MathUtils.smoothstep;
    const resolve = resolveAt(t);
    const sinceArrival = Math.max(t - lastArrival.current, 0);

    // --- nodes ---
    for (let i = 0; i < NODES.length; i++) {
      const node = NODES[i];
      const p = live[i];

      const lead = leadOf(resolve, node.tier);
      p.copy(tangled[i]).lerp(resolved[i], lead);
      // Loose nodes drift; settled ones hold still.
      const loose = 1 - lead;
      p.x += Math.sin(t * 0.42 + i) * 0.12 * loose;
      p.y += Math.cos(t * 0.37 + i * 1.7) * 0.12 * loose;
      p.z += Math.sin(t * 0.31 + i * 2.3) * 0.16 * loose;

      /* Cursor shove with a spring-back: quick to yield, slower to heal, so
         the flow visibly pulls itself straight again. */
      const off = offsets[i];
      vecC.set(0, 0, 0);
      if (cursorOn.current) {
        const d = p.distanceTo(cursor.current);
        if (d < PUSH_R) {
          const f = (1 - d / PUSH_R) ** 2 * PUSH_F;
          if (d > 1e-3) {
            vecC.copy(p).sub(cursor.current).multiplyScalar(f / d);
          } else {
            vecC.set(0, f, 0);
          }
        }
      }
      const lam = vecC.lengthSq() > off.lengthSq() ? 7 : 3;
      off.lerp(vecC, 1 - Math.exp(-lam * dt));
      p.add(off);

      // Dead ends only exist while the flow is a mess.
      const alive = node.dead ? 1 - lead : 1;
      let scale = (node.goal ? 0.2 : 0.13) * alive;
      if (node.goal) {
        // Breathes at rest, kicks when a pulse lands.
        scale *=
          1 + 0.06 * Math.sin(t * 2.2) + 0.3 * Math.exp(-3.5 * sinceArrival);
      }

      dummy.position.copy(p);
      dummy.rotation.set(t * 0.2 + i, t * 0.16 + i, 0);
      dummy.scale.setScalar(Math.max(scale, 0.0001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      if (node.goal) color.copy(accent);
      else if (node.dead) color.copy(slate).lerp(ink, lead);
      else color.copy(slate).lerp(accent, lead * (MAIN_NODE.has(i) ? 0.62 : 0.3));
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // --- edges ---
    const pArr = posBuf.array as Float32Array;
    const cArr = colBuf.array as Float32Array;
    let w = 0;

    for (let e = 0; e < EDGES.length; e++) {
      const [a, b] = EDGES[e];
      const pa = live[a];
      const pb = live[b];
      const leadB = leadOf(resolve, NODES[b].tier);
      const settle = (leadOf(resolve, NODES[a].tier) + leadB) / 2;
      const dead = Boolean(NODES[a].dead || NODES[b].dead);

      /* Handles morph from bowed-chord-plus-sag (the knot) into horizontal
         flowchart handles (the diagram). The sway keeps tangled strands
         moving like slack cable rather than frozen wire. */
      const curve = curves[e];
      curve.v0.copy(pa);
      curve.v3.copy(pb);
      const dx = Math.max(Math.abs(pb.x - pa.x), 0.5) * 0.46;
      const sway = Math.sin(t * 0.4 + e * 1.7) * 0.14;

      vecA.set(
        (pb.x - pa.x) * 0.3 + noise(e, 4) * 0.7,
        (pb.y - pa.y) * 0.3 + noise(e, 5) * 0.7 + sway,
        (pb.z - pa.z) * 0.3 + noise(e, 6) * 0.8
      );
      curve.v1
        .copy(pa)
        .addScaledVector(vecA, 1 - settle)
        .add(vecB.set(dx * settle, 0, 0));
      vecA.set(
        (pa.x - pb.x) * 0.3 + noise(e, 7) * 0.7,
        (pa.y - pb.y) * 0.3 + noise(e, 8) * 0.7 - sway,
        (pa.z - pb.z) * 0.3 + noise(e, 9) * 0.8
      );
      curve.v2
        .copy(pb)
        .addScaledVector(vecA, 1 - settle)
        .add(vecB.set(-dx * settle, 0, 0));

      /* The connect sweep: light runs the edge as its downstream tier
         settles, so the cascade reads left to right, and drains goal-end
         first when the loop loosens. */
      const h = dead ? 0 : smooth(leadB, 0.22, 0.92);
      const headOn =
        smooth(h, 0.01, 0.06) * (1 - smooth(h, 0.93, 0.995));
      const main = MAIN_EDGE.has(e);

      /* Dead branches retract into their parent as the flow resolves —
         removed, not just dimmed. Both dead edges list the living node
         first, so shrinking the u domain pulls the strand home, and the
         collapsed zero-length segments cost nothing to keep drawing. */
      const span = dead ? 1 - smooth(resolve, 0.55, 0.92) : 1;

      curve.getPoint(0, vecA);
      edgeColorAt(0, h, headOn, dead, main, resolve, color);
      for (let k = 1; k <= SEGS; k++) {
        const u = k / SEGS;
        curve.getPoint(u * span, vecB);
        edgeColorAt(u, h, headOn, dead, main, resolve, color2);

        pArr[w] = vecA.x;
        pArr[w + 1] = vecA.y;
        pArr[w + 2] = vecA.z;
        pArr[w + 3] = vecB.x;
        pArr[w + 4] = vecB.y;
        pArr[w + 5] = vecB.z;
        cArr[w] = color.r;
        cArr[w + 1] = color.g;
        cArr[w + 2] = color.b;
        cArr[w + 3] = color2.r;
        cArr[w + 4] = color2.g;
        cArr[w + 5] = color2.b;

        vecA.copy(vecB);
        color.copy(color2);
        w += 6;
      }
    }
    posBuf.needsUpdate = true;
    colBuf.needsUpdate = true;

    /* --- pulses: launch from the entry the moment the flow connects ---
     * Trips are phase-locked to the cycle rather than free-running, so a
     * pulse always departs from the entry node, never fades in mid-path. */
    const running = smooth(resolve, 0.93, 0.995);
    const tRun = t < INTRO_END ? -1 : (t - INTRO_END) % PERIOD;
    const legs = MAIN_PATH.length - 1;

    for (let p = 0; p < PULSES; p++) {
      const tp = tRun - p * (TRIP / PULSES);
      const visible = running > 0.001 && tp >= 0;

      const trip = visible ? Math.floor(tp / TRIP) : -1;
      if (visible && prevTrip.current[p] >= 0 && trip > prevTrip.current[p]) {
        lastArrival.current = t;
      }
      prevTrip.current[p] = trip;

      // g = 0 is the head; the rest are its trail.
      for (let g = 0; g <= TRAIL; g++) {
        const ghost =
          g === 0 ? pulses.current[p] : trails.current[p * TRAIL + g - 1];
        if (!ghost) continue;
        const mat = ghost.material as THREE.MeshBasicMaterial;
        const u = visible ? (tp / TRIP) % 1 : -1;
        const ug = u - g * 0.038;
        if (ug < 0) {
          mat.opacity = 0;
          continue;
        }
        const scaled = ug * legs;
        const leg = Math.min(Math.floor(scaled), legs - 1);
        curves[LEG_EDGES[leg]].getPoint(scaled - leg, vecA);
        ghost.position.copy(vecA);
        // Fade at both ends so nothing pops at the boundary.
        const edge = smooth(ug, 0, 0.07) * (1 - smooth(ug, 0.92, 1));
        mat.opacity = running * edge * (g === 0 ? 1 : 0.42 - g * 0.09);
        ghost.scale.setScalar(
          (0.72 + edge * 0.28) * (g === 0 ? 1 : 1 - g * 0.16)
        );
      }
    }

    // --- goal ripple: the arrival made visible ---
    const ring = ripple.current;
    if (ring) {
      const mat = ring.material as THREE.MeshBasicMaterial;
      if (running > 0.001 && sinceArrival < 1.05) {
        const k = sinceArrival / 1.05;
        ring.position.copy(live[11]);
        ring.scale.setScalar(0.25 + k * 1.45);
        mat.opacity = (1 - smooth(k, 0, 1)) * 0.7;
      } else {
        mat.opacity = 0;
      }
    }
  };

  useEffect(() => {
    // Reduced motion holds the connected flow — the point of the scene.
    apply(reduced ? INTRO_END + 0.01 : 0, 1 / 60);
  });

  useFrame((state, delta) => {
    if (reduced) return;
    const { pointer, raycaster, camera } = state;

    const seen = pointerSeen.current;
    if (!seen) {
      pointerSeen.current = [pointer.x, pointer.y];
    } else if (
      !cursorOn.current &&
      (pointer.x !== seen[0] || pointer.y !== seen[1])
    ) {
      cursorOn.current = true;
    }
    if (cursorOn.current && rig.current) {
      /* Project the pointer onto the flow's plane. The rig tilts a few
         degrees with the pointer, so plane z=0 is an approximation — well
         inside the shove radius. */
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(POINTER_PLANE, vecC)) {
        cursor.current.copy(rig.current.worldToLocal(vecC));
      }
    }

    // Clamp dt: a background tab returning would otherwise snap the springs.
    apply(state.clock.elapsedTime, Math.min(delta, 0.05));
  });

  return (
    <group ref={rig}>
      <primitive object={lineObj} />

      {/* Octahedra rather than slabs: the web-design hero owns panels. */}
      <instancedMesh
        ref={nodes}
        args={[undefined, undefined, NODES.length]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading roughness={0.45} metalness={0.25} />
      </instancedMesh>

      {Array.from({ length: PULSES }, (_, p) => (
        <mesh
          key={`pulse-${p}`}
          ref={(el) => {
            pulses.current[p] = el;
          }}
        >
          <sphereGeometry args={[0.075, 10, 10]} />
          <meshBasicMaterial
            color={S.paper}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      {Array.from({ length: PULSES * TRAIL }, (_, i) => (
        <mesh
          key={`trail-${i}`}
          ref={(el) => {
            trails.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial
            color={S.accent}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      <mesh ref={ripple}>
        <ringGeometry args={[0.72, 0.86, 48]} />
        <meshBasicMaterial
          color={S.accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
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
