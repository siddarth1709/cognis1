"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { CognisCube } from "./CognisCube";
import { ParticleEntity } from "./ParticleEntity";
import { SceneEffects } from "./SceneEffects";

type ViewportTier = "mobile" | "tablet" | "desktop";

interface CognisSceneContentProps {
  scrollProgress: number; // 0.0 to 1.0 from master scroll timeline
  cursorPos: { x: number; y: number };
  tier: ViewportTier;
}

function SceneDirector({
  scrollProgress,
  cursorPos,
  tier,
}: CognisSceneContentProps) {
  const { camera } = useThree();
  const entityRootRef = useRef<THREE.Group>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  // Smooth lerped scroll progress to prevent any snapping
  const smoothProgress = useRef(0);
  const [isInsideState, setIsInsideState] = useState(false);
  const [insideFactorState, setInsideFactorState] = useState(0);

  useFrame((_, delta) => {
    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      scrollProgress,
      8.0,
      delta
    );
    const p = smoothProgress.current;

    // Responsive initial position and camera depth
    let startX = 2.4;
    let startY = -1.55;
    let targetScale = 0.95;
    let restingCamZ = 7.6;

    if (tier === "mobile") {
      startX = 0;
      startY = -1.85; // Cleanly below mobile text
      targetScale = 0.58;
      restingCamZ = 8.4;
    } else if (tier === "tablet") {
      startX = 1.5;
      startY = -1.35;
      targetScale = 0.72;
      restingCamZ = 8.0;
    }

    if (entityRootRef.current) {
      let targetX = startX;
      let targetY = startY;

      if (p <= 0.12) {
        targetX = startX;
        targetY = startY;
      } else if (p > 0.12 && p <= 0.22) {
        // Gliding to center
        const t = (p - 0.12) / 0.10;
        targetX = THREE.MathUtils.lerp(startX, 0, t);
        targetY = THREE.MathUtils.lerp(startY, -1.65, t);
      } else if (p > 0.22 && p <= 0.88) {
        // Center position while camera is inside the universe
        targetX = 0;
        targetY = -1.65;
      } else if (p > 0.88 && p <= 0.94) {
        // Returning to right side as camera pulls out
        const t = (p - 0.88) / 0.06;
        targetX = THREE.MathUtils.lerp(0, startX, t);
        targetY = THREE.MathUtils.lerp(-1.65, startY, t);
      } else {
        // Final CTA state
        targetX = startX;
        targetY = startY;
      }

      entityRootRef.current.position.x = targetX;
      entityRootRef.current.position.y = targetY;
      entityRootRef.current.scale.setScalar(targetScale);
    }

    // --- CAMERA SPATIAL PATH & FOV ---
    let camZ = restingCamZ;
    let camY = 0;
    let targetFov = 45;

    // Portal threshold: strictly inside the universe between 0.22 and 0.88
    const isInside = p >= 0.22 && p <= 0.88;
    const factor =
      THREE.MathUtils.smoothstep(p, 0.18, 0.24) *
      (1 - THREE.MathUtils.smoothstep(p, 0.86, 0.92));

    if (isInside !== isInsideState) {
      setIsInsideState(isInside);
    }
    if (Math.abs(factor - insideFactorState) > 0.01) {
      setInsideFactorState(factor);
    }

    if (p <= 0.12) {
      camZ = restingCamZ;
      camY = 0;
      targetFov = 45;
    } else if (p > 0.12 && p <= 0.22) {
      // Approach and penetrate through the front wireframe boundary
      const t = (p - 0.12) / 0.10;
      camZ = THREE.MathUtils.lerp(restingCamZ, 0.25, t);
      camY = THREE.MathUtils.lerp(0, 0.05, t);
      targetFov = THREE.MathUtils.lerp(45, 65, t);
    } else if (p > 0.22 && p <= 0.88) {
      // Immersed inside the particle universe: continuous subtle drift
      const tInside = (p - 0.22) / (0.88 - 0.22);
      camZ = THREE.MathUtils.lerp(0.25, -0.20, tInside);
      camY = THREE.MathUtils.lerp(0.05, 0.08, tInside);
      targetFov = 65;
    } else if (p > 0.88 && p <= 0.94) {
      // Pulling back out of the universe through the portal
      const t = (p - 0.88) / 0.06;
      camZ = THREE.MathUtils.lerp(-0.20, restingCamZ, t);
      camY = THREE.MathUtils.lerp(0.08, 0, t);
      targetFov = THREE.MathUtils.lerp(65, 45, t);
    } else {
      // Final CTA state
      camZ = restingCamZ;
      camY = 0;
      targetFov = 45;
    }

    camera.position.z = camZ;
    camera.position.y = camY;

    if ((camera as THREE.PerspectiveCamera).fov !== targetFov) {
      (camera as THREE.PerspectiveCamera).fov = targetFov;
      camera.updateProjectionMatrix();
    }

    // Unproject cursor to local coordinate frame of particle entity
    if (particleGroupRef.current) {
      const ndc = new THREE.Vector2(cursorPos.x, cursorPos.y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(ndc, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const hitWorld = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, hitWorld);
      const local = particleGroupRef.current.worldToLocal(hitWorld);
      cursorLocalRef.current.copy(local);
    }
  });

  const cursorLocalRef = useRef(new THREE.Vector3(999, 999, 999));

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 7.6]} fov={45} />

      {/* Subtle controlled lighting */}
      <ambientLight intensity={0.35} color="#F2EFE9" />
      <directionalLight position={[5, 8, 5]} intensity={0.7} color="#D8663D" />
      <directionalLight position={[-5, -2, -5]} intensity={0.2} color="#8C887B" />

      {/* Persistent Entity Root: Cube + Particles */}
      <group ref={entityRootRef} name="EntityRoot" position={[2.4, -1.55, 0]}>
        {/* Wireframe Cube: Completely unrendered when camera is inside the portal universe */}
        <CognisCube
          idleSpeed={0.10}
          emissiveIntensity={1.8}
          insideFactor={insideFactorState}
          visible={!isInsideState}
        />

        {/* Living Internal Particle Entity located at cube center [0, 1.70, 0] */}
        <group
          ref={particleGroupRef}
          name="ParticleEntityGroup"
          position={[0, 1.70, 0]}
        >
          <ParticleEntity
            cursorLocal={cursorLocalRef.current}
            count={tier === "mobile" ? 1800 : 3200}
            radius={0.82}
            insideFactor={insideFactorState}
          />
        </group>
      </group>

      {/* Crisp refined bloom */}
      <SceneEffects bloomIntensity={0.95} />
    </>
  );
}

interface CognisCanvasProps {
  scrollProgress: number;
}

export function CognisCanvas({ scrollProgress }: CognisCanvasProps) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [tier, setTier] = useState<ViewportTier>("desktop");

  useEffect(() => {
    const checkViewport = () => {
      const w = window.innerWidth;
      if (w < 768) {
        setTier("mobile");
      } else if (w < 1024) {
        setTier("tablet");
      } else {
        setTier("desktop");
      }
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);

    const handlePointerMove = (e: PointerEvent) => {
      // Normalized coordinates: -1 to +1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setCursorPos({ x, y });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("resize", checkViewport);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={[1, 2]} // Cap DPR at 2 for performance
        className="w-full h-full"
      >
        <SceneDirector
          scrollProgress={scrollProgress}
          cursorPos={cursorPos}
          tier={tier}
        />
      </Canvas>
    </div>
  );
}
