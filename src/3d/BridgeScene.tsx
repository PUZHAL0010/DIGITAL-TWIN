import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { CameraController } from './CameraController';
import { ProceduralBridge } from './components/ProceduralBridge';
import { SkyEnvironment3D } from './components/SkyEnvironment3D';
import { MeasurementTool3D } from './components/MeasurementTool3D';
import { useSimulationStore } from '../state/useSimulationStore';

export const BridgeScene: React.FC = () => {
  const tickSimulation = useSimulationStore(state => state.tickSimulation);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);
  const renderingMode = useSimulationStore(state => state.renderingMode);

  // High-performance 60 FPS physics calculation and animation loop
  useFrame((_, delta) => {
    // Clamp delta to prevent simulation spikes during tab defocus
    const clampedDelta = Math.min(delta, 0.05);
    tickSimulation(clampedDelta);
  });

  return (
    <>
      {/* 1. Dynamic PBR Sky, Atmosphere & Weather Environment */}
      <SkyEnvironment3D />
      
      {/* 2. Sub-Deck River Surface Bounce Light */}
      <pointLight position={[0, -2, 0]} intensity={1.1} color="#00f2fe" distance={45} />

      {/* 3. Engineering Ground Reference Grid (Only in Engineering / Hybrid mode) */}
      {renderingMode !== 'SOLID' && (
        <Grid
          position={[0, -4.75, 0]}
          args={[100, 100]}
          cellSize={2}
          cellThickness={0.5}
          cellColor="#0f172a"
          sectionSize={10}
          sectionThickness={1.0}
          sectionColor="#0284c7"
          fadeDistance={75}
          fadeStrength={1.5}
        />
      )}

      {/* 4. 3D Digital Twin Bridge Structure, Landscape & Live Traffic */}
      <ProceduralBridge />

      {/* 5. 3D Interactive Measurement Annotations */}
      <MeasurementTool3D />

      {/* 6. Camera Controller with Presets, Drone Flight, and Free Orbit */}
      <CameraController />

      {/* 7. 3D Orientation Gizmo Viewport in bottom corner */}
      {!isPresentationMode && (
        <GizmoHelper alignment="bottom-right" margin={[70, 70]}>
          <GizmoViewport
            axisColors={['#00f2fe', '#38bdf8', '#f59e0b']}
            labelColor="#ffffff"
            axisHeadScale={1}
          />
        </GizmoHelper>
      )}
    </>
  );
};
