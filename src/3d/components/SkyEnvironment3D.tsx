import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSimulationStore } from '../../state/useSimulationStore';

export const SkyEnvironment3D: React.FC = () => {
  const weather = useSimulationStore(state => state.weather);
  const rainRef = useRef<THREE.Points>(null);

  // Dynamic Weather Environment Configuration
  const weatherConfig = useMemo(() => {
    switch (weather) {
      case 'GOLDEN_HOUR':
        return {
          skyColor: '#fdba74',
          groundColor: '#431407',
          sunPos: [45, 14, 30] as [number, number, number],
          sunColor: '#ffedd5',
          sunIntensity: 2.2,
          ambientColor: '#fed7aa',
          ambientIntensity: 0.9,
          fogColor: '#431407',
          fogDensity: 0.006,
          rain: false,
        };
      case 'OVERCAST':
        return {
          skyColor: '#94a3b8',
          groundColor: '#1e293b',
          sunPos: [15, 35, 15] as [number, number, number],
          sunColor: '#e2e8f0',
          sunIntensity: 0.9,
          ambientColor: '#cbd5e1',
          ambientIntensity: 0.75,
          fogColor: '#1e293b',
          fogDensity: 0.009,
          rain: false,
        };
      case 'RAIN':
        return {
          skyColor: '#475569',
          groundColor: '#0f172a',
          sunPos: [10, 25, 10] as [number, number, number],
          sunColor: '#94a3b8',
          sunIntensity: 0.6,
          ambientColor: '#64748b',
          ambientIntensity: 0.65,
          fogColor: '#0f172a',
          fogDensity: 0.014,
          rain: true,
          rainCount: 1500,
        };
      case 'FOG':
        return {
          skyColor: '#64748b',
          groundColor: '#1e293b',
          sunPos: [10, 20, 10] as [number, number, number],
          sunColor: '#cbd5e1',
          sunIntensity: 0.4,
          ambientColor: '#94a3b8',
          ambientIntensity: 0.6,
          fogColor: '#334155',
          fogDensity: 0.024,
          rain: false,
        };
      case 'NIGHT':
        return {
          skyColor: '#020617',
          groundColor: '#020617',
          sunPos: [0, 20, 20] as [number, number, number],
          sunColor: '#38bdf8',
          sunIntensity: 0.25,
          ambientColor: '#0f172a',
          ambientIntensity: 0.35,
          fogColor: '#020617',
          fogDensity: 0.012,
          rain: false,
        };
      case 'CLEAR_NOON':
      default:
        return {
          skyColor: '#7dd3fc',
          groundColor: '#0c1524',
          sunPos: [32, 42, 28] as [number, number, number],
          sunColor: '#ffffff',
          sunIntensity: 1.8,
          ambientColor: '#e0f2fe',
          ambientIntensity: 0.85,
          fogColor: '#05070a',
          fogDensity: 0.007,
          rain: false,
        };
    }
  }, [weather]);

  // Rain Particles Geometry
  const rainGeo = useMemo(() => {
    if (!weatherConfig.rain) return null;
    const count = weatherConfig.rainCount || 1000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [weatherConfig.rain, weatherConfig.rainCount]);

  useFrame((_, delta) => {
    if (rainRef.current && rainGeo) {
      const posAttr = rainGeo.getAttribute('position');
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - delta * 35;
        if (y < -2) y = 30;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group name="sky-atmosphere-environment">
      {/* Dynamic Exponential Fog */}
      <fogExp2 attach="fog" args={[weatherConfig.fogColor, weatherConfig.fogDensity]} />

      {/* Dynamic Hemisphere Ambient Light */}
      <hemisphereLight
        args={[weatherConfig.skyColor, weatherConfig.groundColor, weatherConfig.ambientIntensity]}
      />

      {/* Primary Key Sunlight with Soft Shadow Mapping */}
      <directionalLight
        position={weatherConfig.sunPos}
        intensity={weatherConfig.sunIntensity}
        color={weatherConfig.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
        shadow-bias={-0.0001}
      />

      {/* Sky Horizon Dome Mesh */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[120, 24, 24]} />
        <meshBasicMaterial
          color={weatherConfig.skyColor}
          side={THREE.BackSide}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Rain Particles */}
      {weatherConfig.rain && rainGeo && (
        <points ref={rainRef} geometry={rainGeo}>
          <pointsMaterial color="#93c5fd" size={0.12} transparent opacity={0.65} />
        </points>
      )}
    </group>
  );
};
