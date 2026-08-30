import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';
import { applyStressHeatmapToGeometry } from '../materials/StressHeatmapMaterial';
import { CrackGeometry3D } from './CrackGeometry3D';
import { MATERIALS } from '../materials/materialLibrary';
import { getRiskColorHex } from '../../utils/mathUtils';

interface BridgePierProps {
  componentId: string;
}

export const BridgePier: React.FC<BridgePierProps> = ({ componentId }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const component = useSimulationStore(state => state.bridge.components[componentId]);
  const isSelected = useSimulationStore(state => state.selectedComponentId === componentId);
  const isHovered = useSimulationStore(state => state.hoveredComponentId === componentId);
  const viewMode3D = useSimulationStore(state => state.viewMode3D);
  const renderingMode = useSimulationStore(state => state.renderingMode);
  const isEngineeringMode = useSimulationStore(state => state.isEngineeringMode);
  const deformationScale = useSimulationStore(state => state.deformationScale);
  const selectComponent = useSimulationStore(state => state.selectComponent);
  const hoverComponent = useSimulationStore(state => state.hoverComponent);

  if (!component) return null;

  const [width, height] = component.dimensions;
  const radius = width / 2;

  const isRigidBodyActive = !component.rigidBody.isConstrained;
  const currentPos = isRigidBodyActive ? component.rigidBody.position : component.position;
  const currentRot = isRigidBodyActive ? component.rigidBody.rotation : [0, 0, 0];

  // Fluted heavy octagonal/cylindrical pier column geometry
  const baseGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(radius, radius * 1.15, height, 32, 48);
  }, [radius, height]);

  // Apply cantilever shear drift and axial shortening
  const deformedGeometry = useMemo(() => {
    const geo = baseGeometry.clone();
    const posAttr = geo.getAttribute('position');
    if (!posAttr) return geo;

    const count = posAttr.count;
    const maxDeflMeters = (component.deformationMm / 1000) * (viewMode3D === 'DEFORMATION' ? deformationScale : Math.min(10, deformationScale));
    const halfH = height / 2;

    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const z = posAttr.getZ(i);

      const hNorm = (y + halfH) / height;
      const shearDrift = maxDeflMeters * (3 * Math.pow(hNorm, 2) - 2 * Math.pow(hNorm, 3));
      const axialComp = -maxDeflMeters * 0.25 * hNorm;

      posAttr.setX(i, x + shearDrift);
      posAttr.setY(i, y + axialComp);
    }

    posAttr.needsUpdate = true;
    geo.computeVertexNormals();

    if (viewMode3D === 'STRESS') {
      applyStressHeatmapToGeometry(
        geo,
        component.stressMPa,
        component.stressMPa * 1.45,
        component.damage.crackSeverity,
        'pier'
      );
    }

    return geo;
  }, [baseGeometry, component.deformationMm, component.stressMPa, component.damage.crackSeverity, deformationScale, viewMode3D, height]);

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
    return MATERIALS.pierConcrete;
  }, [isSelected, isHovered, viewMode3D, renderingMode, component.risk]);

  const showWireframeOverlay = renderingMode === 'HYBRID' || (renderingMode === 'SOLID' && isEngineeringMode);
  const showSpallAndRebar = component.damage.corrosionPercentage > 25 || component.damage.rebarExposure;

  return (
    <group position={currentPos} rotation={currentRot as [number, number, number]}>
      {/* 1. Structural Concrete Pier Column */}
      <mesh
        ref={meshRef}
        geometry={deformedGeometry}
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
        <mesh geometry={deformedGeometry}>
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.35} />
        </mesh>
      )}

      {/* 3. Architectural Architectural Fluted Rings & Collars */}
      {viewMode3D === 'NORMAL' && renderingMode !== 'WIREFRAME' && (
        <group>
          {/* Base Splash-Zone Collar (waterline interface) */}
          <mesh position={[0, -height / 2 + 0.4, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[radius * 1.25, radius * 1.3, 0.6, 24]} />
            <meshStandardMaterial color="#2d3748" roughness={0.95} />
          </mesh>
          {/* Waterline Algae/Salt Tide Mark */}
          <mesh position={[0, -height / 2 + 0.95, 0]}>
            <cylinderGeometry args={[radius * 1.18, radius * 1.2, 0.45, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.98} />
          </mesh>
          {/* Top Column Capital Collar */}
          <mesh position={[0, height / 2 - 0.3, 0]} castShadow>
            <cylinderGeometry args={[radius * 1.2, radius * 1.05, 0.4, 24]} />
            <meshStandardMaterial color="#475569" roughness={0.8} />
          </mesh>
        </group>
      )}

      {/* 4. Physical Concrete Spalling & Exposed Steel Rebar Cage */}
      {showSpallAndRebar && (
        <group position={[0, -0.5, radius * 0.98]}>
          {/* Concrete Spall Cavity (dark irregular recessed volume) */}
          <mesh position={[0, 0, -0.05]} castShadow>
            <boxGeometry args={[1.4, 1.8, 0.2]} />
            <meshStandardMaterial color="#1c1917" roughness={0.98} />
          </mesh>

          {/* Rust Stain Bleed on Surrounding Concrete */}
          <mesh position={[0, -1.2, 0.01]}>
            <planeGeometry args={[1.8, 1.4]} />
            <meshStandardMaterial
              color="#7c2d12"
              roughness={0.95}
              transparent
              opacity={Math.min(0.85, component.damage.corrosionPercentage / 100)}
            />
          </mesh>

          {/* 3D Corrugated Steel Rebar Cage (Vertical Bars) */}
          {[-0.45, -0.15, 0.15, 0.45].map((rx, idx) => (
            <mesh key={`rebar-v-${idx}`} position={[rx, 0, 0.05]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 1.7, 8]} />
              <meshStandardMaterial color="#9a3412" metalness={0.7} roughness={0.7} />
            </mesh>
          ))}

          {/* Horizontal Tie Stirrups */}
          {[-0.6, -0.2, 0.2, 0.6].map((ry, idx) => (
            <mesh key={`rebar-h-${idx}`} position={[0, ry, 0.06]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 1.1, 8]} />
              <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )}

      {/* 5. 3D Diagonal Shear Crack Geometry */}
      {(viewMode3D === 'DAMAGE' || viewMode3D === 'NORMAL' || viewMode3D === 'STRESS') && component.damage.crackSeverity > 3 && (
        <CrackGeometry3D
          position={[0, 0, radius * 0.95]}
          crackSeverity={component.damage.crackSeverity}
          type="pier"
        />
      )}
    </group>
  );
};
