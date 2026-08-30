import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface CrackGeometry3DProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  crackSeverity: number; // 0 to 100
  type?: 'pier' | 'deck' | 'cap';
}

/**
 * Procedural 3D branching crack network.
 * Grows organically in length, width, depth, and secondary branch density
 * as crackSeverity increases from 0 to 100%.
 */
export const CrackGeometry3D: React.FC<CrackGeometry3DProps> = ({
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  crackSeverity,
  type = 'pier',
}) => {
  const meshRef = React.useRef<THREE.Group>(null);

  // Animate subtle fracture stress pulsation
  useFrame(({ clock }) => {
    if (meshRef.current && crackSeverity > 50) {
      const pulse = 1.0 + Math.sin(clock.getElapsedTime() * 4) * 0.05 * (crackSeverity / 100);
      meshRef.current.scale.set(scale[0] * pulse, scale[1] * pulse, scale[2] * pulse);
    }
  });

  // Generate branching crack segments based on severity
  const { lineSegments, ribbonGeometry, spallMeshes } = useMemo(() => {
    if (crackSeverity <= 2) {
      return { lineSegments: [], ribbonGeometry: null, spallMeshes: [] };
    }

    const normSev = crackSeverity / 100;
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    const spalls: { pos: [number, number, number]; size: number }[] = [];

    // Main primary fracture spine
    const spinePoints: THREE.Vector3[] = [];
    const numPoints = 14;
    const maxProgressionIndex = Math.ceil(numPoints * normSev);

    let currX = -0.6;
    let currY = -1.8;
    let currZ = 0.92; // slightly offset from surface

    if (type === 'deck') {
      currX = -2.5;
      currY = 0.28;
      currZ = 0.0;
    }

    for (let i = 0; i <= maxProgressionIndex; i++) {
      const t = i / numPoints;
      // Controlled jitter for natural jagged brittle fracture
      const jitterX = (Math.sin(i * 3.7) * 0.12) + (t * 0.8);
      const jitterY = (Math.cos(i * 2.3) * 0.15) + (t * 3.4);
      const pt = type === 'deck' 
        ? new THREE.Vector3(currX + t * 4.8, currY, (Math.sin(i * 4.1) * 0.4))
        : new THREE.Vector3(currX + jitterX, currY + jitterY, currZ + (Math.sin(i * 5) * 0.04));
      
      spinePoints.push(pt);
    }

    for (let i = 0; i < spinePoints.length - 1; i++) {
      lines.push([spinePoints[i], spinePoints[i + 1]]);

      // Generate secondary branches at >35% severity
      if (normSev > 0.35 && i % 3 === 1) {
        const branchStart = spinePoints[i];
        const branchLength = (normSev - 0.3) * 1.2;
        const branchEnd = new THREE.Vector3(
          branchStart.x + (i % 2 === 0 ? 0.35 : -0.35) * branchLength,
          branchStart.y + 0.3 * branchLength,
          branchStart.z + 0.02
        );
        lines.push([branchStart, branchEnd]);

        // Tertiary branchlets at >65% severity
        if (normSev > 0.65) {
          const subBranchEnd = new THREE.Vector3(
            branchEnd.x + (i % 2 === 0 ? 0.25 : -0.25),
            branchEnd.y + 0.2,
            branchEnd.z
          );
          lines.push([branchEnd, subBranchEnd]);
        }
      }

      // Spalling concrete chips at >55% severity
      if (normSev > 0.55 && i % 2 === 0) {
        spalls.push({
          pos: [spinePoints[i].x + Math.sin(i * 1.9) * 0.05, spinePoints[i].y, spinePoints[i].z + 0.02],
          size: 0.06 * normSev,
        });
      }
    }

    // Create 3D tube/ribbon geometry for depth & thickness
    let ribbon: THREE.BufferGeometry | null = null;
    if (spinePoints.length > 1) {
      const curve = new THREE.CatmullRomCurve3(spinePoints);
      const tubeRadius = Math.max(0.015, 0.05 * normSev);
      ribbon = new THREE.TubeGeometry(curve, 32, tubeRadius, 6, false);
    }

    return { lineSegments: lines, ribbonGeometry: ribbon, spallMeshes: spalls };
  }, [crackSeverity, type]);

  if (crackSeverity <= 2) return null;

  // Fracture color: shifts from dark grey hairline -> bright warning orange -> critical glowing crimson
  const crackColor = crackSeverity > 75 
    ? '#ef4444' 
    : crackSeverity > 45 
      ? '#f97316' 
      : '#1c1917';

  const emissiveColor = crackSeverity > 60 ? '#ef4444' : '#000000';
  const emissiveIntensity = crackSeverity > 75 ? 0.9 : crackSeverity > 50 ? 0.4 : 0.0;

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {/* Main 3D volumetric fracture tube */}
      {ribbonGeometry && (
        <mesh geometry={ribbonGeometry}>
          <meshStandardMaterial
            color={crackColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Branching fine wireframe fractures */}
      {lineSegments.length > 0 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={lineSegments.length * 2}
              array={new Float32Array(lineSegments.flatMap(([s, e]) => [s.x, s.y, s.z, e.x, e.y, e.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={crackColor} />
        </lineSegments>
      )}

      {/* Spalled concrete fragments */}
      {spallMeshes.map((spall, idx) => (
        <mesh key={`spall-${idx}`} position={spall.pos}>
          <dodecahedronGeometry args={[spall.size, 0]} />
          <meshStandardMaterial color="#475569" roughness={0.95} />
        </mesh>
      ))}

      {/* Warning glowing indicator ring at fracture epicenter if critical */}
      {crackSeverity > 70 && (
        <mesh position={[0, 0, 0.98]}>
          <ringGeometry args={[0.25, 0.32, 24]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
