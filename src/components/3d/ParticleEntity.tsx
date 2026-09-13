"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleEntityProps {
  cursorLocal?: THREE.Vector3;
  cursorPos?: { x: number; y: number };
  count?: number;
  radius?: number;
  insideFactor?: number; // 0.0 outside, 1.0 inside universe
}

const particleVertexShader = `
  uniform float uTime;
  uniform vec3 uCursor;
  uniform float uInteractionStrength;
  uniform float uInsideFactor;
  uniform float uDisturbEnergy;

  attribute float aScale;
  attribute float aPhase;
  attribute float aDensity;
  attribute float aExpandRate;
  attribute vec3 aBasePos;
  attribute vec3 aTangent;

  varying float vHighlight;
  varying float vDensity;
  varying float vNearFade;
  varying float vExpansion;

  // Classic Perlin/Simplex 3D noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  // Divergence-free 3D Curl Noise for fluid, non-exploding internal circulation
  vec3 curl(vec3 p, float t) {
    float e = 0.07;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 pt = p + vec3(0.0, 0.0, t * 0.12);

    float n_y_plus  = snoise(pt + dy);
    float n_y_minus = snoise(pt - dy);
    float n_z_plus  = snoise(pt + dz);
    float n_z_minus = snoise(pt - dz);
    float n_x_plus  = snoise(pt + dx);
    float n_x_minus = snoise(pt - dx);

    float cx = (n_y_plus - n_y_minus) - (n_z_plus - n_z_minus);
    float cy = (n_z_plus - n_z_minus) - (n_x_plus - n_x_minus);
    float cz = (n_x_plus - n_x_minus) - (n_y_plus - n_y_minus);

    return vec3(cx, cy, cz) / (2.0 * e);
  }

  void main() {
    // Speed factor: energetic flow outside, slow majestic drift when zoomed in
    float speedFactor = mix(1.0, 0.22, smoothstep(0.05, 0.70, uInsideFactor));
    float tFlow = uTime * speedFactor;

    vec3 pos = aBasePos;

    // 1. Coherent streamline orbital flow around the sphere
    vec3 streamMotion = aTangent * (sin(tFlow * 0.35 + aPhase) * 0.06);
    pos += streamMotion;

    // 2. Tangential curl circulation: stays strictly on the spherical manifold
    vec3 c = curl(aBasePos * 1.5, tFlow * 0.25);
    vec3 n = normalize(aBasePos);
    c = c - n * dot(c, n); // Project curl tangentially so sphere volume remains perfectly spherical
    pos += c * 0.04;

    // 3. Subtle breathing pulsation
    float breathe = sin(tFlow * 0.50 + aPhase * 2.0) * 0.015;
    pos += n * breathe;

    // 4. Containment when outside the cube (r <= 0.84); expansion when inside
    float expansion = smoothstep(0.08, 0.65, uInsideFactor);
    if (expansion < 0.001) {
      float currentR = length(pos);
      if (currentR > 0.84) {
        pos = normalize(pos) * 0.83;
      }
    } else {
      pos += normalize(aBasePos) * (aExpandRate * expansion * 3.6);
      pos += curl(aBasePos * 0.8, tFlow * 0.15) * (expansion * 0.65);
    }

    // 5. Cursor subtle disturbance:
    // When hovered, particles are slightly disturbed (soft flutter / swirl).
    // NO radial hollow bubble/void push.
    // Soon, uDisturbEnergy damps back to 0, returning particles to their regular formation.
    vec3 toCursor = pos - uCursor;
    float dist = length(toCursor);
    float influenceRadius = 0.65;
    float spatialInfluence = smoothstep(influenceRadius, 0.0, dist);
    float totalDisturbance = spatialInfluence * uDisturbEnergy * uInteractionStrength;

    // Organic disturbance without radial cavity
    vec3 flutter = cross(normalize(toCursor + 0.001), normalize(aBasePos + 0.001));
    vec3 wave = aTangent * sin(uTime * 6.0 + aPhase * 3.0);
    pos += (flutter * 0.042 + wave * 0.032) * totalDisturbance;

    vHighlight = totalDisturbance;
    vExpansion = expansion;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Particle sizing: STRICTLY PRESERVED (DO NOT CHANGE PARTICLE SIZE ON HOVER)
    float baseSize = aScale * mix(14.0, 9.5, expansion);
    float rawSize = baseSize * (1.0 / max(-mvPosition.z, 0.12));
    gl_PointSize = clamp(rawSize, 1.5, mix(28.0, 18.0, expansion));

    vDensity = aDensity;
    vNearFade = smoothstep(0.20, 0.65, -mvPosition.z);
  }
`;

