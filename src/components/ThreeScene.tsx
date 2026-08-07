"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* Low-poly lighthouse in the site's night palette: navy-slate rock and
   tower, warm gold beam and lantern (from the brand reference art), paper
   starfield. All motion derives from two shared clocks — the beam rig's
   rotation and the lantern pulse — so light, halo and beams never drift
   apart. */

const C = {
  tower: "#2c3347",
  towerDark: "#1b202c",
  rock: "#1d2330",
  rockDark: "#141924",
  roof: "#161a25",
  beam: "#eec27c",
  beamCore: "#ffe2a6",
  lantern: "#ffedc0",
  glow: "#ffd9a0",
  ring: "#c9a86a",
  star: "#f2efe8",
  water: "#3d4a63",
} as const;

/** Alpha gradient along the beam: hot at the lantern, gone at the tip. */
function makeBeamTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.25, "rgba(255,255,255,0.5)");
  g.addColorStop(0.65, "rgba(255,255,255,0.12)");
  g.addColorStop(0.88, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Soft radial halo for the lantern. */
function makeHaloTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,244,214,0.9)");
  g.addColorStop(0.25, "rgba(255,217,160,0.5)");
  g.addColorStop(0.6, "rgba(230,180,110,0.14)");
  g.addColorStop(1, "rgba(230,180,110,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* Hand-placed rock cluster: overlapping low-poly chunks so the tower
   visibly rests on something solid. */
const ROCKS: {
  p: [number, number, number];
  s: [number, number, number];
  r: [number, number, number];
  c: string;
}[] = [
  { p: [0, -0.18, 0], s: [1.2, 0.52, 1.05], r: [0.2, 0.4, 0.1], c: C.rock },
  { p: [-0.6, -0.34, 0.28], s: [0.62, 0.4, 0.58], r: [0.5, 1.2, 0.3], c: C.rockDark },
  { p: [0.62, -0.38, 0.12], s: [0.68, 0.44, 0.62], r: [0.1, 2.1, 0.4], c: C.rockDark },
  { p: [0.18, -0.42, 0.6], s: [0.52, 0.3, 0.48], r: [0.8, 0.3, 0.2], c: C.rock },
  { p: [-0.34, -0.5, -0.38], s: [0.58, 0.36, 0.52], r: [0.3, 1.7, 0.5], c: C.rock },
  { p: [-0.15, -0.55, 0.45], s: [0.4, 0.26, 0.38], r: [1.1, 0.9, 0.6], c: C.rockDark },
];

const WATER_LINES: { p: [number, number, number]; w: number }[] = [
  { p: [-1.5, -0.62, 0.4], w: 1.6 },
  { p: [1.55, -0.72, 0.2], w: 2.1 },
  { p: [-1.1, -0.86, 0.6], w: 1.1 },
  { p: [1.0, -0.95, 0.5], w: 1.4 },
];

const LANTERN_Y = 2.42;

function Beams({ reduced }: { reduced: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const beamTex = useMemo(makeBeamTexture, []);
  const beamGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.6, 7.5, 24, 1, true);
    geo.translate(0, -3.75, 0); // apex at the lantern
    return geo;
  }, []);
  const coreGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.2, 5.5, 16, 1, true);
    geo.translate(0, -2.75, 0);
    return geo;
  }, []);

  useEffect(
    () => () => {
      beamTex.dispose();
      beamGeo.dispose();
      coreGeo.dispose();
    },
    [beamTex, beamGeo, coreGeo]
  );

  useFrame((_, delta) => {
    const g = rig.current;
    if (!g || reduced) return;
    g.rotation.y += delta * 0.22;
  });

  const beamMat = (opacity: number, color: string) => (
    <meshBasicMaterial
      color={color}
      alphaMap={beamTex}
      transparent
      opacity={opacity}
      blending={THREE.AdditiveBlending}
      side={THREE.DoubleSide}
      depthWrite={false}
    />
  );

  return (
    <group ref={rig} position={[0, LANTERN_Y, 0]} rotation={[0, 0.5, 0]}>
      {[Math.PI / 2, -Math.PI / 2].map((rz, i) => (
        <group key={i} rotation={[0, 0, rz]}>
          <mesh geometry={beamGeo} renderOrder={10}>
            {beamMat(0.3, C.beam)}
          </mesh>
          <mesh geometry={coreGeo} renderOrder={11}>
            {beamMat(0.45, C.beamCore)}
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Lantern({ reduced }: { reduced: boolean }) {
  const light = useRef<THREE.PointLight>(null);
  const halo = useRef<THREE.Sprite>(null);
  const haloTex = useMemo(makeHaloTexture, []);

  useEffect(() => () => haloTex.dispose(), [haloTex]);

  // One pulse phase drives both the light and the halo so they breathe
  // together instead of flickering independently.
  useFrame(({ clock }) => {
    if (reduced) return;
    const pulse = Math.sin(clock.elapsedTime * 1.6) * 0.5 + 0.5;
    if (light.current) light.current.intensity = 2.4 + pulse * 1.2;
    if (halo.current) {
      const mat = halo.current.material as THREE.SpriteMaterial;
      mat.opacity = 0.75 + pulse * 0.2;
      const s = 1.35 + pulse * 0.12;
      halo.current.scale.set(s, s, 1);
    }
  });

  return (
    <group position={[0, LANTERN_Y, 0]}>
      {/* glass band */}
      <mesh>
        <cylinderGeometry args={[0.17, 0.19, 0.26, 8]} />
        <meshStandardMaterial
          color="#3a3428"
          emissive={C.lantern}
          emissiveIntensity={1.7}
          flatShading
        />
      </mesh>
      {/* corner posts */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18]}>
            <boxGeometry args={[0.035, 0.28, 0.035]} />
            <meshStandardMaterial color={C.towerDark} flatShading />
          </mesh>
        );
      })}
      <pointLight
        ref={light}
        color={C.glow}
        intensity={3}
        distance={7}
        decay={1.6}
      />
      <sprite ref={halo} scale={[1.4, 1.4, 1]} renderOrder={12}>
        <spriteMaterial
          map={haloTex}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  );
}

