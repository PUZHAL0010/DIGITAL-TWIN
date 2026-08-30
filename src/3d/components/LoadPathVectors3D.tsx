import React from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';

export const LoadPathVectors3D: React.FC = () => {
  const viewMode3D = useSimulationStore(state => state.viewMode3D);
  const loadPathVectors = useSimulationStore(state => state.loadPathVectors);

  if (viewMode3D !== 'LOAD_PATH') return null;

  return (
    <group name="load-path-vectors">
      {loadPathVectors.map((vec) => {
        const start = new THREE.Vector3(...vec.startPos);
        const end = new THREE.Vector3(...vec.endPos);
        const dir = new THREE.Vector3().subVectors(end, start);
        const len = dir.length();

        if (len < 0.1) return null;

        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const thickness = Math.max(0.04, Math.min(0.22, (vec.magnitudeKn / 2000) * 0.22));

        return (
          <group key={vec.id}>
            {/* 3D Force Cylinder Tube */}
            <mesh position={mid}>
              <cylinderGeometry args={[thickness, thickness, len, 12]} />
              <meshStandardMaterial
                color={vec.colorHex}
                emissive={vec.colorHex}
                emissiveIntensity={0.65}
                roughness={0.2}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Force Direction Arrow Cone at Bottom */}
            <mesh position={end} rotation={[0, 0, 0]}>
              <coneGeometry args={[thickness * 2.2, 0.45, 12]} />
              <meshStandardMaterial
                color={vec.colorHex}
                emissive={vec.colorHex}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
