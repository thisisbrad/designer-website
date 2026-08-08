"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* Low-poly lighthouse in the site's night palette: navy-slate rock and
   tower, warm gold beam and lantern (from the brand reference art), paper
   starfield, faceted sea. All motion derives from shared clocks — the
   beam rig's rotation, the lantern pulse and the sea's swell cycle — so
   light, halo, beams and spray never drift apart. */

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
  water: "#2b3853",
} as const;

/* Beam alpha lives in a shader: a lengthwise falloff (hot at the lantern,
   gone before the tip) multiplied by a view-angle falloff that dims
   surfaces seen edge-on. The angle term is load-bearing — without it the
   cone's silhouette and open end read as bright rings whenever the sweep
   points toward or away from the camera. */
const BEAM_VERTEX = /* glsl */ `
  varying float vAlong;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vAlong = 1.0 - uv.y; // 0 at the apex/lantern, 1 at the open end
    vNormal = normalMatrix * normal;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const BEAM_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uAnglePower;

  varying float vAlong;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fade = pow(1.0 - clamp(vAlong, 0.0, 1.0), 1.55);
    float facing = pow(abs(dot(normalize(vNormal), normalize(vViewDir))), uAnglePower);
    gl_FragColor = vec4(uColor, uOpacity * fade * facing);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function makeBeamMaterial(color: string, opacity: number, anglePower: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uAnglePower: { value: anglePower },
    },
    vertexShader: BEAM_VERTEX,
    fragmentShader: BEAM_FRAGMENT,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
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

/* Faceted sea: a jittered grid displaced on the CPU each frame. Flat
   shading derives face normals in-shader from screen-space derivatives,
   so vertex normals never need recomputing. Sized/positioned so the
   front edge stays below the frustum and the far edge dissolves into
   the dark (via vertex colors) before its geometric end. */
const OCEAN = {
  width: 26,
  depth: 8,
  cols: 72,
  rows: 26,
  level: -0.62, // waterline, in lighthouse-cluster coordinates
  frontZ: 1.5,
  fadeSpan: 3.4, // distance over which the far edge fades to black
};

/* One swell per cycle rolls in from the front-left, breaks on the rocks
   and throws spray up the tower base. Timing is fractions of the cycle. */
const SWELL = {
  period: 5.4,
  hit: 0.52, // moment the swell reaches the rocks
  sx: -3.8,
  sz: 2.1,
  ix: -0.55,
  iz: 0.6,
  sigma: 0.8,
  amp: 0.15,
};

const SPRAY_COUNT = 36;
const SPRAY_ORIGIN = { x: -0.55, y: -0.5, z: 0.65 };
const SPRAY_GRAVITY = -3.6;
const SPRAY_WINDOW = 1.6; // seconds of airtime after the hit

function Ocean({ reduced }: { reduced: boolean }) {
  const sprayRef = useRef<THREE.Points>(null);

  const { geo, base, phase } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      OCEAN.width,
      OCEAN.depth,
      OCEAN.cols,
      OCEAN.rows
    );
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, OCEAN.frontZ - OCEAN.depth / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const cellX = OCEAN.width / OCEAN.cols;
    const cellZ = OCEAN.depth / OCEAN.rows;
    const farZ = OCEAN.frontZ - OCEAN.depth;
    const colors = new Float32Array(pos.count * 3);
    const phase = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      // irregular grid so the facets don't read as a lattice
      pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * cellX * 0.7);
      pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * cellZ * 0.7);
      phase[i] = Math.random() * Math.PI * 2;
      const fade = THREE.MathUtils.clamp(
        (pos.getZ(i) - farZ) / OCEAN.fadeSpan,
        0,
        1
      );
      colors[i * 3] = fade;
      colors[i * 3 + 1] = fade;
      colors[i * 3 + 2] = fade;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const base = new Float32Array(pos.array as Float32Array);
    return { geo, base, phase };
  }, []);

  const sprayState = useMemo(() => {
    const positions = new Float32Array(SPRAY_COUNT * 3);
    const velocity = new Float32Array(SPRAY_COUNT * 3);
    const delay = new Float32Array(SPRAY_COUNT);
    for (let i = 0; i < SPRAY_COUNT; i++) {
      positions[i * 3] = SPRAY_ORIGIN.x;
      positions[i * 3 + 1] = -1; // parked underwater until the hit
      positions[i * 3 + 2] = SPRAY_ORIGIN.z;
      velocity[i * 3] = 0.25 + Math.random() * 0.85; // toward the tower
      velocity[i * 3 + 1] = 1.1 + Math.random() * 1.15;
      velocity[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
      delay[i] = Math.random() * 0.22;
    }
    return { positions, velocity, delay };
  }, []);

  useEffect(
    () => () => {
      geo.dispose();
    },
    [geo]
  );

  const displace = (t: number) => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const tau = (t % SWELL.period) / SWELL.period;
    const reach = Math.min(tau / SWELL.hit, 1);
    const cx = SWELL.sx + (SWELL.ix - SWELL.sx) * reach;
    const cz = SWELL.sz + (SWELL.iz - SWELL.sz) * reach;
    const amp =
      SWELL.amp *
      THREE.MathUtils.smoothstep(tau, 0.05, 0.4) *
      (1 - THREE.MathUtils.smoothstep(tau, SWELL.hit, SWELL.hit + 0.22));
    const inv2Sig = 1 / (2 * SWELL.sigma * SWELL.sigma);
    for (let i = 0; i < phase.length; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      let y =
        Math.sin(x * 0.9 + t * 1.1 + phase[i]) * 0.035 +
        Math.sin(z * 1.7 - t * 0.8 + phase[i] * 1.7) * 0.03 +
        Math.sin(t * 1.5 + phase[i]) * 0.02;
      if (amp > 0.001) {
        const dx = x - cx;
        const dz = z - cz;
        y += amp * Math.exp(-(dx * dx + dz * dz) * inv2Sig);
      }
      arr[i * 3 + 1] = y;
    }
    pos.needsUpdate = true;
  };

  // Static (but still wavy) sea when motion is reduced.
  useEffect(() => {
    displace(0);
  }, [geo]);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    displace(t);

    const points = sprayRef.current;
    if (!points) return;
    const tau = (t % SWELL.period) / SWELL.period;
    const sprayT = (tau - SWELL.hit) * SWELL.period;
    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const { velocity, delay } = sprayState;
    const active = sprayT > 0 && sprayT < SPRAY_WINDOW;
    for (let i = 0; i < SPRAY_COUNT; i++) {
      const tt = active ? sprayT - delay[i] : -1;
      if (tt <= 0) {
        arr[i * 3] = SPRAY_ORIGIN.x;
        arr[i * 3 + 1] = -1;
        arr[i * 3 + 2] = SPRAY_ORIGIN.z;
        continue;
      }
      const y =
        SPRAY_ORIGIN.y + velocity[i * 3 + 1] * tt + 0.5 * SPRAY_GRAVITY * tt * tt;
      arr[i * 3] = SPRAY_ORIGIN.x + velocity[i * 3] * tt;
      // droplets that fall back below the surface stay hidden
      arr[i * 3 + 1] = y < -0.75 ? -1 : y;
      arr[i * 3 + 2] = SPRAY_ORIGIN.z + velocity[i * 3 + 2] * tt;
    }
    attr.needsUpdate = true;
    const mat = points.material as THREE.PointsMaterial;
    mat.opacity = active
      ? 0.85 * Math.pow(1 - sprayT / SPRAY_WINDOW, 1.4)
      : 0;
  });

  return (
    <group>
      <mesh geometry={geo} position={[0, OCEAN.level, 0]}>
        <meshStandardMaterial
          color={C.water}
          flatShading
          vertexColors
          roughness={0.55}
          metalness={0.2}
        />
      </mesh>
      {!reduced && (
        <points ref={sprayRef} frustumCulled={false} renderOrder={5}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[sprayState.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.035}
            color={C.star}
            transparent
            opacity={0}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}

const LANTERN_Y = 2.42;

function Beams({ reduced }: { reduced: boolean }) {
  const rig = useRef<THREE.Group>(null);
  // Long enough to cross the full-bleed hero; the shader fade and the CSS
  // vignette finish the beam off before its geometric tip.
  const beamGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.8, 10, 32, 1, true);
    geo.translate(0, -5, 0); // apex at the lantern
    return geo;
  }, []);
  const coreGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.3, 8, 24, 1, true);
    geo.translate(0, -4, 0);
    return geo;
  }, []);
  const beamMat = useMemo(() => makeBeamMaterial(C.beam, 0.34, 1.9), []);
  const coreMat = useMemo(() => makeBeamMaterial(C.beamCore, 0.5, 1.35), []);

  useEffect(
    () => () => {
      beamGeo.dispose();
      coreGeo.dispose();
      beamMat.dispose();
      coreMat.dispose();
    },
    [beamGeo, coreGeo, beamMat, coreMat]
  );

  useFrame((_, delta) => {
    const g = rig.current;
    if (!g || reduced) return;
    g.rotation.y += delta * 0.22;
  });

  return (
    <group ref={rig} position={[0, LANTERN_Y, 0]} rotation={[0, 0.5, 0]}>
      {[Math.PI / 2, -Math.PI / 2].map((rz, i) => (
        <group key={i} rotation={[0, 0, rz]}>
          <mesh geometry={beamGeo} material={beamMat} renderOrder={10} />
          <mesh geometry={coreGeo} material={coreMat} renderOrder={11} />
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
  const viewport = useThree((state) => state.viewport);

  // The canvas is full-bleed so the beam can sweep the entire hero; keep
  // the tower ~70% across on wide screens and centered on portrait.
  // Offsets are camera-relative (the camera sits at x = 0.2).
  const shiftX =
    0.2 +
    viewport.width * THREE.MathUtils.clamp((viewport.aspect - 1) * 0.4, 0, 0.2);

  return (
    <group position={[shiftX, 0, 0]}>
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
        <Ocean reduced={reduced} />
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
