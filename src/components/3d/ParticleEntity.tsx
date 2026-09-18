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
  uniform float uInsideFactor;

  attribute float aScale;
  attribute float aPhase;
  attribute float aDensity;
  attribute float aExpandRate;
  attribute float aGlow;
  attribute vec3 aBaseDir;

  varying float vGlow;
  varying float vDensity;
  varying float vNearFade;
  varying float vExpansion;

  // Classic Perlin/Simplex 3D noise for portal expansion drift
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
    float speedFactor = mix(1.0, 0.22, smoothstep(0.05, 0.70, uInsideFactor));
    float tFlow = uTime * speedFactor;

    // Physically simulated particle position (continuous orbital circulation & fluid interaction)
    vec3 pos = position;

    // Expansion when camera penetrates inside the universe
    float expansion = smoothstep(0.08, 0.65, uInsideFactor);
    if (expansion > 0.001) {
      pos += normalize(aBaseDir) * (aExpandRate * expansion * 3.6);
      pos += curl(aBaseDir * 0.8, tFlow * 0.15) * (expansion * 0.65);
    }

    vGlow = aGlow;
    vExpansion = expansion;
    vDensity = aDensity;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Sizing: Refined bead size at rest, swelling noticeably during interaction glow
    float baseSize = aScale * mix(22.0, 15.0, expansion);
    baseSize *= (1.0 + aGlow * 0.50); // Expands up to 50% when glowing under cursor
    float rawSize = baseSize * (1.0 / max(-mvPosition.z, 0.12));
    gl_PointSize = clamp(rawSize, 2.5, mix(36.0, 22.0, expansion));

    vNearFade = smoothstep(0.20, 0.65, -mvPosition.z);
  }
