"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface CognisCubeProps {
  idleSpeed?: number;
  emissiveIntensity?: number;
  insideFactor?: number;
  visible?: boolean;
}

export function CognisCube({
  idleSpeed = 0.09, // Controlled, slow, premium rotation
  emissiveIntensity = 2.4,
  insideFactor = 0,
  visible = true,
}: CognisCubeProps) {
  const { scene } = useGLTF("/models/cube.glb");
  const rotationGroupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Clone and customize the mesh to avoid mutating cached GLTF
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child: THREE.Object3D) => {
      if ((child as THREE.Mesh).isMesh) {
        const targetMesh = child as THREE.Mesh;
        targetMesh.castShadow = false;
        targetMesh.receiveShadow = false;

        // Controlled material with glowing wireframe in the same hero orange (#D8663D)
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#D8663D"),
          emissive: new THREE.Color("#E05A2B"),
          emissiveIntensity: emissiveIntensity,
          roughness: 0.15,
          metalness: 0.10,
          wireframe: false, // The GLB geometry itself has the wireframe lattice structure
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.98,
        });

        targetMesh.material = material;
        materialRef.current = material;
      }
    });

    return clone;
  }, [scene, emissiveIntensity]);

  // Rotate strictly around the bottom tip (Y-axis at [0, 0, 0])
  // Dynamically soften the wireframe lines during the inside phase so text is crisp and unhindered
  useFrame((_, delta) => {
    if (rotationGroupRef.current) {
      rotationGroupRef.current.rotation.y += delta * idleSpeed;
    }

    if (materialRef.current) {
      const mat = materialRef.current;
      // When insideFactor = 1 (inside entity), soften emissive and drop opacity
      const targetEmissive = THREE.MathUtils.lerp(emissiveIntensity, 0.35, insideFactor);
      const targetOpacity = THREE.MathUtils.lerp(0.96, 0.18, insideFactor);
      mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, targetEmissive, 5.0, delta);
      mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 5.0, delta);
    }
  });

  return (
    <group name="CubePivot" visible={visible}>
      {/* Subtle floor contact glow in the same hero orange */}
      <pointLight position={[0, 0.05, 0]} color="#D8663D" intensity={0.9} distance={1.4} />

      {/* CubeRotation: continuous idle tip rotation */}
      <group ref={rotationGroupRef} name="CubeRotation">
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

useGLTF.preload("/models/cube.glb");
