import React from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';

export const StructuralSkeleton3D: React.FC = () => {
  const renderingMode = useSimulationStore(state => state.renderingMode);
  const isEngineeringMode = useSimulationStore(state => state.isEngineeringMode);
  const bridge = useSimulationStore(state => state.bridge);

  if (renderingMode !== 'HYBRID' && renderingMode !== 'WIREFRAME' && !isEngineeringMode) {
    return null;
  }

  // Key centerline structural joint nodes
  const jointNodes = [
    { id: 'jn-abut-w', pos: [-24, 4.2, 0], label: 'Abutment W' },
    { id: 'jn-p1-top', pos: [-18, 4.2, 0], label: 'Joint P1' },
    { id: 'jn-p1-bot', pos: [-18, -3.8, 0], label: 'Base P1' },
    { id: 'jn-p2-top', pos: [-6, 4.2, 0], label: 'Joint P2' },
    { id: 'jn-p2-bot', pos: [-6, -3.8, 0], label: 'Base P2' },
    { id: 'jn-p3-top', pos: [6, 4.2, 0], label: 'Joint P3' },
    { id: 'jn-p3-bot', pos: [6, -3.8, 0], label: 'Base P3' },
    { id: 'jn-p4-top', pos: [18, 4.2, 0], label: 'Joint P4' },
    { id: 'jn-p4-bot', pos: [18, -3.8, 0], label: 'Base P4' },
    { id: 'jn-abut-e', pos: [24, 4.2, 0], label: 'Abutment E' },
    { id: 'jn-pylon-top', pos: [6, 12.0, 0], label: 'Pylon Apex' },
  ];

  // Skeletal member line connections
  const skeletalMembers: { start: [number, number, number]; end: [number, number, number]; color: string }[] = [
    // Deck longitudinal spine
    { start: [-24, 4.2, 0], end: [24, 4.2, 0], color: '#00f2fe' },
    // Pier columns
    { start: [-18, 4.2, 0], end: [-18, -3.8, 0], color: '#38bdf8' },
    { start: [-6, 4.2, 0], end: [-6, -3.8, 0], color: '#38bdf8' },
    { start: [6, 4.2, 0], end: [6, -3.8, 0], color: '#38bdf8' },
    { start: [18, 4.2, 0], end: [18, -3.8, 0], color: '#38bdf8' },
    // Pylon & stay anchors
    { start: [6, 4.2, 0], end: [6, 12.0, 0], color: '#a855f7' },
    { start: [6, 12.0, 0], end: [-2, 4.2, 0], color: '#f59e0b' },
    { start: [6, 12.0, 0], end: [14, 4.2, 0], color: '#f59e0b' },
  ];

  return (
    <group name="structural-skeleton">
      {/* Skeletal Centerline Tubes */}
      {skeletalMembers.map((sm, idx) => {
        const p1 = new THREE.Vector3(...sm.start);
        const p2 = new THREE.Vector3(...sm.end);
        const curve = new THREE.LineCurve3(p1, p2);
        const geo = new THREE.TubeGeometry(curve, 8, 0.045, 6, false);

        return (
          <mesh key={idx} geometry={geo}>
            <meshBasicMaterial color={sm.color} transparent opacity={0.75} />
          </mesh>
        );
      })}

      {/* Spherical Joint Nodes */}
      {jointNodes.map((jn) => (
        <mesh key={jn.id} position={jn.pos as [number, number, number]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial
            color="#00f2fe"
            emissive="#00f2fe"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};