function Tower() {
  return (
    <group>
      {/* tapered faceted shaft */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.22, 0.44, 2.2, 7]} />
        <meshStandardMaterial color={C.tower} flatShading />
      </mesh>
      {/* base collar where the tower meets the rock */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.5, 0.58, 0.22, 7]} />
        <meshStandardMaterial color={C.towerDark} flatShading />
      </mesh>
      {/* window slots */}
      {[0.95, 1.5].map((y) => (
        <mesh key={y} position={[0, y, 0.33 - (y - 0.95) * 0.045]}>
          <boxGeometry args={[0.07, 0.17, 0.03]} />
          <meshStandardMaterial
            color="#2a2416"
            emissive={C.lantern}
            emissiveIntensity={0.9}
            flatShading
          />
        </mesh>
      ))}
      {/* gallery deck + railing */}
      <mesh position={[0, 2.28, 0]}>
        <cylinderGeometry args={[0.32, 0.26, 0.09, 8]} />
        <meshStandardMaterial color={C.towerDark} flatShading />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <torusGeometry args={[0.28, 0.008, 6, 24]} />
        <meshStandardMaterial color={C.towerDark} flatShading />
      </mesh>
      {/* roof + finial */}
      <mesh position={[0, 2.72, 0]}>
        <coneGeometry args={[0.24, 0.3, 8]} />
        <meshStandardMaterial color={C.roof} flatShading />
      </mesh>
      <mesh position={[0, 2.92, 0]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial
          color={C.ring}
          emissive={C.ring}
          emissiveIntensity={0.4}
          flatShading
        />
      </mesh>
    </group>
  );
}

function Rocks() {
  return (
    <group>
      {ROCKS.map((rock, i) => (
        <mesh key={i} position={rock.p} scale={rock.s} rotation={rock.r}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={rock.c} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function WaterLines() {
  return (
    <group>
      {WATER_LINES.map((line, i) => (
        <mesh key={i} position={line.p}>
          <boxGeometry args={[line.w, 0.012, 0.012]} />
          <meshStandardMaterial color={C.water} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function Stars({ reduced }: { reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = 450;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4.5 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      array[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      array[i * 3 + 2] = -Math.abs(r * Math.cos(phi)) - 0.5;
    }
    return array;
  }, []);

  useFrame((_, delta) => {
    if (reduced || !points.current) return;
    points.current.rotation.z += delta * 0.008;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.016}
        color={C.star}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  const sway = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  // The canvas sits behind the content with pointer-events disabled,
  // so track the pointer on the window instead of via R3F events.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame(() => {
    const g = sway.current;
    if (!g || reduced) return;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.current.x * 0.1, 0.03);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.current.y * 0.04, 0.03);
  });

  return (
    <group ref={sway} position={[0.35, 0, 0]}>
      <ambientLight intensity={0.3} color="#aab4d4" />
      <directionalLight position={[3.5, 5, 4]} intensity={0.7} color="#cfd8ff" />

      {/* golden ring from the brand mark, floating behind the tower */}
      <mesh position={[0, 0.55, -1.5]}>
        <torusGeometry args={[2.45, 0.012, 8, 128]} />
        <meshBasicMaterial color={C.ring} transparent opacity={0.4} />
      </mesh>

      <Stars reduced={reduced} />

      <group position={[0, -1.45, 0]}>
        <Rocks />
        <Tower />
        <Lantern reduced={reduced} />
        <Beams reduced={reduced} />
        <WaterLines />
      </group>
    </group>
  );
}

export default function ThreeScene({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0.2, 0.35, 7.4], fov: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={reduced ? "demand" : "always"}
      >
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  );
}
