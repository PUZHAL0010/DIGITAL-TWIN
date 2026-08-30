import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';

export const DebrisSystem3D: React.FC = () => {
  const collapseState = useSimulationStore(state => state.collapseState);

  // Generate deterministic debris pieces based on the active failure
  const debrisPieces = useMemo(() => {
    if (!collapseState.isActive) return [];

    const simTime = collapseState.simulationTimeSec;
    const pieces: { id: number; pos: [number, number, number]; rot: [number, number, number]; scale: number }[] = [];

    // Up to 12 realistic concrete fragment pieces around the failure epicenter (x ~ 6)
    const baseOrigins = [
      [5.5, 3.8, 1.2],
      [6.5, 3.2, -1.0],
      [7.0, 2.5, 0.8],
      [5.8, 1.8, -0.6],
      [6.2, 0.9, 1.4],
      [6.8, -0.4, -1.2],
      [5.2, 3.5, 0.2],
      [7.2, 1.2, 0.0],
    ];

    baseOrigins.forEach((orig, idx) => {
      const dropTime = Math.max(0, simTime - idx * 0.2);
      // Downward gravity trajectory: y = y0 - 0.5 * g * t^2
      const fallDist = 0.5 * 9.81 * dropTime * dropTime;
      const currentY = Math.max(-4.3, orig[1] - fallDist);
      const isSettled = currentY <= -4.3;

      const currentX = orig[0] + (idx % 2 === 0 ? 0.3 : -0.3) * dropTime;
      const currentZ = orig[2] + (idx % 3 === 0 ? 0.4 : -0.4) * dropTime;

      pieces.push({
        id: idx,
        pos: [currentX, currentY, currentZ],
        rot: [dropTime * 1.5, dropTime * 0.8, dropTime * 2.1],
        scale: 0.15 + (idx % 4) * 0.06,
      });
    });

    return pieces;
  }, [collapseState.isActive, collapseState.simulationTimeSec]);

  if (!collapseState.isActive || debrisPieces.length === 0) return null;

  return (
    <group name="failure-debris">
      {debrisPieces.map((piece) => (
        <mesh
          key={piece.id}
          position={piece.pos}
          rotation={piece.rot}
          scale={piece.scale}
          castShadow
        >
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color="#475569"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};
