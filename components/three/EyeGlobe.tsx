"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EyeGlobeProps {
  scanning?: boolean;
  gradCamOn?: boolean;
  activeFindingPos?: { x: number; y: number; z: number } | null;
  hoveredFindingId?: string | null;
  reducedMotion?: boolean;
}

/**
 * Dotted eye globe — cobe/landing-page style reskinned as eye.
 * Points via Fibonacci sphere for even coverage, pupil void, iris density bands.
 * Instanced via THREE.Points (buffer geometry) — not thousands of meshes.
 */
export default function EyeGlobe({
  scanning,
  gradCamOn,
  activeFindingPos,
  reducedMotion,
}: EyeGlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Generate dot field once
  const { positions, colors, count } = useMemo(() => generateEyeDots(), []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  // Slow continuous rotation — ambient idle, never fully stops
  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08; // slower than wireframe (0.12) — reference pace
      // subtle nod to keep it alive, not busy
      groupRef.current.rotation.x = Math.sin(performance.now() * 0.00009) * 0.035;
    }
    // gentle twinkle: modulate point opacity via material (done via uniform in frame)
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.opacity = gradCamOn ? 0.92 : 0.88;
    }
  });

  return (
    <group ref={groupRef} scale={[1, 0.92, 1]}>
      {/* Dotted sphere */}
      <points ref={pointsRef} geometry={geo}>
        <pointsMaterial
          size={0.038}
          vertexColors
          transparent
          opacity={gradCamOn ? 0.92 : 0.88}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Pupil — solid dark void at center-front (0,0,+R) */}
      <mesh position={[0, 0, 1.81]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#050607" transparent opacity={0.98} side={THREE.DoubleSide} />
      </mesh>
      {/* Pupil inner shadow/iris ring — faint cyan inner rim to sell depth */}
      <mesh position={[0, 0, 1.815]}>
        <ringGeometry args={[0.42, 0.52, 32]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
      {/* Pupil highlight */}
      <mesh position={[0.12, 0.14, 1.825]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.32} />
      </mesh>

      {/* Scan plane — thin cyan plane sweeping vertically through dotted globe (kept for processing state) */}
      {scanning && <ScanPlane reducedMotion={reducedMotion} />}

      {/* Glowing markers — one per XAIFinding */}
      {activeFindingPos && <FindingMarker position={activeFindingPos} reducedMotion={reducedMotion} active />}

      {/* Ambient faint radiating lines toward sphere — static, low opacity background detail */}
      <AmbientRays />

      {/* Hover-triggered surface pulse arc — short traced arc near active marker */}
      {activeFindingPos && !reducedMotion && <PulseArc center={activeFindingPos} />}

      {/* Grad-CAM global intensity — faint shell when ON */}
      {gradCamOn && (
        <mesh scale={1.02}>
          <sphereGeometry args={[1.8, 24, 24]} />
          <meshBasicMaterial color="#22D3EE" transparent opacity={0.035} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

function ScanPlane({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (reducedMotion || !ref.current) return;
    const t = clock.getElapsedTime();
    const phase = (t % 1.6) / 1.6;
    const y = THREE.MathUtils.lerp(-2.1, 2.1, phase < 0.5 ? phase * 2 : (1 - phase) * 2);
    ref.current.position.y = y;
  });
  if (reducedMotion) {
    return (
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4.0, 0.02]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.85} />
      </mesh>
    );
  }
  return (
    <mesh ref={ref}>
      <planeGeometry args={[4.2, 0.05]} />
      <meshBasicMaterial color="#22D3EE" transparent opacity={0.9} />
    </mesh>
  );
}

function FindingMarker({
  position,
  reducedMotion,
  active,
}: {
  position: { x: number; y: number; z: number };
  reducedMotion?: boolean;
  active?: boolean;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (reducedMotion || !coreRef.current) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 4.2) * 0.16;
    coreRef.current.scale.set(s, s, s);
  });
  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.98} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.2} wireframe />
      </mesh>
      <mesh>
        <circleGeometry args={[0.21, 24]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.11} side={THREE.DoubleSide} />
      </mesh>
      {/* Extra outer pulse — only when active/hovered */}
      {active && !reducedMotion && (
        <mesh>
          <ringGeometry args={[0.18, 0.19, 24]} />
          <meshBasicMaterial color="#22D3EE" transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function AmbientRays() {
  // 3 faint straight lines from off-screen toward sphere center — ambient panel-to-sphere language
  const rays = useMemo(
    () => [
      { from: new THREE.Vector3(-3.2, 1.1, 0.2), to: new THREE.Vector3(-0.9, 0.4, 0.8) },
      { from: new THREE.Vector3(3.0, 0.9, -0.1), to: new THREE.Vector3(0.85, 0.35, 0.75) },
      { from: new THREE.Vector3(-2.8, -1.2, 0.3), to: new THREE.Vector3(-0.7, -0.5, 0.9) },
    ],
    [],
  );
  return (
    <group>
      {rays.map((r, i) => {
        const pts = [r.from, r.to];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#22D3EE", transparent: true, opacity: 0.08 }))} />
        );
      })}
    </group>
  );
}

function PulseArc({ center }: { center: { x: number; y: number; z: number } }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 1.1) % 1;
    ref.current.rotation.z = t * Math.PI * 0.6;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.18 * (1 - t);
  });
  // Short arc segment near marker — small curved line tracing sphere surface
  return (
    <group position={[center.x, center.y, center.z]}>
      <mesh ref={ref} rotation={[0.6, 0.3, 0]}>
        <ringGeometry args={[0.26, 0.28, 16, 1, 0, Math.PI * 0.9]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Dot generation — Fibonacci sphere + ocular density modulation
// ---------------------------------------------------------------------------
function generateEyeDots(): { positions: Float32Array; colors: Float32Array; count: number } {
  const R = 1.8;
  const N_BASE = 3200;
  const PUPIL_ANGLE = (15 * Math.PI) / 180; // void cone half-angle
  const pupilDir = new THREE.Vector3(0, 0, 1).normalize(); // facing camera

  const pts: number[] = [];
  const cols: number[] = [];

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  const cyan = new THREE.Color("#22D3EE");
  const cyanDim = new THREE.Color("#0E3A42");
  const cyanMid = new THREE.Color("#1A6A7A");

  for (let i = 0; i < N_BASE; i++) {
    const y = 1 - (i / (N_BASE - 1)) * 2; // -1..1
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    const dir = new THREE.Vector3(x, y, z).normalize();
    const angleToPupil = Math.acos(THREE.MathUtils.clamp(dir.dot(pupilDir), -1, 1));

    // Pupil void — no dots inside central disk
    if (angleToPupil < PUPIL_ANGLE) continue;

    // Density modulation: denser just outside pupil (iris), thinning toward back
    // annulus 15°–38°: keep all; 38°–120°: keep with falloff; backside sparsely kept but still present
    let keepProb = 1;
    const deg = (angleToPupil * 180) / Math.PI;
    if (deg < 38) {
      keepProb = 1;
      // striation bands: 3 subtle density bands in iris (22°,28°,34°) — skip some points in troughs
      const band0 = Math.abs(deg - 22) < 1.5;
      const band1 = Math.abs(deg - 28) < 1.2;
      const band2 = Math.abs(deg - 34) < 1.5;
      if (!(band0 || band1 || band2)) {
        // inter-band: 78% keep for faint striation
        if (hash01(i * 1.7) > 0.78) continue;
      }
    } else if (deg < 90) {
      keepProb = THREE.MathUtils.lerp(1, 0.55, (deg - 38) / 52);
      if (hash01(i * 2.3) > keepProb) continue;
    } else {
      // backside/sclera — sparse
      keepProb = THREE.MathUtils.lerp(0.55, 0.18, (deg - 90) / 90);
      if (hash01(i * 3.1) > keepProb) continue;
    }

    // Irregular jitter for organic iris feel — small radial perturbation
    const jitter = (hash01(i * 0.9) - 0.5) * 0.02;
    const rr = R + jitter;

    // Azimuth striation jitter — slight radial displacement by angle
    const azimuth = Math.atan2(dir.y, dir.x);
    const striation = Math.sin(azimuth * 18 + deg * 0.4) * 0.008;
    const rFinal = rr + striation;

    const px = dir.x * rFinal;
    const py = dir.y * rFinal;
    const pz = dir.z * rFinal;

    pts.push(px, py, pz);

    // Color variation: iris ring brighter cyan, sclera dimmer
    let c: THREE.Color;
    if (deg < 26) c = cyan;
    else if (deg < 38) c = cyanMid;
    else if (deg < 80) c = cyanDim.clone().lerp(cyan, 0.35);
    else c = cyanDim.clone().lerp(cyan, 0.18);
    // slight random luminance variation for texture
    const lum = 0.92 + (hash01(i * 1.1) - 0.5) * 0.18;
    c.multiplyScalar(lum);
    cols.push(c.r, c.g, c.b);
  }

  // Add extra iris-ring points for denser striated band
  const EXTRA = 700;
  for (let i = 0; i < EXTRA; i++) {
    // polar angle in iris annulus 16–35°
    const t = hash01(i * 4.7);
    const angle = THREE.MathUtils.lerp(PUPIL_ANGLE + 0.02, (35 * Math.PI) / 180, Math.pow(t, 0.7));
    const az = hash01(i * 5.3) * Math.PI * 2;
    // striation: bias toward radial lines — snap azimuth slightly
    const snappedAz = az + Math.sin(az * 20) * 0.04;
    const dir = new THREE.Vector3(
      Math.sin(angle) * Math.cos(snappedAz),
      Math.sin(angle) * Math.sin(snappedAz),
      Math.cos(angle),
    );
    // rotate so "north" is up — pupilDir is +Z, so dir already centered on +Z
    const rr = R + (hash01(i * 2.9) - 0.5) * 0.015;
    pts.push(dir.x * rr, dir.y * rr, dir.z * rr);
    const c = cyan.clone().multiplyScalar(0.95 + (hash01(i * 1.3) - 0.5) * 0.2);
    cols.push(c.r, c.g, c.b);
  }

  return {
    positions: new Float32Array(pts),
    colors: new Float32Array(cols),
    count: pts.length / 3,
  };
}

function hash01(n: number): number {
  // fast deterministic pseudo-random 0..1
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
