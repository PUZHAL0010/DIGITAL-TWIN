import React from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';

export const NavigationShip3D: React.FC = () => {
  const shipState = useSimulationStore(state => state.shipState);

  if (!shipState || !shipState.active) return null;

  const [posX, posY, posZ] = shipState.position;
  const heading = shipState.headingRad;

  return (
    <group position={[posX, posY, posZ]} rotation={[0, heading, 0]} name="navigation-vessel">
      {/* 1. Main Steel Hull */}
      <group position={[0, 0.4, 0]}>
        {/* Main hull body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[14.0, 1.8, 3.8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Lower Hull / Red Waterline */}
        <mesh position={[0, -0.65, 0]}>
          <boxGeometry args={[13.8, 0.5, 3.7]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.5} />
        </mesh>

        {/* Tapered Bow (Front) */}
        <mesh position={[7.6, 0.2, 0]} rotation={[0, 0, -Math.PI / 14]} castShadow>
          <boxGeometry args={[2.2, 1.4, 3.4]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 2. Navigation Bridge Superstructure (Stern / Aft) */}
      <group position={[-4.5, 2.2, 0]}>
        {/* Bridge Lower Deck */}
        <mesh castShadow>
          <boxGeometry args={[3.2, 1.8, 3.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
        {/* Bridge Wheelhouse */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[2.6, 1.0, 3.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Windows */}
        <mesh position={[0.7, 1.2, 0]}>
          <boxGeometry args={[1.3, 0.4, 3.44]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} />
        </mesh>
        {/* Radar Mast */}
        <mesh position={[0, 2.1, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.4, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.1, 0.8, 0.1]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Exhaust Funnel */}
        <mesh position={[-1.0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.45, 1.2, 12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} />
        </mesh>
      </group>

      {/* 3. Stacked Cargo Containers on Mid-Deck */}
      <group position={[1.2, 1.8, 0]}>
        {/* Container Row 1 */}
        <mesh position={[1.8, 0, 0.85]} castShadow>
          <boxGeometry args={[3.6, 1.4, 1.4]} />
          <meshStandardMaterial color="#0284c7" roughness={0.6} />
        </mesh>
        <mesh position={[1.8, 0, -0.85]} castShadow>
          <boxGeometry args={[3.6, 1.4, 1.4]} />
          <meshStandardMaterial color="#ea580c" roughness={0.6} />
        </mesh>
        <mesh position={[1.8, 1.4, 0]} castShadow>
          <boxGeometry args={[3.6, 1.4, 1.4]} />
          <meshStandardMaterial color="#16a34a" roughness={0.6} />
        </mesh>

        {/* Container Row 2 */}
        <mesh position={[-2.0, 0, 0.85]} castShadow>
          <boxGeometry args={[3.6, 1.4, 1.4]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
        <mesh position={[-2.0, 0, -0.85]} castShadow>
          <boxGeometry args={[3.6, 1.4, 1.4]} />
          <meshStandardMaterial color="#4f46e5" roughness={0.6} />
        </mesh>
        <mesh position={[-2.0, 1.4, 0]} castShadow>
          <boxGeometry args={[3.6, 1.4, 1.4]} />
          <meshStandardMaterial color="#eab308" roughness={0.6} />
        </mesh>
      </group>

      {/* 4. Dynamic Bow Wake & Stern Propeller Foam */}
      <group position={[0, -0.25, 0]}>
        {/* Bow Wave */}
        <mesh position={[8.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 2.2, 16]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
        {/* Stern Wake */}
        <mesh position={[-7.5, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 3.0, 16]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};
