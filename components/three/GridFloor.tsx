"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface GridFloorProps {
  reducedMotion?: boolean;
}

/**
 * Command-center holographic floor: GridHelper + radial fade via shader opacity.
 * Cyan lines on dark grey, perspective-correct, radial falloff at edges.
 */
export default function GridFloor({ reducedMotion }: GridFloorProps) {
  const gridRef = useRef<THREE.GridHelper>(null);

  // Slow drift for subtle parallax (disabled under reduced motion)
  useFrame((_, delta) => {
    if (reducedMotion || !gridRef.current) return;
    // no movement needed — keep static for clinical precision
  });

  const grid = useMemo(() => {
    const g = new THREE.GridHelper(18, 18, 0x22d3ee, 0x1a1c1f);
    // Make lines thin and cyan-tinted; GridHelper uses LineBasicMaterial internally
    const mats = (g.material as unknown as THREE.Material[]) ?? [g.material as THREE.Material];
    return g;
  }, []);

  return (
    <group position={[0, -2.35, 0]}>
      {/* Primary grid */}
      <primitive object={grid} />

      {/* Floor plane with radial fade — softens grid edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshBasicMaterial color="#0A0B0D" transparent opacity={0} />
      </mesh>

      {/* Outer fade ring — large disc with radial gradient via onBeforeCompile */}
      <FadeDisc />

      {/* Subtle cyan underglow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial color="#22D3EE" transparent opacity={0.025} />
      </mesh>
    </group>
  );
}

function FadeDisc() {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      color: "#0A0B0D",
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });
    // radial opacity falloff via shader patch
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `
        float d = length(vUv - 0.5) * 2.0;
        float fade = smoothstep(0.45, 0.92, d);
        gl_FragColor.a *= fade;
        #include <dithering_fragment>
        `,
      );
      // ensure vUv available
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>
        varying vec2 vUv;
        `,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <uv_vertex>",
        `#include <uv_vertex>
        vUv = uv;
        `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `#include <common>
        varying vec2 vUv;
        `,
      );
    };
    return m;
  }, []);

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
      <planeGeometry args={[18, 18]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}