const particleFragmentShader = `
  uniform float uInsideFactor;

  varying float vHighlight;
  varying float vDensity;
  varying float vNearFade;
  varying float vExpansion;

  void main() {
    // Crisp circular point with bright solid core and soft outer glow
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float core = smoothstep(0.5, 0.14, dist);
    float glow = smoothstep(0.5, 0.0, dist);
    float shapeAlpha = mix(glow * 0.70, 1.0, core);

    // Color: Luminous bone particles (#EDE9DF) with warm golden accents (#D9A441 & #E05A2B)
    vec3 neutralBone = vec3(0.96, 0.94, 0.90);
    vec3 warmGold = vec3(0.92, 0.72, 0.35);    // #E3B65A
    vec3 heroOrange = vec3(0.88, 0.40, 0.20);  // #E05A2B

    // Density and phase modulate color so filaments glow in gold/orange ribbons
    vec3 baseColor = mix(neutralBone, warmGold, vDensity * 0.70);
    baseColor = mix(baseColor, heroOrange, smoothstep(0.68, 1.0, vDensity) * 0.45);

    // Gold appears as an energetic localized shimmer under cursor perturbation
    vec3 finalColor = mix(baseColor, warmGold, vHighlight * 0.5);

    // Controlled alpha: clean, distinct points without an overblown glare
    float finalAlpha = shapeAlpha * (0.42 + vDensity * 0.35 + vHighlight * 0.15) * vNearFade;

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

export function ParticleEntity({
  cursorLocal,
  count = 3200,
  radius = 0.82, // Perfectly sized inside the wireframe cube
  insideFactor = 0,
}: ParticleEntityProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Deterministic procedural generation: Full 3D spherical harmonic distribution
  const [positions, basePositions, tangents, scales, phases, densities, expandRates] = useMemo(() => {
    const totalCount = count;
    const pos = new Float32Array(totalCount * 3);
    const base = new Float32Array(totalCount * 3);
    const tang = new Float32Array(totalCount * 3);
    const sc = new Float32Array(totalCount);
    const ph = new Float32Array(totalCount);
    const dens = new Float32Array(totalCount);
    const expRate = new Float32Array(totalCount);

    let seed = 42;
    function seededRandom() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    // Swirling orbital axes for planetary streamline ribbons around the full sphere
    const streamAxes = [
      new THREE.Vector3(0.0, 1.0, 0.0).normalize(),
      new THREE.Vector3(0.7, 0.6, -0.3).normalize(),
      new THREE.Vector3(-0.5, 0.8, 0.4).normalize(),
      new THREE.Vector3(0.3, -0.8, 0.5).normalize(),
    ];

    for (let i = 0; i < totalCount; i++) {
      // FULL 3D SPHERE COORDINATES: covers from North pole (0) to South pole (PI), 360 around
      const phi = Math.acos(2.0 * seededRandom() - 1.0); // Polar angle [0, PI]
      const theta = seededRandom() * Math.PI * 2.0;       // Azimuthal angle [0, 2*PI]

      // Unit sphere direction
      const dir = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      );

      // Multi-frequency harmonic ribbon modulation creates the organic filament bands
      const harmonicRibbon =
        Math.sin(theta * 3.0 + phi * 4.0) * 0.04 +
        Math.cos(theta * 5.0 - phi * 2.5) * 0.03;

      // 75% of particles in the outer spherical shell filaments, 25% in the dense glowing core
      const isOuter = seededRandom() < 0.75;
      let r = isOuter
        ? radius * (0.80 + 0.20 * seededRandom() + harmonicRibbon)
        : radius * (0.25 + 0.52 * Math.pow(seededRandom(), 0.8));

      r = Math.min(r, radius);

      const pLocal = dir.clone().multiplyScalar(r);

      pos[i * 3 + 0] = pLocal.x;
      pos[i * 3 + 1] = pLocal.y;
      pos[i * 3 + 2] = pLocal.z;

      base[i * 3 + 0] = pLocal.x;
      base[i * 3 + 1] = pLocal.y;
      base[i * 3 + 2] = pLocal.z;

      // Select orbital stream axis
      const streamAxis = streamAxes[i % streamAxes.length];
      const tOrbit = new THREE.Vector3().crossVectors(streamAxis, dir).normalize();

      tang[i * 3 + 0] = tOrbit.x;
      tang[i * 3 + 1] = tOrbit.y;
      tang[i * 3 + 2] = tOrbit.z;

      // Delicate particle scale (fine-grained, high-density look without chunky dots)
      sc[i] = seededRandom() < 0.88 ? 0.55 + seededRandom() * 0.35 : 1.05;
      ph[i] = theta + phi;
      dens[i] = 0.5 + 0.5 * Math.sin(theta * 3.0 + phi * 2.0);
      expRate[i] = 0.5 + 2.8 * seededRandom();
    }

    return [pos, base, tang, sc, ph, dens, expRate];
  }, [count, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCursor: { value: new THREE.Vector3(999, 999, 999) },
      uInteractionStrength: { value: 1.0 },
      uInsideFactor: { value: 0 },
      uDisturbEnergy: { value: 0 },
    }),
    []
  );

  const prevCursorRef = useRef(new THREE.Vector3(999, 999, 999));
  const disturbEnergyRef = useRef(0);
  const wasNearRef = useRef(false);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uInsideFactor.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uInsideFactor.value,
        insideFactor,
        5.0,
        delta
      );

      // Smooth damped local 3D cursor position
      if (cursorLocal) {
        const cur = materialRef.current.uniforms.uCursor.value;
        cur.x += (cursorLocal.x - cur.x) * 0.25;
        cur.y += (cursorLocal.y - cur.y) * 0.25;
        cur.z += (cursorLocal.z - cur.z) * 0.25;

        // Check distance to particle cloud center [0, 0, 0]
        const distToCenter = Math.hypot(cursorLocal.x, cursorLocal.y, cursorLocal.z);
        const isNear = distToCenter < 1.15;

        if (prevCursorRef.current.x < 900) {
          const dx = cursorLocal.x - prevCursorRef.current.x;
          const dy = cursorLocal.y - prevCursorRef.current.y;
          const dz = cursorLocal.z - prevCursorRef.current.z;
          const moveDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Moving onto or through the particles stimulates disturbance
          if (isNear) {
            if (!wasNearRef.current) {
              // Mouse just entered the particle cloud: trigger gentle initial disturbance
              disturbEnergyRef.current = Math.min(1.0, disturbEnergyRef.current + 0.60);
            } else if (moveDist > 0.002) {
              // Cursor moving while hovering: disturb proportionally to movement speed
              disturbEnergyRef.current = Math.min(1.0, disturbEnergyRef.current + moveDist * 4.2);
            }
          }
        }
        wasNearRef.current = isNear;
        prevCursorRef.current.copy(cursorLocal);
      }

      // Smooth decay: disturbance soon returns to 0 (particles return to regular formation)
      disturbEnergyRef.current = THREE.MathUtils.damp(
        disturbEnergyRef.current,
        0.0,
        3.2,
        delta
      );

      materialRef.current.uniforms.uDisturbEnergy.value = disturbEnergyRef.current;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aBasePos" args={[basePositions, 3]} />
        <bufferAttribute attach="attributes-aTangent" args={[tangents, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aDensity" args={[densities, 1]} />
        <bufferAttribute attach="attributes-aExpandRate" args={[expandRates, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
