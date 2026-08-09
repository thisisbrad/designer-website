"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import SceneCanvas, { S, useFrameShift, usePointerRig, useStaticRender } from "./SceneCanvas";

/* AI solutions — scattered inputs resolving into an answer. A cloud of
   particles orbits loosely, then converges onto the vertices of an
   icosahedron before dispersing again. The wireframe solid fades in only
   while the swarm is actually holding the shape, so the structure looks
   found rather than drawn. */

const COUNT = 320;
const RADIUS = 1.85;
/** Seconds for one disperse → converge → disperse cycle. */
const CYCLE = 10;

const dummy = new THREE.Object3D();
const color = new THREE.Color();
const accent = new THREE.Color(S.accent);
const paper = new THREE.Color(S.paper);
const tmp = new THREE.Vector3();

function Swarm({ reduced }: { reduced: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const points = useRef<THREE.InstancedMesh>(null);
  const shell = useRef<THREE.LineSegments>(null);
  usePointerRig(rig, { reduced, amount: 0.22 });

  const invalidate = useStaticRender();

  // Target vertices: an icosahedron's points, reused as many times as the
  // particle count needs, each with a small offset so stacked particles
  // form a cluster at the vertex rather than a single dot.
  const { loose, target, phase, speed } = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(RADIUS, 1);
    const verts = ico.attributes.position.array as Float32Array;
    const vertexCount = verts.length / 3;

    const loose = new Float32Array(COUNT * 3);
    const target = new Float32Array(COUNT * 3);
    const phase = new Float32Array(COUNT);
    const speed = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // Scattered start: a thick spherical shell.
      const r = RADIUS * (0.6 + Math.random() * 0.85);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      loose[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      loose[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      loose[i * 3 + 2] = r * Math.cos(phi);

      const v = (i % vertexCount) * 3;
      target[i * 3] = verts[v] + (Math.random() - 0.5) * 0.08;
      target[i * 3 + 1] = verts[v + 1] + (Math.random() - 0.5) * 0.08;
      target[i * 3 + 2] = verts[v + 2] + (Math.random() - 0.5) * 0.08;

      phase[i] = Math.random() * Math.PI * 2;
      speed[i] = 0.5 + Math.random() * 0.8;
    }

    ico.dispose();
    return { loose, target, phase, speed };
  }, []);

  const shellGeo = useMemo(
    () => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(RADIUS, 1)),
    []
  );

  useEffect(() => () => shellGeo.dispose(), [shellGeo]);

  const apply = (t: number) => {
    const mesh = points.current;
    if (!mesh) return;
    const smooth = THREE.MathUtils.smoothstep;
    const tau = (t % CYCLE) / CYCLE;
    // Converge, hold, release.
    const converged =
      smooth(tau, 0.12, 0.4) - smooth(tau, 0.66, 0.92);

    for (let i = 0; i < COUNT; i++) {
      // Loose particles orbit; converged ones lock to their vertex.
      const wobble = (1 - converged) * 0.28;
      const lx =
        loose[i * 3] + Math.sin(t * speed[i] * 0.5 + phase[i]) * wobble;
      const ly =
        loose[i * 3 + 1] + Math.cos(t * speed[i] * 0.42 + phase[i]) * wobble;
      const lz =
        loose[i * 3 + 2] + Math.sin(t * speed[i] * 0.37 + phase[i] * 1.7) * wobble;

      // Stagger arrival so the shape assembles rather than snapping.
      const lead = smooth(converged, (i % 40) / 90, 0.55 + (i % 40) / 90);
      tmp.set(
        THREE.MathUtils.lerp(lx, target[i * 3], lead),
        THREE.MathUtils.lerp(ly, target[i * 3 + 1], lead),
        THREE.MathUtils.lerp(lz, target[i * 3 + 2], lead)
      );

      dummy.position.copy(tmp);
      dummy.scale.setScalar(0.028 + lead * 0.022);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.copy(paper).lerp(accent, lead);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    const wire = shell.current;
    if (wire) {
      const mat = wire.material as THREE.LineBasicMaterial;
      // Only visible while the swarm is actually holding the shape.
      mat.opacity = 0.34 * Math.max(0, converged - 0.25) * 1.35;
    }
  };

  useEffect(() => {
    apply(reduced ? CYCLE * 0.5 : 0);
    if (reduced) invalidate();
  });

  useFrame(({ clock }, delta) => {
    if (reduced) return;
    apply(clock.elapsedTime);
    const g = rig.current;
    if (g) {
      g.rotation.y += delta * 0.08;
      g.rotation.z = Math.sin(clock.elapsedTime * 0.13) * 0.06;
    }
  });

  return (
    <group ref={rig}>
      {/* CPU-animated matrices: the mount-time bounding sphere would cull
          the swarm the moment it moved. */}
      <instancedMesh
        ref={points}
        args={[undefined, undefined, COUNT]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading roughness={0.4} metalness={0.3} />
      </instancedMesh>
      <lineSegments ref={shell}>
        <primitive object={shellGeo} attach="geometry" />
        <lineBasicMaterial color={S.accent} transparent opacity={0} />
      </lineSegments>
    </group>
  );
}

function Scene() {
  const reduced = useReducedMotion();
  const shiftX = useFrameShift(0.45);

  return (
    <group position={[shiftX, 0.05, 0]} scale={0.9}>
      <ambientLight intensity={0.6} color="#aab4d4" />
      <directionalLight position={[3, 3, 5]} intensity={0.7} color="#e8ecff" />
      <pointLight position={[0, 0, 0]} intensity={9} color={S.accent} distance={6} decay={2} />
      <Swarm reduced={reduced} />
    </group>
  );
}

export default function SwarmScene({ className }: { className?: string }) {
  return (
    <SceneCanvas className={className} camera={[0, 0.1, 6.8]} fov={42}>
      <Scene />
    </SceneCanvas>
  );
}
