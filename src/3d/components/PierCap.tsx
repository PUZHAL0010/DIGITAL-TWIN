import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';
import { applyStressHeatmapToGeometry } from '../materials/StressHeatmapMaterial';
import { CrackGeometry3D } from './CrackGeometry3D';
import { MATERIALS } from '../materials/materialLibrary';
import { getRiskColorHex } from '../../utils/mathUtils';

interface PierCapProps {
  componentId: string;
}

export const PierCap: React.FC<PierCapProps> = ({ componentId }) => {
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
    const geo = new THREE.BoxGeometry(length, height, width, 24, 6, 24);
    if (viewMode3D === 'STRESS') {
      applyStressHeatmapToGeometry(
        geo,
        component.stressMPa,
        component.stressMPa * 1.3,
        component.damage.crackSeverity,
        'pier_cap'
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
        roughness: 0.6,
      });
    }
    return MATERIALS.concrete;
  }, [isSelected, isHovered, viewMode3D, renderingMode, component.risk]);

  const showWireframeOverlay = renderingMode === 'HYBRID' || (renderingMode === 'SOLID' && isEngineeringMode);

  return (
    <group position={currentPos} rotation={currentRot as [number, number, number]}>
      {/* 1. Main Pier Cap Cross-Head Beam */}
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

      {/* 3. Tapered Beveled Cantilever Ends */}
      {viewMode3D === 'NORMAL' && renderingMode !== 'WIREFRAME' && (
        <group>
          {/* North Cantilever Bevel */}
          <mesh position={[0, -height / 4, width / 2 + 0.35]} castShadow receiveShadow>
            <boxGeometry args={[length - 0.2, height / 2, 0.7]} />
            <meshStandardMaterial color="#525b6a" roughness={0.88} />
          </mesh>
          {/* South Cantilever Bevel */}
          <mesh position={[0, -height / 4, -width / 2 - 0.35]} castShadow receiveShadow>
            <boxGeometry args={[length - 0.2, height / 2, 0.7]} />
            <meshStandardMaterial color="#525b6a" roughness={0.88} />
          </mesh>
        </group>
      )}

      {/* 4. Heavy Cast-Steel Pedestal Bearing Seats & Laminated Elastomeric Bearings */}
      {[-2.2, 2.2].map((bz, idx) => (
        <group key={idx} position={[0, height / 2, bz]}>
          {/* Cast Steel Pedestal Block */}
          <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.16, 1.2]} />
            <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Neoprene Laminated Elastomeric Bearing Pad */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.95, 0.12, 0.95]} />
            <meshStandardMaterial color="#090d16" roughness={0.96} />
          </mesh>
          {/* Top Steel Masonry Shim Plate */}
          <mesh position={[0, 0.30, 0]} castShadow>
            <boxGeometry args={[1.05, 0.04, 1.05]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Anchor Bolts */}
          {[-0.45, 0.45].map((ax, jdx) =>
            [-0.45, 0.45].map((az, kdx) => (
              <mesh key={`bolt-${jdx}-${kdx}`} position={[ax, 0.2, az]}>
                <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
              </mesh>
            ))
          )}
          {/* Seismic Restrainer Stopper Block */}
          <mesh position={[0, 0.25, 0.62]}>
            <boxGeometry args={[0.3, 0.25, 0.12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 5. 3D Crack Geometry */}
      {(viewMode3D === 'DAMAGE' || viewMode3D === 'NORMAL' || viewMode3D === 'STRESS') && component.damage.crackSeverity > 3 && (
        <CrackGeometry3D
          position={[0, height / 2 + 0.05, 0]}
          crackSeverity={component.damage.crackSeverity}
          type="cap"
        />
      )}
    </group>
  );
};