`;

const particleFragmentShader = `
  uniform float uTime;
  uniform float uInsideFactor;

  varying float vGlow;
  varying float vDensity;
  varying float vNearFade;
  varying float vExpansion;

  void main() {
    // Crisp circular point with bright solid core and soft outer glow
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    float core = smoothstep(0.5, 0.12, dist);
    float halo = smoothstep(0.5, 0.0, dist);
    float shapeAlpha = mix(halo * 0.75, 1.0, core);

    // Color: Softer, muted particles before interaction
    // Duller tone so cursor disturbance creates a striking contrast when lighting up
    vec3 mutedBone = vec3(0.68, 0.65, 0.60);
    vec3 mutedGold = vec3(0.72, 0.54, 0.28);
    vec3 mutedOrange = vec3(0.68, 0.32, 0.15);

    // Subtle gentle shimmer on resting particles
    float shimmer = 0.04 * sin(uTime * 2.2 + vDensity * 6.28);
    vec3 baseColor = mix(mutedBone, mutedGold, clamp(vDensity * 0.70 + shimmer, 0.0, 1.0));
    baseColor = mix(baseColor, mutedOrange, smoothstep(0.70, 1.0, vDensity) * 0.40);

    // Individual light glow on interaction:
    // Ignites from dull resting tone into an incandescent warm-white / radiant amber aura
    vec3 radiantGlowColor = vec3(1.0, 0.96, 0.86);
    vec3 radiantGold = vec3(1.0, 0.78, 0.38);
    vec3 glowAura = mix(radiantGold, radiantGlowColor, vGlow);
    vec3 finalColor = mix(baseColor, glowAura, vGlow * 0.95);

    // Alpha: Muted resting opacity (soft & understated), surging into bright radiance during interaction
    float restingAlpha = shapeAlpha * (0.24 + vDensity * 0.18);
    float glowAlpha = (shapeAlpha * 0.50 + 0.50 * halo) * vGlow;
    float finalAlpha = (restingAlpha + glowAlpha) * vNearFade;

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
  const posAttrRef = useRef<THREE.BufferAttribute>(null);
  const glowAttrRef = useRef<THREE.BufferAttribute>(null);

  // Deterministic procedural generation: Multi-axis planetary orbital streamlines
  const {
    positions,
    baseDirs,
    rBases,
    speeds,
    phases,
    axisIndices,
    scales,
    densities,
    expandRates,
    glows,
    disps,
    dispVels,
    normalizedAxes,
  } = useMemo(() => {
    const totalCount = count;
    const pos = new Float32Array(totalCount * 3);
    const bDirs = new Float32Array(totalCount * 3);
    const rB = new Float32Array(totalCount);
    const spds = new Float32Array(totalCount);
    const ph = new Float32Array(totalCount);
    const aIndices = new Uint8Array(totalCount);
    const sc = new Float32Array(totalCount);
    const dens = new Float32Array(totalCount);
    const expRate = new Float32Array(totalCount);
    const glw = new Float32Array(totalCount);
    const dsp = new Float32Array(totalCount * 3);
    const dspV = new Float32Array(totalCount * 3);

    let seed = 42;
    function seededRandom() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    // 4 Swirling orbital axes for intertwined planetary streamline ribbons
    const rawAxes = [
      [0.0, 1.0, 0.0],
      [0.707, 0.60, -0.36],
      [-0.55, 0.78, 0.30],
      [0.32, -0.75, 0.58],
    ];
    const nAxes: [number, number, number][] = rawAxes.map((a) => {
      const len = Math.hypot(a[0], a[1], a[2]);
      return [a[0] / len, a[1] / len, a[2] / len];
    });

    for (let i = 0; i < totalCount; i++) {
      const phi = Math.acos(2.0 * seededRandom() - 1.0);
      const theta = seededRandom() * Math.PI * 2.0;

      const dirX = Math.sin(phi) * Math.cos(theta);
      const dirY = Math.cos(phi);
      const dirZ = Math.sin(phi) * Math.sin(theta);

      bDirs[i * 3 + 0] = dirX;
      bDirs[i * 3 + 1] = dirY;
      bDirs[i * 3 + 2] = dirZ;

      const harmonicRibbon =
        Math.sin(theta * 3.0 + phi * 4.0) * 0.035 +
        Math.cos(theta * 5.0 - phi * 2.5) * 0.025;

      const isOuter = seededRandom() < 0.75;
      let r = isOuter
        ? radius * (0.82 + 0.18 * seededRandom() + harmonicRibbon)
        : radius * (0.28 + 0.50 * Math.pow(seededRandom(), 0.8));

      r = Math.min(r, radius);
      rB[i] = r;

      // Initial resting position
      pos[i * 3 + 0] = dirX * r;
      pos[i * 3 + 1] = dirY * r;
      pos[i * 3 + 2] = dirZ * r;

      // Active continuous circulation speeds (smooth, lively planetary revolution)
      spds[i] = 0.38 + 0.32 * seededRandom();
      ph[i] = theta + phi * 1.5;
      aIndices[i] = i % nAxes.length;

      // Particle scale: slightly increased base distribution matching reference (Pic 2)
      sc[i] = seededRandom() < 0.88 ? 0.80 + seededRandom() * 0.40 : 1.30;
      dens[i] = 0.5 + 0.5 * Math.sin(theta * 3.0 + phi * 2.0);
      expRate[i] = 0.5 + 2.8 * seededRandom();
      glw[i] = 0.0;
    }

    return {
      positions: pos,
      baseDirs: bDirs,
      rBases: rB,
      speeds: spds,
      phases: ph,
      axisIndices: aIndices,
      scales: sc,
      densities: dens,
      expandRates: expRate,
      glows: glw,
      disps: dsp,
      dispVels: dspV,
      normalizedAxes: nAxes,
    };
  }, [count, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uInsideFactor: { value: 0 },
    }),
    []
  );

  const prevCurRef = useRef(new THREE.Vector3(999, 999, 999));
  const smoothedCurRef = useRef(new THREE.Vector3(999, 999, 999));

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05); // Cap delta for rock-solid numerical stability
    const time = state.clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uInsideFactor.value = THREE.MathUtils.damp(
        materialRef.current.uniforms.uInsideFactor.value,
        insideFactor,
        5.0,
        dt
      );
    }

    const isOutside = insideFactor < 0.2;

    if (cursorLocal) {
      if (prevCurRef.current.x > 900) {
        prevCurRef.current.copy(cursorLocal);
        smoothedCurRef.current.copy(cursorLocal);
      }
      smoothedCurRef.current.lerp(cursorLocal, 0.35);
    }

    const curX = smoothedCurRef.current.x;
    const curY = smoothedCurRef.current.y;
    const curR2 = curX * curX + curY * curY;
    const curDist = Math.sqrt(curR2);

    // Front hemisphere contact depth on visible sphere
    const curZ = Math.sqrt(Math.max(0, radius * radius - curR2));

    // Cursor velocity calculation
    let velX = 0;
    let velY = 0;
    let velZ = 0;
    let speed = 0;

    if (prevCurRef.current.x < 900 && dt > 0.0001) {
      velX = (curX - prevCurRef.current.x) / dt;
      velY = (curY - prevCurRef.current.y) / dt;
      velZ = (curZ - prevCurRef.current.z) / dt;
      speed = Math.sqrt(velX * velX + velY * velY + velZ * velZ);
      if (speed > 18.0) {
        const factor = 18.0 / speed;
        velX *= factor;
        velY *= factor;
        velZ *= factor;
        speed = 18.0;
      }
    }
    prevCurRef.current.set(curX, curY, curZ);

    const isCursorNear = isOutside && curDist < 1.25 && prevCurRef.current.x < 900;
    const R_inf = 0.58;
    const damping = Math.pow(0.87, dt * 60);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // 1. ACTIVE CONTINUOUS ORBITAL CIRCULATION:
      // Rotate baseDir around its designated streamAxis using Rodrigues' rotation formula
      const axis = normalizedAxes[axisIndices[i]];
      const ux = axis[0];
      const uy = axis[1];
      const uz = axis[2];

      const vx = baseDirs[i3];
      const vy = baseDirs[i3 + 1];
      const vz = baseDirs[i3 + 2];

      const angle = time * speeds[i] + phases[i];
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Cross product u x v
      const cx = uy * vz - uz * vy;
      const cy = uz * vx - ux * vz;
      const cz = ux * vy - uy * vx;

      // Dot product u . v
      const dot = ux * vx + uy * vy + uz * vz;
      const factor = dot * (1.0 - cosA);

      // Rotated unit direction
      const rx = vx * cosA + cx * sinA + ux * factor;
      const ry = vy * cosA + cy * sinA + uy * factor;
      const rz = vz * cosA + cz * sinA + uz * factor;

      // Living radial breathing & surface harmonic ripples
      const ripple =
        Math.sin(angle * 2.8 + time * 1.6) * 0.022 +
        Math.sin(time * 0.8 + phases[i] * 2.0) * 0.012;
      const r = rBases[i] + ripple;

      const basePx = rx * r;
      const basePy = ry * r;
      const basePz = rz * r;

      // Particle's actual position = living base formation + cursor disturbance displacement
      let px = basePx + disps[i3];
      let py = basePy + disps[i3 + 1];
      let pz = basePz + disps[i3 + 2];

      // 2. CURSOR INTERACTION FORCES:
      if (isCursorNear) {
        const pdx = px - curX;
        const pdy = py - curY;
        const pdz = pz - curZ;
        const d2 = pdx * pdx + pdy * pdy + pdz * pdz * 0.45;

        if (d2 < R_inf * R_inf) {
          const d = Math.sqrt(d2);
          let f = 1.0 - d / R_inf;
          f = f * f * (3.0 - 2.0 * f); // Smoothstep curve

          // Repulsion away from cursor
          const repel = 3.4 * f;
          const invD = 1.0 / (d + 0.03);
          let fx = pdx * invD * repel;
          let fy = pdy * invD * repel;
          let fz = pdz * invD * repel;

          // Drag / wake along cursor motion
          const wake = Math.min(speed, 6.0) * 0.40 * f;
          fx += velX * wake * 0.12;
          fy += velY * wake * 0.12;
          fz += velZ * wake * 0.12;

          // Fluid vortex swirl around cursor axis
          fx += -pdy * 3.4 * f;
          fy += pdx * 3.4 * f;
          fz += (pdx + pdy) * 1.8 * f;

          dispVels[i3] += fx * dt * 4.5;
          dispVels[i3 + 1] += fy * dt * 4.5;
          dispVels[i3 + 2] += fz * dt * 4.5;

          // Individual particle light glow excitation
          const glowImpulse = f * (0.75 + Math.min(speed, 5.0) * 0.15);
          glows[i] = Math.min(1.0, glows[i] + glowImpulse * dt * 14.0);
        }
      }

      // 3. RESTORATIVE SPRING-DAMPER ON DISPLACEMENT:
      // Smoothly returns displacement to 0 so particles seamlessly rejoin the living orbital flow
      dispVels[i3] -= disps[i3] * 4.8 * dt;
      dispVels[i3 + 1] -= disps[i3 + 1] * 4.8 * dt;
      dispVels[i3 + 2] -= disps[i3 + 2] * 4.8 * dt;

      dispVels[i3] *= damping;
      dispVels[i3 + 1] *= damping;
      dispVels[i3 + 2] *= damping;

      disps[i3] += dispVels[i3] * dt;
      disps[i3 + 1] += dispVels[i3 + 1] * dt;
      disps[i3 + 2] += dispVels[i3 + 2] * dt;

      px = basePx + disps[i3];
      py = basePy + disps[i3 + 1];
      pz = basePz + disps[i3 + 2];

      // 4. STRICT CONTAINER BOUNDARY CONSTRAINT:
      // Constrain within r <= 0.94 so particles never breach the wireframe cube walls
      const currentR = Math.sqrt(px * px + py * py + pz * pz);
      if (currentR > 0.86) {
        // Soft boundary cushion
        const push = (currentR - 0.86) * 14.0 * dt;
        px -= (px / currentR) * push;
        py -= (py / currentR) * push;
        pz -= (pz / currentR) * push;
      }
      const rAfter = Math.sqrt(px * px + py * py + pz * pz);
      if (rAfter > 0.94) {
        const s = 0.94 / rAfter;
        px *= s;
        py *= s;
        pz *= s;
        disps[i3] = px - basePx;
        disps[i3 + 1] = py - basePy;
        disps[i3 + 2] = pz - basePz;
        // Damp outward velocity
        const vRadial =
          (dispVels[i3] * px + dispVels[i3 + 1] * py + dispVels[i3 + 2] * pz) /
          (0.94 * 0.94);
        if (vRadial > 0) {
          dispVels[i3] -= vRadial * px * 1.4;
          dispVels[i3 + 1] -= vRadial * py * 1.4;
          dispVels[i3 + 2] -= vRadial * pz * 1.4;
        }
      }

      // Individual glow decays smoothly back to 0
      if (glows[i] > 0.001) {
        glows[i] = Math.max(0.0, glows[i] - dt * 1.15);
      } else {
        glows[i] = 0.0;
      }

      positions[i3] = px;
      positions[i3 + 1] = py;
      positions[i3 + 2] = pz;
    }

    if (posAttrRef.current) {
      posAttrRef.current.needsUpdate = true;
    }
    if (glowAttrRef.current) {
      glowAttrRef.current.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={posAttrRef}
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-aBaseDir" args={[baseDirs, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aDensity" args={[densities, 1]} />
        <bufferAttribute attach="attributes-aExpandRate" args={[expandRates, 1]} />
        <bufferAttribute
          ref={glowAttrRef}
          attach="attributes-aGlow"
          args={[glows, 1]}
        />
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
