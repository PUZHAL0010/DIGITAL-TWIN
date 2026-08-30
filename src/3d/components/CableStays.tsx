import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';

export const CableStays: React.FC = () => {
  const isSelected = useSimulationStore(state => state.selectedComponentId === 'cable-stay-c3');
  const isHovered = useSimulationStore(state => state.hoveredComponentId === 'cable-stay-c3');
  const viewMode3D = useSimulationStore(state => state.viewMode3D);
  const renderingMode = useSimulationStore(state => state.renderingMode);
  const collapseState = useSimulationStore(state => state.collapseState);
  const selectComponent = useSimulationStore(state => state.selectComponent);
  const hoverComponent = useSimulationStore(state => state.hoverComponent);

  const isStaySevered = collapseState.isActive && (collapseState.activeScenarioId === 'CABLE_LOSS' ? collapseState.simulationTimeSec > 0.4 : collapseState.simulationTimeSec > 1.2);
  const towerX = 6.0; // Centered above Pier P-03

  // Cable connections matching high-density cable-stay fan pattern in reference image
  const cableAnchors = useMemo(() => {
    const anchors: { id: string; start: [number, number, number]; end: [number, number, number] }[] = [];
    const deckOffsets = [-16, -13, -10, -7, -4, -1, 2, 10, 13, 16, 19, 22];
    
    deckOffsets.forEach((dx, i) => {
      const pylonY = 11.5 + (i % 6) * 1.1; // Tower attachment heights (11.5m to 17m)
      
      // North Side Cables (z = -3.2)
      anchors.push({
        id: `cable-n-${i}`,
        start: [towerX, pylonY, -3.2],
        end: [dx, 4.5, -3.1],
      });
      // South Side Cables (z = +3.2)
      anchors.push({
        id: `cable-s-${i}`,
        start: [towerX, pylonY, 3.2],
        end: [dx, 4.5, 3.1],
      });
    });
    return anchors;
  }, []);

  return (
    <group name="cable-stay-system">
      {/* 1. Central Concrete Pylon Tower above Pier P-03 */}
      <group
        position={[towerX, 10.5, 0]}
        onClick={(e) => {
          e.stopPropagation();
          selectComponent('cable-stay-c3');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hoverComponent('cable-stay-c3');
        }}
        onPointerOut={() => {
          hoverComponent(null);
        }}
      >
        {/* North Tower Column */}
        <mesh position={[0, 0, -3.3]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 14.5, 1.1]} />
          <meshStandardMaterial
            color={isSelected ? '#00f2fe' : isHovered ? '#38bdf8' : '#cbd5e1'}
            metalness={0.4}
            roughness={0.65}
            wireframe={renderingMode === 'WIREFRAME'}
          />
        </mesh>

        {/* South Tower Column */}
        <mesh position={[0, 0, 3.3]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 14.5, 1.1]} />
          <meshStandardMaterial
            color={isSelected ? '#00f2fe' : isHovered ? '#38bdf8' : '#cbd5e1'}
            metalness={0.4}
            roughness={0.65}
            wireframe={renderingMode === 'WIREFRAME'}
          />
        </mesh>

        {/* Middle Cross-Tie Beam 1 (y: 2.0) */}
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.9, 6.8]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.5}
            roughness={0.6}
            wireframe={renderingMode === 'WIREFRAME'}
          />
        </mesh>

        {/* Middle Cross-Tie Beam 2 (y: 5.5) */}
        <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.9, 6.8]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.5}
            roughness={0.6}
            wireframe={renderingMode === 'WIREFRAME'}
          />
        </mesh>

        {/* Top Heavy Concrete Crown Cap (y: 7.25) */}
        <mesh position={[0, 7.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.8, 7.8]} />
          <meshStandardMaterial
            color="#64748b"
            metalness={0.6}
            roughness={0.5}
            wireframe={renderingMode === 'WIREFRAME'}
          />
        </mesh>

        {/* Aircraft Warning Navigation Beacons */}
        <mesh position={[0, 7.8, -3.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 7.8, 3.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* 2. High-Tensile Locked-Coil Steel Stay Cables */}
      {!isStaySevered && cableAnchors.map((cable) => {
        const start = new THREE.Vector3(...cable.start);
        const end = new THREE.Vector3(...cable.end);
        const curve = new THREE.LineCurve3(start, end);
        const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.042, 6, false);

        return (
          <group key={cable.id}>
            {/* Stay Cable Line */}
            <mesh geometry={tubeGeo} castShadow>
              <meshStandardMaterial
                color={
                  isSelected
                    ? '#00f2fe'
                    : viewMode3D === 'STRESS'
                    ? '#f59e0b'
                    : '#cbd5e1'
                }
                metalness={0.85}
                roughness={0.25}
                wireframe={renderingMode === 'WIREFRAME'}
              />
            </mesh>

            {/* Deck Neoprene Damper Anchorage Boot */}
            <mesh position={cable.end} castShadow>
              <cylinderGeometry args={[0.09, 0.11, 0.35, 8]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
