"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WireframeRetinaProps {
  scanning?: boolean;
  scanProgress?: number; // 0..1 for scan plane wipe (optional)
  gradCamOn?: boolean;
  hoveredFindingId?: string | null;
  activeFindingPos?: { x: number; y: number; z: number } | null;
  reducedMotion?: boolean;
}

/**
 * Sphere wireframe + nested denser inner layer.
 * Slow idle rotation via useFrame. Minimal lighting — wireframe aesthetic.
 */
export default function WireframeRetina({
  scanning,
  gradCamOn,
  activeFindingPos,
  reducedMotion,
}: WireframeRetinaProps) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const outerGeo = useMemo(() => new THREE.SphereGeometry(1.8, 24, 24), []);
  const innerGeo = useMemo(() => new THREE.SphereGeometry(1.76, 32, 32), []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (groupRef.current) {
      // ambient idle rotation — never fully stops
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x = Math.sin(performance.now() * 0.00012) * 0.04;
    }
    // subtle counter-rotation on inner for parallax
    if (innerRef.current && !reducedMotion) {
      innerRef.current.rotation.y -= delta * 0.03;
    }
  });

  const baseOpacity = gradCamOn ? 0.55 : 0.34;
  const activeBoost = activeFindingPos ? 0.2 : 0;

  return (
    <group ref={groupRef} scale={[1, 0.88, 1]}>
      {/* Outer wireframe */}
      <mesh ref={outerRef} geometry={outerGeo}>
        <meshBasicMaterial
          color="#22D3EE"
          wireframe
          transparent
          opacity={Math.min(0.85, baseOpacity + activeBoost)}
        />
      </mesh>
      {/* Inner denser layer */}
      <mesh ref={innerRef} geometry={innerGeo}>
        <meshBasicMaterial
          color="#22D3EE"
          wireframe
          transparent
          opacity={gradCamOn ? 0.18 : 0.1}
        />
      </mesh>

      {/* Scan plane — thin cyan plane sweeping vertically through sphere */}
      {scanning && <ScanPlane reducedMotion={reducedMotion} />}

      {/* Hover marker — pulsing cyan dot at finding position */}
      {activeFindingPos && (
        <FindingMarker position={activeFindingPos} reducedMotion={reducedMotion} />
      )}

      {/* Grad-CAM global intensity — faint emissive shell when ON */}
      {gradCamOn && (
        <mesh geometry={outerGeo} scale={1.02}>
          <meshBasicMaterial
            color="#22D3EE"
            transparent
            opacity={0.06}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

function ScanPlane({ reducedMotion }: { reducedMotion?: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // sweep Y from -2.2 to +2.2 over 1.6s loop
    const phase = (t % 1.6) / 1.6;
    const y = THREE.MathUtils.lerp(-2.2, 2.2, phase < 0.5 ? phase * 2 : (1 - phase) * 2);
    ref.current.position.y = y;
  });

  if (reducedMotion) {
    // static indicator: horizontal line through center
    return (
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[4.2, 0.02]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.9} />
      </mesh>
    );
  }

  return (
    <mesh ref={ref} rotation={[0, 0, 0]}>
      <planeGeometry args={[4.4, 0.06]} />
      <meshBasicMaterial color="#22D3EE" transparent opacity={0.95} />
    </mesh>
  );
}

function FindingMarker({
  position,
  reducedMotion,
}: {
  position: { x: number; y: number; z: number };
  reducedMotion?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (reducedMotion || !ref.current) return;
    const s = 1 + Math.sin(clock.getElapsedTime() * 4.5) * 0.18;
    ref.current.scale.set(s, s, s);
  });
  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.98} />
      </mesh>
      {/* outer pulse ring */}
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.22} wireframe />
      </mesh>
      {/* glow sprite-like disc */}
      <mesh>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
