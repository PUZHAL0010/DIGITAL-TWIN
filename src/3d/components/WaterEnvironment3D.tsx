import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../../state/useSimulationStore';

export const WaterEnvironment3D: React.FC = () => {
  const waterMeshRef = useRef<THREE.Mesh>(null);
  const foamMeshRef = useRef<THREE.Group>(null);

  const waterConfig = useSimulationStore(state => state.waterConfig);
  const isEngineeringMode = useSimulationStore(state => state.isEngineeringMode);
  const scourDepth = waterConfig.scourExcavationDepthM;

  // Custom vertex shader logic for procedural dynamic riverbed with scour hole under Pier 3 (x: 6, z: 0)
  const riverbedGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(110, 85, 54, 54);
    const posAttr = geo.getAttribute('position');
    if (!posAttr) return geo;

    const count = posAttr.count;
    for (let i = 0; i < count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i); // In plane local coords, this maps to Z in 3D scene after rotation

      // Natural undulating riverbed bathymetry
      let zElevation = Math.sin(vx * 0.08) * Math.cos(vy * 0.08) * 0.45;

      // Scour hole excavation crater centered around Pier 3 / Footing F-03 (x: 6, y/z: 0)
      const dx = vx - 6.0;
      const dy = vy - 0.0;
      const distFromPier3 = Math.sqrt(dx * dx + dy * dy);

      if (distFromPier3 < 8.5 && scourDepth > 0) {
        // Gaussian scour excavation bowl
        const scourHole = Math.exp(-(distFromPier3 * distFromPier3) / 16.0) * scourDepth;
        zElevation -= scourHole;
      }

      posAttr.setZ(i, zElevation);
    }

    geo.computeVertexNormals();
    return geo;
  }, [scourDepth]);

  // Flow & wave animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (waterMeshRef.current) {
      // Gentle surface wave displacement modulation
      waterMeshRef.current.position.y = -0.5 + Math.sin(t * 1.6) * 0.03 + Math.cos(t * 2.4) * 0.015;
    }
  });

  // Hydraulic flow streamline arrows across the channel
  const flowVectors = useMemo(() => {
    const list: { pos: [number, number, number]; rot: [number, number, number]; len: number }[] = [];
    for (let x = -28; x <= 28; x += 8) {
      for (let z = -14; z <= 14; z += 7) {
        // Deflect flow around piers (x = -18, -6, 6, 18)
        let angleOffset = 0;
        if (Math.abs(x - 6) < 3.5 && Math.abs(z) < 3.5) {
          angleOffset = z > 0 ? 0.35 : -0.35;
        }
        list.push({
          pos: [x, -0.42, z],
          rot: [0, angleOffset, 0],
          len: 1.6,
        });
      }
    }
    return list;
  }, []);

  const showFlowVectors = isEngineeringMode || waterConfig.waterCurrentVisible;

  return (
    <group name="water-environment">
      {/* 1. Dynamic Riverbed Terrain with Scour Crater */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -4.6, 0]}
        geometry={riverbedGeometry}
        receiveShadow
      >
        <meshStandardMaterial
          color="#0c121e"
          roughness={0.96}
          metalness={0.08}
        />
      </mesh>

      {/* 2. Realistic Water Surface */}
      <mesh
        ref={waterMeshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[110, 85, 48, 48]} />
        <meshStandardMaterial
          color="#042038"
          roughness={0.08}
          metalness={0.92}
          transparent
          opacity={0.84}
        />
      </mesh>

      {/* 3. Soft Foam Contours & Pier Disturbance Rings */}
      <group ref={foamMeshRef} position={[0, -0.48, 0]}>
        {[-18, -6, 6, 18].map((px) => (
          <group key={px} position={[px, 0, 0]}>
            {/* Inner foam ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.0, 1.4, 32]} />
              <meshBasicMaterial color="#e0f2fe" transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>
            {/* Outer wake disturbance */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0.4]}>
              <ringGeometry args={[1.4, 2.0, 32]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. Hydraulic Flow Streamline Vectors (Engineering Mode) */}
      {showFlowVectors && (
        <group name="hydraulic-flow-vectors">
          {flowVectors.map((fv, idx) => (
            <group key={idx} position={fv.pos} rotation={fv.rot}>
              {/* Streamline line */}
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.02, 0.02, fv.len, 8]} />
                <meshBasicMaterial color="#00f2fe" transparent opacity={0.65} />
              </mesh>
              {/* Arrow Head */}
              <mesh position={[fv.len / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.08, 0.22, 8]} />
                <meshBasicMaterial color="#00f2fe" />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
};
