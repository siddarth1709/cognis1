"use client";

import React from "react";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

interface SceneEffectsProps {
  bloomIntensity?: number;
}

export function SceneEffects({ bloomIntensity = 0.65 }: SceneEffectsProps) {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        luminanceThreshold={0.16}
        luminanceSmoothing={0.70}
        intensity={bloomIntensity}
        mipmapBlur={true}
        radius={0.38}
      />
    </EffectComposer>
  );
}
