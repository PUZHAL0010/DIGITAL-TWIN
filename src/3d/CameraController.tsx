import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSimulationStore } from '../state/useSimulationStore';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const cameraPreset = useSimulationStore(state => state.cameraPreset);
  const setCameraPreset = useSimulationStore(state => state.setCameraPreset);
  const selectedComponentId = useSimulationStore(state => state.selectedComponentId);
  const bridge = useSimulationStore(state => state.bridge);
  const collapseState = useSimulationStore(state => state.collapseState);
  const auto360Config = useSimulationStore(state => state.auto360Config);

  const targetCamPos = useRef(new THREE.Vector3(26, 18, 28));
  const targetLookAt = useRef(new THREE.Vector3(0, 1.5, 0));
  const isTransitioning = useRef(true);
  const autoOrbitAngle = useRef(0);
  const droneFlightTime = useRef(0);

  // Compute destination target coordinates on preset change or component selection
  useEffect(() => {
    isTransitioning.current = true;

    // Cinematic tracking during collapse
    if (collapseState.cinematicCameraActive && collapseState.isActive) {
      switch (collapseState.activeScenarioId) {
        case 'SCOUR':
          targetCamPos.current.set(14, 1.2, 14);
          targetLookAt.current.set(6, -2.5, 0);
          break;
        case 'SHIP_COLLISION':
          // Low-angle dramatic view of pier impact zone
          targetCamPos.current.set(11, 2.5, 9);
          targetLookAt.current.set(6, 1.5, 0);
          break;
        case 'SEISMIC':
          // Elevated overview to show deck oscillation
          targetCamPos.current.set(18, 9, 22);
          targetLookAt.current.set(6, 4.5, 0);
          break;
        case 'OVERLOAD':
        default:
          targetCamPos.current.set(16, 4, 18);
          targetLookAt.current.set(6, 0.5, 0);
          break;
      }
      return;
    }

    switch (cameraPreset) {
      case 'TOP':
        targetCamPos.current.set(0, 45, 0.01);
        targetLookAt.current.set(0, 0, 0);
        break;

      case 'BOTTOM':
        targetCamPos.current.set(0, -14, 0.01);
        targetLookAt.current.set(0, 3.8, 0);
        break;

      case 'FRONT':
        targetCamPos.current.set(0, 4.2, 34);
        targetLookAt.current.set(0, 3, 0);
        break;

      case 'BACK':
        targetCamPos.current.set(0, 4.2, -34);
        targetLookAt.current.set(0, 3, 0);
        break;

      case 'LEFT':
        targetCamPos.current.set(-42, 5, 0);
        targetLookAt.current.set(0, 3, 0);
        break;

      case 'RIGHT':
        targetCamPos.current.set(42, 5, 0);
        targetLookAt.current.set(0, 3, 0);
        break;

      case 'UNDER_DECK':
        targetCamPos.current.set(0, 2.0, 5.0);
        targetLookAt.current.set(0, 3.6, 0);
        break;

      case 'UNDER_BRIDGE':
        targetCamPos.current.set(0, -2.5, 18);
        targetLookAt.current.set(0, 2.0, 0);
        break;

      case 'WATER_LEVEL':
        targetCamPos.current.set(14, -0.3, 14);
        targetLookAt.current.set(6, -0.5, 0);
        break;

      case 'UNDERWATER':
        targetCamPos.current.set(12, -3.2, 9);
        targetLookAt.current.set(6, -3.8, 0);
        break;

      case 'ISOMETRIC':
      case 'DEFAULT':
        targetCamPos.current.set(26, 18, 28);
        targetLookAt.current.set(0, 1.5, 0);
        break;

      case 'COMPONENT':
        if (selectedComponentId && bridge.components[selectedComponentId]) {
          const comp = bridge.components[selectedComponentId];
          const [cx, cy, cz] = comp.position;
          if (comp.type === 'pier' || comp.type === 'foundation') {
            targetCamPos.current.set(cx + 4.5, cy + 2.5, cz + 9.5);
            targetLookAt.current.set(cx, cy, cz);
          } else if (comp.type === 'deck') {
            targetCamPos.current.set(cx, cy + 4.5, cz + 10.5);
            targetLookAt.current.set(cx, cy, cz);
          } else {
            targetCamPos.current.set(cx + 5, cy + 4, cz + 9);
            targetLookAt.current.set(cx, cy, cz);
          }
        } else {
          targetCamPos.current.set(26, 18, 28);
          targetLookAt.current.set(0, 1.5, 0);
        }
        break;

      case 'AUTO_360':
      case 'DRONE_INSPECTION':
        // Handled dynamically in useFrame loop
        break;

      case 'CINEMATIC':
        break;

      case 'FREE':
      default:
        isTransitioning.current = false;
        break;
    }
  }, [cameraPreset, selectedComponentId, bridge.components, collapseState.cinematicCameraActive, collapseState.isActive, collapseState.activeScenarioId]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // 1. AUTO 360 Continuous Turntable Orbit
    if (cameraPreset === 'AUTO_360') {
      if (auto360Config.isPlaying) {
        const orbitSpeed = delta * 0.35 * auto360Config.speed * auto360Config.direction;
        autoOrbitAngle.current += orbitSpeed;

        const radius = 32;
        const elev = 14;
        const cx = Math.sin(autoOrbitAngle.current) * radius;
        const cz = Math.cos(autoOrbitAngle.current) * radius;

        camera.position.set(cx, elev, cz);
        controlsRef.current.target.set(0, 1.5, 0);
        controlsRef.current.update();
      }
      return;
    }

    // 2. DRONE INSPECTION AUTOMATED FLIGHT PATH
    if (cameraPreset === 'DRONE_INSPECTION') {
      droneFlightTime.current += delta * 0.25;
      const t = (droneFlightTime.current % (Math.PI * 2));

      // 3D Lissajous / spline inspection orbit around Pier 3, under-deck, and deck surface
      const dx = 6.0 + Math.sin(t) * 9.0;
      const dy = 3.5 + Math.sin(t * 2) * 2.2;
      const dz = Math.cos(t) * 9.0;

      // Look at Pier P-03 defect area
      const lx = 6.0 + Math.sin(t * 0.5) * 1.5;
      const ly = 2.0 + Math.cos(t) * 0.8;
      const lz = 0.0;

      camera.position.lerp(new THREE.Vector3(dx, dy, dz), delta * 3.0);
      controlsRef.current.target.lerp(new THREE.Vector3(lx, ly, lz), delta * 3.0);
      controlsRef.current.update();
      return;
    }

    // 3. Smooth Programmatic Transition Lerp towards target
    if (isTransitioning.current && cameraPreset !== 'FREE') {
      const lerpSpeed = Math.min(1, delta * 3.8);
      camera.position.lerp(targetCamPos.current, lerpSpeed);
      controlsRef.current.target.lerp(targetLookAt.current, lerpSpeed);
      controlsRef.current.update();

      // If very close to target, finish transition
      if (camera.position.distanceTo(targetCamPos.current) < 0.08 && controlsRef.current.target.distanceTo(targetLookAt.current) < 0.08) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.5}
      maxDistance={180}
      minPolarAngle={0.001}          // Complete freedom: look directly straight down from top
      maxPolarAngle={Math.PI - 0.001} // Complete freedom: look directly straight up from bottom
      onStart={() => {
        isTransitioning.current = false;
        if (cameraPreset !== 'FREE') {
          setCameraPreset('FREE');
        }
      }}
    />
  );
};
