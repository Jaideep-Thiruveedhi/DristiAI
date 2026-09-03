"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import EyeGlobe from "./EyeGlobe";
import EyelidOverlay from "./EyelidOverlay";
import GridFloor from "./GridFloor";

interface RetinaSceneProps {
  scanState: "idle" | "processing" | "revealed" | "complete";
  gradCamOn?: boolean;
  focusedFindingPos?: { x: number; y: number; z: number } | null;
  hoveredFindingId?: string | null;
  onCameraProject?: (pos: THREE.Vector3 | null) => void;
  reducedMotion?: boolean;
}

function CameraRig({
  focusedPos,
  reducedMotion,
}: {
  focusedPos: { x: number; y: number; z: number } | null;
  reducedMotion?: boolean;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 6.2));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const defaultPos = new THREE.Vector3(0, 0.55, 6.2);
  const defaultLook = new THREE.Vector3(0, -0.15, 0);

  useFrame((_, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    if (reducedMotion) {
      cam.position.copy(defaultPos);
      cam.lookAt(defaultLook);
      return;
    }

    if (focusedPos) {
      const desiredPos = new THREE.Vector3(
        focusedPos.x * 0.55,
        focusedPos.y * 0.45 + 0.35,
        4.2,
      );
      const desiredLook = new THREE.Vector3(focusedPos.x, focusedPos.y, focusedPos.z);
      targetPos.current.lerp(desiredPos, Math.min(1, delta * 6));
      targetLook.current.lerp(desiredLook, Math.min(1, delta * 6));
    } else {
      targetPos.current.lerp(defaultPos, Math.min(1, delta * 2.2));
      targetLook.current.lerp(defaultLook, Math.min(1, delta * 2.2));
    }
    cam.position.copy(targetPos.current);
    cam.lookAt(targetLook.current);
  });

  return null;
}

function Projector({
  pos,
  onProject,
}: {
  pos: { x: number; y: number; z: number } | null;
  onProject: (v: THREE.Vector3 | null) => void;
}) {
  const { camera, size } = useThree();
  useFrame(() => {
    if (!pos) {
      onProject(null);
      return;
    }
    const vec = new THREE.Vector3(pos.x, pos.y, pos.z);
    vec.project(camera as THREE.Camera);
    const x = (vec.x * 0.5 + 0.5) * size.width;
    const y = (-vec.y * 0.5 + 0.5) * size.height;
    if (vec.z > 1) {
      onProject(null);
    } else {
      onProject(new THREE.Vector3(x, y, vec.z));
    }
  });
  return null;
}

export default function RetinaScene({
  scanState,
  gradCamOn,
  focusedFindingPos,
  hoveredFindingId,
  onCameraProject,
  reducedMotion,
}: RetinaSceneProps) {
  const [webGLFailed, setWebGLFailed] = useState(false);
  const [scanBlinkKey, setScanBlinkKey] = useState(0);
  const prevScanState = useRef(scanState);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as unknown;
      if (!gl) setWebGLFailed(true);
    } catch {
      setWebGLFailed(true);
    }
  }, []);

  // Scan-triggered blink: fire when entering processing
  useEffect(() => {
    if (prevScanState.current !== "processing" && scanState === "processing") {
      setScanBlinkKey((k) => k + 1);
    }
    prevScanState.current = scanState;
  }, [scanState]);

  if (webGLFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0A0B0D] p-6 text-center">
        <div className="holo-panel max-w-sm p-6">
          <p className="font-mono text-xs tracking-widest text-[#F5F6F7]">3D UNAVAILABLE</p>
          <p className="mt-2 font-mono text-xs leading-relaxed text-[#8A8D93]">
            WebGL is not available. The eye globe is supplementary — all findings remain accessible in the XAI panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0.55, 6.2], fov: 42, near: 0.1, far: 100 }}
        dpr={[1, 1.8]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0A0B0D", 1);
        }}
        style={{ background: "#0A0B0D" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <pointLight position={[4, 4, 4]} intensity={0.55} color="#22D3EE" />
          <pointLight position={[-3, -2, 2]} intensity={0.22} color="#22D3EE" />

          <CameraRig focusedPos={focusedFindingPos ?? null} reducedMotion={reducedMotion} />

          <EyeGlobe
            scanning={scanState === "processing"}
            gradCamOn={gradCamOn}
            hoveredFindingId={hoveredFindingId ?? null}
            activeFindingPos={focusedFindingPos ?? null}
            reducedMotion={reducedMotion}
          />

          <GridFloor reducedMotion={reducedMotion} />

          {onCameraProject && (
            <Projector pos={focusedFindingPos ?? null} onProject={onCameraProject} />
          )}
        </Suspense>
      </Canvas>

      {/* Eyelid overlay — screen-space, over Canvas, not inside it (reads correctly regardless of rotation) */}
      <EyelidOverlay scanBlinkKey={scanBlinkKey} reducedMotion={reducedMotion} />
    </div>
  );
}
