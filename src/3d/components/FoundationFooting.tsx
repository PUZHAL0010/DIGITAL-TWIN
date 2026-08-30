import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';
import { applyStressHeatmapToGeometry } from '../materials/StressHeatmapMaterial';
import { MATERIALS } from '../materials/materialLibrary';
import { getRiskColorHex } from '../../utils/mathUtils';

interface FoundationFootingProps {
  componentId: string;
}

export const FoundationFooting: React.FC<FoundationFootingProps> = ({ componentId }) => {
  const component = useSimulationStore(state => state.bridge.components[componentId]);
  const isSelected = useSimulationStore(state => state.selectedComponentId === componentId);
  const isHovered = useSimulationStore(state => state.hoveredComponentId === componentId);
  const viewMode3D = useSimulationStore(state => state.viewMode3D);
  const renderingMode = useSimulationStore(state => state.renderingMode);
  const isEngineeringMode = useSimulationStore(state => state.isEngineeringMode);
  const selectComponent = useSimulationStore(state => state.selectComponent);
  const hoverComponent = useSimulationStore(state => state.hoverComponent);

  if (!component) return null;

  const [length, height, width] = component.dimensions;
  const isRigidBodyActive = !component.rigidBody.isConstrained;
  const currentPos = isRigidBodyActive ? component.rigidBody.position : component.position;
  const currentRot = isRigidBodyActive ? component.rigidBody.rotation : [0, 0, 0];

  const geometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(length, height, width, 20, 6, 20);
    if (viewMode3D === 'STRESS') {
      applyStressHeatmapToGeometry(
        geo,
        component.stressMPa,
        component.stressMPa * 1.2,
        component.damage.crackSeverity,
        'foundation'
      );
    }
    return geo;
  }, [length, height, width, viewMode3D, component.stressMPa, component.damage.crackSeverity]);

  const material = useMemo(() => {
    if (renderingMode === 'WIREFRAME') return MATERIALS.wireframe;
    if (isSelected) return MATERIALS.selectedHighlight;
    if (isHovered) return MATERIALS.hoverHighlight;
    if (viewMode3D === 'STRESS') return MATERIALS.stressHeatmap;
    if (viewMode3D === 'RISK') {
      return new THREE.MeshStandardMaterial({
        color: getRiskColorHex(component.risk),
        roughness: 0.7,
      });
    }
    return MATERIALS.foundationConcrete;
  }, [isSelected, isHovered, viewMode3D, renderingMode, component.risk]);

  const showWireframeOverlay = renderingMode === 'HYBRID' || (renderingMode === 'SOLID' && isEngineeringMode);

  return (
    <group position={currentPos} rotation={currentRot as [number, number, number]}>
      {/* 1. Main Foundation Caisson Footing Block */}
      <mesh
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          selectComponent(componentId);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hoverComponent(componentId);
        }}
        onPointerOut={() => {
          hoverComponent(null);
        }}
      />

      {/* 2. Wireframe Overlay for Hybrid Mode */}
      {showWireframeOverlay && (
        <mesh geometry={geometry}>
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.35} />
        </mesh>
      )}

      {/* 3. Stepped Top Pedestal Collar */}
      {viewMode3D === 'NORMAL' && renderingMode !== 'WIREFRAME' && (
        <mesh position={[0, height / 2 + 0.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[length * 0.8, 0.3, width * 0.8]} />
          <meshStandardMaterial color="#384252" roughness={0.92} />
        </mesh>
      )}

      {/* 4. Deep Foundation Drilled Cast-In-Place Caisson Piles with Steel Casing Collars */}
      {[-1.8, 1.8].map((px, i) =>
        [-2.6, 2.6].map((pz, j) => (
          <group key={`${i}-${j}`} position={[px, -height / 2, pz]}>
            {/* Drilled Pile Shaft */}
            <mesh position={[0, -2.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.55, 0.55, 5.0, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.95} />
            </mesh>
            {/* Top Steel Driving Casing Ring */}
            <mesh position={[0, -0.4, 0]} castShadow>
              <cylinderGeometry args={[0.58, 0.58, 0.8, 16]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
};
