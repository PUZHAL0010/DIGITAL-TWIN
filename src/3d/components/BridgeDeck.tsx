import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useSimulationStore } from '../../state/useSimulationStore';
import { applyStressHeatmapToGeometry } from '../materials/StressHeatmapMaterial';
import { CrackGeometry3D } from './CrackGeometry3D';
import { MATERIALS } from '../materials/materialLibrary';
import { getRiskColorHex } from '../../utils/mathUtils';

interface BridgeDeckProps {
  componentId: string;
}

export const BridgeDeck: React.FC<BridgeDeckProps> = ({ componentId }) => {
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

  const [spanLength, deckHeight, deckWidth] = component.dimensions;
  
  const isRigidBodyActive = !component.rigidBody.isConstrained;
  const currentPos = isRigidBodyActive ? component.rigidBody.position : component.position;
  const currentRot = isRigidBodyActive ? component.rigidBody.rotation : [0, 0, 0];

  // Base Structural Box-Girder Slab Geometry with high mesh density
  const baseGeometry = useMemo(() => {
    return new THREE.BoxGeometry(spanLength, deckHeight, deckWidth, 36, 6, 16);
  }, [spanLength, deckHeight, deckWidth]);

  // Dynamic vertex deformation based on flexural bending
  const deformedGeometry = useMemo(() => {
    const geo = baseGeometry.clone();
    const posAttr = geo.getAttribute('position');
    if (!posAttr) return geo;

    const maxDeflMeters = (component.deformationMm / 1000) * (viewMode3D === 'DEFORMATION' ? deformationScale : Math.min(10, deformationScale));

    const count = posAttr.count;
    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);

      // Parabolic Euler-Bernoulli curve
      const normX = x / (spanLength / 2);
      const bendingFactor = Math.max(0, 1.0 - (normX * normX));
      const dy = -maxDeflMeters * bendingFactor;

      posAttr.setY(i, y + dy);
    }

    posAttr.needsUpdate = true;
    geo.computeVertexNormals();

    if (viewMode3D === 'STRESS') {
      applyStressHeatmapToGeometry(
        geo,
        component.stressMPa,
        component.stressMPa * 1.35,
        component.damage.crackSeverity,
        'deck'
      );
    }

    return geo;
  }, [baseGeometry, component.deformationMm, component.stressMPa, component.damage.crackSeverity, deformationScale, viewMode3D, spanLength]);

  const material = useMemo(() => {
    if (renderingMode === 'WIREFRAME') return MATERIALS.wireframe;
    if (isSelected) return MATERIALS.selectedHighlight;
    if (isHovered) return MATERIALS.hoverHighlight;
    if (viewMode3D === 'STRESS') return MATERIALS.stressHeatmap;
    if (viewMode3D === 'RISK') {
      return new THREE.MeshStandardMaterial({
        color: getRiskColorHex(component.risk),
        roughness: 0.6,
        metalness: 0.2,
      });
    }
    return MATERIALS.concrete;
  }, [isSelected, isHovered, viewMode3D, renderingMode, component.risk]);

  const showWireframeOverlay = renderingMode === 'HYBRID' || (renderingMode === 'SOLID' && isEngineeringMode);

  return (
    <group position={currentPos} rotation={currentRot as [number, number, number]}>
      {/* 1. Main Structural Concrete Deck Slab */}
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
          <meshBasicMaterial
            color="#38bdf8"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {/* 3. Realistic Bitumen Asphalt Surface & Road Striping */}
      {viewMode3D === 'NORMAL' && renderingMode !== 'WIREFRAME' && (
        <group position={[0, deckHeight / 2 + 0.015, 0]}>
          {/* Main Asphalt Pavement */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[spanLength - 0.04, deckWidth - 0.6]} />
            <meshStandardMaterial color="#1a1f2c" roughness={0.92} metalness={0.06} />
          </mesh>

          {/* Double Solid Yellow Centerline (z = 0) */}
          <mesh position={[0, 0.005, 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[spanLength - 0.04, 0.1]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
          <mesh position={[0, 0.005, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[spanLength - 0.04, 0.1]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>

          {/* Solid White Shoulder Edge Lines (z = ±2.7m) */}
          <mesh position={[0, 0.005, 2.65]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[spanLength - 0.04, 0.12]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 0.005, -2.65]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[spanLength - 0.04, 0.12]} />
            <meshBasicMaterial color="#f8fafc" />
          </mesh>

          {/* Dashed White Lane Markings (z = ±1.4m) */}
          {[-4.5, -1.5, 1.5, 4.5].map((lx, idx) => (
            <React.Fragment key={idx}>
              <mesh position={[lx, 0.005, 1.35]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.6, 0.1]} />
                <meshBasicMaterial color="#f8fafc" />
              </mesh>
              <mesh position={[lx, 0.005, -1.35]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.6, 0.1]} />
                <meshBasicMaterial color="#f8fafc" />
              </mesh>
            </React.Fragment>
          ))}

          {/* Steel Drainage Scuppers along curbs */}
          {[-4, 0, 4].map((sx, idx) => (
            <React.Fragment key={`scupper-${idx}`}>
              <mesh position={[sx, 0.006, 2.75]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.6, 0.2]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
              </mesh>
              <mesh position={[sx, 0.006, -2.75]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.6, 0.2]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
              </mesh>
            </React.Fragment>
          ))}

          {/* Steel Expansion Joint Finger Plates at span boundaries */}
          <mesh position={[-spanLength / 2 + 0.02, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, deckWidth - 0.6]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.4} />
          </mesh>
          <mesh position={[spanLength / 2 - 0.02, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, deckWidth - 0.6]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* 4. Concrete Jersey Barriers with Top Safety Railings & Hazard Reflectors */}
      {viewMode3D === 'NORMAL' && renderingMode !== 'WIREFRAME' && (
        <group>
          {/* North Barrier (z = +deckWidth/2 - 0.2) */}
          <group position={[0, deckHeight / 2 + 0.45, deckWidth / 2 - 0.2]}>
            {/* Concrete Barrier Body */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[spanLength, 0.85, 0.35]} />
              <meshStandardMaterial color="#64748b" roughness={0.78} metalness={0.12} />
            </mesh>
            {/* Galvanized Top Handrail */}
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, spanLength, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.25} />
            </mesh>
            {/* Retroreflective Amber Hazard Markers */}
            {[-4, 0, 4].map((mx, idx) => (
              <mesh key={`ref-n-${idx}`} position={[mx, 0.15, -0.18]}>
                <boxGeometry args={[0.1, 0.15, 0.02]} />
                <meshBasicMaterial color="#f59e0b" />
              </mesh>
            ))}
          </group>

          {/* South Barrier (z = -deckWidth/2 + 0.2) */}
          <group position={[0, deckHeight / 2 + 0.45, -deckWidth / 2 + 0.2]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[spanLength, 0.85, 0.35]} />
              <meshStandardMaterial color="#64748b" roughness={0.78} metalness={0.12} />
            </mesh>
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, spanLength, 12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.25} />
            </mesh>
            {[-4, 0, 4].map((mx, idx) => (
              <mesh key={`ref-s-${idx}`} position={[mx, 0.15, 0.18]}>
                <boxGeometry args={[0.1, 0.15, 0.02]} />
                <meshBasicMaterial color="#f59e0b" />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* 5. 3D Branching Crack Geometry */}
      {(viewMode3D === 'DAMAGE' || viewMode3D === 'NORMAL' || viewMode3D === 'STRESS') && component.damage.crackSeverity > 3 && (
        <CrackGeometry3D
          position={[0, deckHeight / 2 + 0.02, 0]}
          crackSeverity={component.damage.crackSeverity}
          type="deck"
        />
      )}
    </group>
  );
};
