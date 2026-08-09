"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SceneCanvas, { S, useFrameShift, usePointerRig, useStaticRender } from "./SceneCanvas";

/* Analytics & CRO — a metric field under test. A grid of columns breathes
   on a rolling wave, and a highlight band sweeps across it: the cohort
   currently in the experiment. Columns inside the band lift and turn
   accent, then hand the lift back as it passes — a variant winning, then
   the next one going under test. */

const COLS = 18;
const ROWS = 9;
const COUNT = COLS * ROWS;
const SPACING = 0.34;
const WIDTH = 0.2;

/** Seconds for the test band to cross the field. */
const CYCLE = 8;

const dummy = new THREE.Object3D();
const color = new THREE.Color();
const accent = new THREE.Color(S.accent);
const slate = new THREE.Color(S.slate);

function Field({ reduced }: { reduced: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const bars = useRef<THREE.InstancedMesh>(null);
  usePointerRig(rig, { reduced, amount: 0.1, damp: 3, base: [0.5, -0.45] });

  const invalidate = useStaticRender();

  const cells = useMemo(() => {
    const out: { x: number; z: number; u: number; base: number }[] = [];
    const halfX = ((COLS - 1) * SPACING) / 2;
    const halfZ = ((ROWS - 1) * SPACING) / 2;
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        out.push({
          x: i * SPACING - halfX,
          z: j * SPACING - halfZ,
          u: i / (COLS - 1),
          // Baseline variance so the field reads as data, not a pattern.
          base: 0.22 + ((i * 13 + j * 7) % 11) / 11 * 0.4,
        });
      }
    }
    return out;
  }, []);

  // Built once — inlining this in JSX allocates a geometry every render.
  const plateEdges = useMemo(() => {
    const plate = new THREE.PlaneGeometry(
      COLS * SPACING + 0.6,
      ROWS * SPACING + 0.6
    ).rotateX(-Math.PI / 2);
    const edges = new THREE.EdgesGeometry(plate);
    plate.dispose();
    return edges;
  }, []);

  useEffect(() => () => plateEdges.dispose(), [plateEdges]);

  const apply = (t: number) => {
    const mesh = bars.current;
    if (!mesh) return;
    const tau = (t % CYCLE) / CYCLE;
    // Band sweeps left to right with a lead-in and lead-out off the edges.
    const band = tau * 1.4 - 0.2;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      // Rolling swell so the whole field is alive between tests.
      const swell =
        Math.sin(cell.x * 1.4 + t * 0.9) * 0.06 +
        Math.sin(cell.z * 1.9 - t * 0.7) * 0.05;
      // Gaussian falloff around the band centre.
      const inTest = Math.exp(-Math.pow((cell.u - band) * 6.5, 2));
      const height = Math.max(cell.base + swell + inTest * 0.85, 0.04);

      dummy.position.set(cell.x, height / 2, cell.z);
      dummy.scale.set(WIDTH, height, WIDTH);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.copy(slate).lerp(accent, Math.min(inTest * 1.15, 1));
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  useEffect(() => {
    apply(reduced ? CYCLE * 0.45 : 0);
    if (reduced) invalidate();
  });

  useFrame(({ clock }) => {
    if (reduced) return;
    apply(clock.elapsedTime);
  });

  return (
    <group ref={rig} rotation={[0.5, -0.45, 0]}>
      {/* Column heights are rewritten every frame; the mount-time bounding
          sphere would cull the field. */}
      <instancedMesh
        ref={bars}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial flatShading roughness={0.55} metalness={0.2} />
      </instancedMesh>
      {/* Baseline plate so the columns stand on something */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[COLS * SPACING + 0.6, ROWS * SPACING + 0.6]} />
        <meshBasicMaterial color={S.ink2} transparent opacity={0.85} />
      </mesh>
      <lineSegments position={[0, -0.015, 0]}>
        <primitive object={plateEdges} attach="geometry" />
        <lineBasicMaterial color={S.accent} transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

function Scene() {
  const reduced = useReducedMotion();
  const shiftX = useFrameShift(0.2);

  return (
    /* Scaled down: at 1:1 the field runs off the right edge and out the
       bottom of the hero. */
    <group position={[shiftX, -0.5, 0]} scale={0.78}>
      <ambientLight intensity={0.5} color="#aab4d4" />
      <directionalLight position={[2, 5, 4]} intensity={0.9} color="#e8ecff" />
      <pointLight position={[0, 2, 2]} intensity={10} color={S.accent} distance={9} decay={2} />
      <Field reduced={reduced} />
    </group>
  );
}

export default function TerrainScene({ className }: { className?: string }) {
  return (
    <SceneCanvas className={className} camera={[0, 0.4, 6.2]} fov={44}>
      <Scene />
    </SceneCanvas>
  );
}
