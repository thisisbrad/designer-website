"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SceneCanvas, { S, useFrameShift, usePointerRig } from "./SceneCanvas";

/* Frontend development — a structure compiling. A build front sweeps
   diagonally through a cubic lattice; cells scale up from nothing as it
   reaches them and settle into place behind it. Everything is one
   instanced mesh, so 5³ cells cost a single draw call. */

const GRID = 5;
const SPACING = 0.62;
const CELL = 0.3;
const COUNT = GRID * GRID * GRID;

/** Seconds for the build front to cross the lattice and reset. */
const CYCLE = 9;

const dummy = new THREE.Object3D();
const color = new THREE.Color();
const accent = new THREE.Color(S.accent);
const slate = new THREE.Color(S.slate);

function Lattice({ reduced }: { reduced: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const cubes = useRef<THREE.InstancedMesh>(null);
  const edges = useRef<THREE.LineSegments>(null);
  usePointerRig(rig, { reduced, amount: 0.2, base: [0.35, 0.6] });

  // Cell centres plus the diagonal coordinate that orders the build.
  const cells = useMemo(() => {
    const out: { pos: THREE.Vector3; order: number; spin: number }[] = [];
    const half = ((GRID - 1) * SPACING) / 2;
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        for (let z = 0; z < GRID; z++) {
          out.push({
            pos: new THREE.Vector3(
              x * SPACING - half,
              y * SPACING - half,
              z * SPACING - half
            ),
            // Normalised diagonal position: the front travels along x+y+z.
            order: (x + y + z) / ((GRID - 1) * 3),
            spin: ((x * 7 + y * 13 + z * 29) % 17) / 17,
          });
        }
      }
    }
    return out;
  }, []);

  // Wireframe shell drawn once around the whole lattice for scale reference.
  const shellGeo = useMemo(() => {
    const span = (GRID - 1) * SPACING + CELL;
    return new THREE.EdgesGeometry(new THREE.BoxGeometry(span, span, span));
  }, []);

  useEffect(() => () => shellGeo.dispose(), [shellGeo]);

  const apply = (t: number) => {
    const mesh = cubes.current;
    if (!mesh) return;
    const smooth = THREE.MathUtils.smoothstep;
    const tau = (t % CYCLE) / CYCLE;
    // Front runs from before the first cell to past the last, then the
    // trailing edge clears the lattice for the next pass.
    const front = tau * 1.6 - 0.3;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      // 0 → not yet built, 1 → fully placed.
      const built = smooth(front - cell.order, -0.06, 0.16);
      // Cells overshoot slightly as they land, then settle.
      const pop = Math.sin(Math.PI * smooth(front - cell.order, -0.06, 0.3));
      const scale = CELL * (built * 0.85 + pop * 0.3);

      dummy.position.copy(cell.pos);
      // Unbuilt cells drift in from outside; placed ones sit on the grid.
      const drift = 1 - built;
      dummy.position.x += drift * (cell.spin - 0.5) * 1.6;
      dummy.position.y += drift * 0.9;
      dummy.rotation.set(
        drift * cell.spin * 3.1,
        drift * cell.spin * 2.4 + t * 0.06,
        0
      );
      dummy.scale.setScalar(Math.max(scale, 0.0001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // The build front itself glows: hottest right where it's working.
      const heat = Math.exp(-Math.pow((front - cell.order) * 7, 2));
      color.copy(slate).lerp(accent, Math.min(heat * 1.1, 1));
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Shell fades up as the lattice fills so it never frames an empty box.
    const shell = edges.current;
    if (shell) {
      const mat = shell.material as THREE.LineBasicMaterial;
      mat.opacity = 0.1 + 0.22 * smooth(front, 0.1, 0.9);
    }
  };

  useEffect(() => {
    apply(reduced ? CYCLE * 0.62 : 0);
  });

  useFrame(({ clock }) => {
    if (reduced) return;
    apply(clock.elapsedTime);
    if (rig.current) rig.current.rotation.z = Math.sin(clock.elapsedTime * 0.1) * 0.04;
  });

  return (
    <group ref={rig} rotation={[0.35, 0.6, 0]}>
      {/* Matrices are rewritten on the CPU every frame, so the bounding
          sphere three computes at mount (every instance still at zero
          scale) would cull the whole mesh permanently. */}
      <instancedMesh
        ref={cubes}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial flatShading roughness={0.5} metalness={0.25} />
      </instancedMesh>
      <lineSegments ref={edges}>
        <primitive object={shellGeo} attach="geometry" />
        <lineBasicMaterial color={S.accent} transparent opacity={0.2} />
      </lineSegments>
    </group>
  );
}

function Scene() {
  const reduced = useReducedMotion();
  const shiftX = useFrameShift(0.15);

  return (
    <group position={[shiftX, 0, 0]}>
      <ambientLight intensity={0.5} color="#aab4d4" />
      <directionalLight position={[3, 4, 5]} intensity={0.85} color="#e8ecff" />
      <pointLight position={[-2.5, 2, 3]} intensity={14} color={S.accent} distance={10} decay={2} />
      <Lattice reduced={reduced} />
    </group>
  );
}

export default function LatticeScene({ className }: { className?: string }) {
  return (
    <SceneCanvas className={className} camera={[0, 0.1, 6.6]} fov={42}>
      <Scene />
    </SceneCanvas>
  );
}
