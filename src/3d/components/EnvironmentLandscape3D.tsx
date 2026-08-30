import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';

export const EnvironmentLandscape3D: React.FC = () => {
  const renderingMode = useSimulationStore(state => state.renderingMode);

  // Shoreline Embankment Terrain (East & West riverbanks)
  const westShoreGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(35, 100, 24, 24);
    const pos = geo.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const distFromWater = 17.5 - vx;
      const height = Math.min(8.0, Math.max(0, distFromWater * 0.38 + Math.sin(vy * 0.12) * 0.7));
      pos.setZ(i, height - 4.5);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const eastShoreGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(35, 100, 24, 24);
    const pos = geo.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const distFromWater = vx + 17.5;
      const height = Math.min(8.0, Math.max(0, distFromWater * 0.38 + Math.cos(vy * 0.12) * 0.7));
      pos.setZ(i, height - 4.5);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Tree locations on west & east banks
  const treeClusters = useMemo(() => {
    const trees: { pos: [number, number, number]; scale: number }[] = [];
    
    // West Bank Trees (x: -32 to -48)
    for (let z = -40; z <= 40; z += 6) {
      if (Math.abs(z) > 4.5) { // Leave corridor for approach road
        trees.push({
          pos: [-30 - Math.abs(Math.sin(z)) * 8, 1.2 + Math.random() * 0.5, z + (Math.sin(z) * 1.5)],
          scale: 0.8 + Math.random() * 0.5,
        });
      }
    }

    // East Bank Trees (x: +32 to +48)
    for (let z = -40; z <= 40; z += 6) {
      if (Math.abs(z) > 4.5) {
        trees.push({
          pos: [30 + Math.abs(Math.cos(z)) * 8, 1.2 + Math.random() * 0.5, z + (Math.cos(z) * 1.5)],
          scale: 0.8 + Math.random() * 0.5,
        });
      }
    }

    return trees;
  }, []);

  if (renderingMode === 'WIREFRAME') return null;

  return (
    <group name="environmental-landscape">
      {/* 1. West Riverbank Embankment & Approach Roadway (x: -42) */}
      <group position={[-42, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={westShoreGeometry} receiveShadow>
          <meshStandardMaterial
            color="#2d3748"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        {/* West Approach Highway Roadway */}
        <mesh position={[0, 4.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[35, 6.6]} />
          <meshStandardMaterial color="#1e2430" roughness={0.92} />
        </mesh>
        {/* Stone Rip-Rap Shoreline Armour */}
        {[-35, -25, -15, -5, 5, 15, 25, 35].map((rz, idx) => (
          <mesh key={`riprap-w-${idx}`} position={[16.5, -0.2, rz]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1.3, 0]} />
            <meshStandardMaterial color="#475569" roughness={0.88} />
          </mesh>
        ))}
      </group>

      {/* 2. East Riverbank Embankment & Approach Roadway (x: +42) */}
      <group position={[42, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={eastShoreGeometry} receiveShadow>
          <meshStandardMaterial
            color="#2d3748"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
        {/* East Approach Highway Roadway */}
        <mesh position={[0, 4.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[35, 6.6]} />
          <meshStandardMaterial color="#1e2430" roughness={0.92} />
        </mesh>
        {/* Stone Rip-Rap Shoreline Armour */}
        {[-35, -25, -15, -5, 5, 15, 25, 35].map((rz, idx) => (
          <mesh key={`riprap-e-${idx}`} position={[-16.5, -0.2, rz]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1.3, 0]} />
            <meshStandardMaterial color="#475569" roughness={0.88} />
          </mesh>
        ))}
      </group>

      {/* 3. Riverbank Tree & Vegetation Foliage Clusters */}
      <group name="riverbank-trees">
        {treeClusters.map((t, idx) => (
          <group key={`tree-${idx}`} position={t.pos} scale={t.scale}>
            {/* Trunk */}
            <mesh position={[0, 0.8, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.28, 1.8, 6]} />
              <meshStandardMaterial color="#3e2723" roughness={0.95} />
            </mesh>
            {/* Foliage Canopy 1 */}
            <mesh position={[0, 2.2, 0]} castShadow>
              <sphereGeometry args={[1.4, 8, 8]} />
              <meshStandardMaterial color="#2d4a3e" roughness={0.85} />
            </mesh>
            {/* Foliage Canopy 2 */}
            <mesh position={[0.3, 2.8, -0.2]} castShadow>
              <sphereGeometry args={[1.1, 7, 7]} />
              <meshStandardMaterial color="#3b5e4f" roughness={0.85} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. Distant Mountain/Industrial Silhouettes in Background (Z = ±75) */}
      <group position={[0, 0, -75]}>
        {[-50, -25, 0, 25, 50].map((hx, idx) => (
          <mesh key={`hill-n-${idx}`} position={[hx, 9 + Math.sin(idx * 2) * 5, 0]}>
            <coneGeometry args={[18 + Math.abs(Math.sin(idx)) * 6, 26, 6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.98} />
          </mesh>
        ))}
      </group>

      <group position={[0, 0, 75]}>
        {[-55, -25, 5, 35, 60].map((hx, idx) => (
          <mesh key={`hill-s-${idx}`} position={[hx, 8 + Math.cos(idx * 2) * 5, 0]}>
            <coneGeometry args={[17 + Math.abs(Math.cos(idx)) * 6, 24, 6]} />
            <meshStandardMaterial color="#0f172a" roughness={0.98} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
