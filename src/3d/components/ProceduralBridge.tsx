import React from 'react';
import { Html } from '@react-three/drei';
import { useSimulationStore } from '../../state/useSimulationStore';
import { BridgeDeck } from './BridgeDeck';
import { BridgePier } from './BridgePier';
import { PierCap } from './PierCap';
import { FoundationFooting } from './FoundationFooting';
import { CableStays } from './CableStays';
import { MovingVehicles3D } from './MovingVehicles3D';
import { LoadPathVectors3D } from './LoadPathVectors3D';
import { WaterEnvironment3D } from './WaterEnvironment3D';
import { NavigationShip3D } from './NavigationShip3D';
import { StructuralSkeleton3D } from './StructuralSkeleton3D';
import { DebrisSystem3D } from './DebrisSystem3D';
import { EnvironmentLandscape3D } from './EnvironmentLandscape3D';
import { SensorMarkers3D } from './SensorMarkers3D';

export const ProceduralBridge: React.FC = () => {
  const showDefectPins = useSimulationStore(state => state.showAnnotations);
  const renderingMode = useSimulationStore(state => state.renderingMode);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);
  const selectComponent = useSimulationStore(state => state.selectComponent);

  const girder2Comp = useSimulationStore(state => state.bridge.components['girder-g2']);
  const isGirder2Failing = girder2Comp && !girder2Comp.rigidBody.isConstrained;

  return (
    <group name="bridge-root">
      {/* 0. Surrounding Environmental Riverbank Landscape with Trees */}
      <EnvironmentLandscape3D />

      {/* 1. Deck Spans */}
      <BridgeDeck componentId="deck-span-1" />
      <BridgeDeck componentId="deck-span-2" />
      <BridgeDeck componentId="deck-span-3" />
      <BridgeDeck componentId="deck-span-4" />

      {/* 2. Support Piers / Columns */}
      <BridgePier componentId="pier-p1" />
      <BridgePier componentId="pier-p2" />
      <BridgePier componentId="pier-p3" />
      <BridgePier componentId="pier-p4" />

      {/* 3. Pier Caps */}
      <PierCap componentId="pier-cap-p2" />
      <PierCap componentId="pier-cap-p3" />

      {/* 4. Substructure Foundation Footings */}
      <FoundationFooting componentId="foundation-f2" />
      <FoundationFooting componentId="foundation-f3" />

      {/* 5. Central Cable Stay System */}
      <CableStays />

      {/* 6. Realistic I-Beam Steel Girders with Flanges, Web Stiffeners & Cross Diaphragms */}
      <group name="i-beam-girders">
        {/* North Longitudinal I-Girder (z = -2.4) */}
        <group position={[0, 3.6, -2.4]}>
          {/* Top Flange */}
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[48, 0.08, 0.65]} />
            <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.25} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          {/* Vertical Web Plate */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[48, 0.68, 0.08]} />
            <meshStandardMaterial color="#2d3748" metalness={0.85} roughness={0.3} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          {/* Bottom Flange */}
          <mesh position={[0, -0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[48, 0.08, 0.65]} />
            <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.25} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          {/* Vertical Web Stiffener Plates */}
          {[-20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20].map((sx, idx) => (
            <mesh key={`stiff-n-${idx}`} position={[sx, 0, 0]}>
              <boxGeometry args={[0.06, 0.68, 0.6]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} wireframe={renderingMode === 'WIREFRAME'} />
            </mesh>
          ))}
        </group>

        {/* South Longitudinal I-Girder (z = +2.4) */}
        <group
          position={isGirder2Failing ? girder2Comp.rigidBody.position : [0, 3.6, 2.4]}
          rotation={isGirder2Failing ? girder2Comp.rigidBody.rotation as [number, number, number] : [0, 0, 0]}
        >
          {/* Top Flange */}
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[48, 0.08, 0.65]} />
            <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.25} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          {/* Vertical Web Plate */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[48, 0.68, 0.08]} />
            <meshStandardMaterial color="#2d3748" metalness={0.85} roughness={0.3} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          {/* Bottom Flange */}
          <mesh position={[0, -0.38, 0]} castShadow receiveShadow>
            <boxGeometry args={[48, 0.08, 0.65]} />
            <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.25} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          {/* Vertical Web Stiffeners */}
          {[-20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20].map((sx, idx) => (
            <mesh key={`stiff-s-${idx}`} position={[sx, 0, 0]}>
              <boxGeometry args={[0.06, 0.68, 0.6]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} wireframe={renderingMode === 'WIREFRAME'} />
            </mesh>
          ))}
        </group>

        {/* Transverse Cross-Frame Diaphragms between Girders */}
        {[-18, -6, 6, 18].map((dx, idx) => (
          <group key={`diaphragm-${idx}`} position={[dx, 3.6, 0]}>
            <mesh position={[0, 0.28, 0]}>
              <boxGeometry args={[0.2, 0.1, 4.4]} />
              <meshStandardMaterial color="#334155" metalness={0.85} wireframe={renderingMode === 'WIREFRAME'} />
            </mesh>
            <mesh position={[0, -0.28, 0]}>
              <boxGeometry args={[0.2, 0.1, 4.4]} />
              <meshStandardMaterial color="#334155" metalness={0.85} wireframe={renderingMode === 'WIREFRAME'} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 8]}>
              <cylinderGeometry args={[0.035, 0.035, 4.5, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.9} wireframe={renderingMode === 'WIREFRAME'} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 8]}>
              <cylinderGeometry args={[0.035, 0.035, 4.5, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.9} wireframe={renderingMode === 'WIREFRAME'} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 7. Reinforced Concrete End Abutments with Wingwalls */}
      <group name="abutments">
        {/* West Abutment (x: -25) */}
        <group position={[-25, 1.8, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.2, 5.4, 7.4]} />
            <meshStandardMaterial color="#475569" roughness={0.88} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          <mesh position={[-1.2, -0.5, 4.2]} rotation={[0, Math.PI / 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 4.4, 0.6]} />
            <meshStandardMaterial color="#334155" roughness={0.9} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          <mesh position={[-1.2, -0.5, -4.2]} rotation={[0, -Math.PI / 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 4.4, 0.6]} />
            <meshStandardMaterial color="#334155" roughness={0.9} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
        </group>

        {/* East Abutment (x: +25) */}
        <group position={[25, 1.8, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.2, 5.4, 7.4]} />
            <meshStandardMaterial color="#475569" roughness={0.88} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          <mesh position={[1.2, -0.5, 4.2]} rotation={[0, -Math.PI / 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 4.4, 0.6]} />
            <meshStandardMaterial color="#334155" roughness={0.9} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
          <mesh position={[1.2, -0.5, -4.2]} rotation={[0, Math.PI / 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 4.4, 0.6]} />
            <meshStandardMaterial color="#334155" roughness={0.9} wireframe={renderingMode === 'WIREFRAME'} />
          </mesh>
        </group>
      </group>

      {/* 8. Production-Grade Water Environment with Dynamic Scour */}
      <WaterEnvironment3D />

      {/* 8b. 3D Navigation Channel Cargo Vessel / Barge */}
      <NavigationShip3D />

      {/* 9. Structural Skeleton (Centerlines & Joint Nodes) */}
      <StructuralSkeleton3D />

      {/* 10. Failure Concrete Debris System */}
      <DebrisSystem3D />

      {/* 11. Live Moving Vehicles */}
      <MovingVehicles3D />

      {/* 12. 3D Load Path Force Vectors */}
      <LoadPathVectors3D />

      {/* 12b. Interactive 3D IoT Sensor Markers */}
      <SensorMarkers3D />

      {/* 13. Anchored 3D Callout Badges Matching Reference Image */}
      {showDefectPins && !isPresentationMode && (
        <group name="anchored-callout-badges">
          {/* A. PIER P-03 Callout Badge */}
          <group position={[6.0, 3.4, 1.6]}>
            {/* Target Dot on Pier */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color="#00f2fe" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[0.14, 0.18, 16]} />
              <meshBasicMaterial color="#00f2fe" side={2} />
            </mesh>

            {/* Anchored Floating Badge */}
            <Html distanceFactor={15} position={[-2.2, 2.0, 0]} center>
              <div 
                onClick={() => selectComponent('pier-p3')}
                className="bg-[#05070A]/95 backdrop-blur-xl border border-cyan-500/60 p-2 rounded-xl shadow-2xl font-mono text-[10px] select-none text-slate-200 cursor-pointer hover:border-cyan-400 min-w-[130px] space-y-0.5 transition-transform hover:scale-105"
              >
                <div className="font-extrabold text-white text-[11px] tracking-wider flex items-center justify-between">
                  <span>PIER P-03</span>
                </div>
                <div className="text-slate-400 text-[10px]">Health 78%</div>
                <div className="inline-block px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-bold border border-red-500/40">
                  HIGH RISK
                </div>
              </div>
            </Html>
          </group>

          {/* B. CRACK-024 Callout Badge */}
          <group position={[6.9, 1.8, 0.95]}>
            {/* Target Dot on Crack */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#00f2fe" />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <ringGeometry args={[0.12, 0.16, 16]} />
              <meshBasicMaterial color="#00f2fe" side={2} />
            </mesh>

            {/* Anchored Floating Badge */}
            <Html distanceFactor={14} position={[-2.4, 0.8, 0]} center>
              <div 
                onClick={() => selectComponent('pier-p3')}
                className="bg-[#05070A]/95 backdrop-blur-xl border border-cyan-500/60 p-2 rounded-xl shadow-2xl font-mono text-[10px] select-none text-slate-200 cursor-pointer hover:border-cyan-400 min-w-[135px] space-y-0.5 transition-transform hover:scale-105"
              >
                <div className="font-extrabold text-white text-[11px] tracking-wider">
                  CRACK-024
                </div>
                <div className="text-slate-300 text-[10px]">Length 4.2 mm</div>
                <div className="text-slate-400 text-[10px]">Confidence 94%</div>
              </div>
            </Html>
          </group>
        </group>
      )}
    </group>
  );
};
