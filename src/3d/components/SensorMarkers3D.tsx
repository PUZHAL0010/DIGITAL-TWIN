import React from 'react';
import { Html } from '@react-three/drei';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Activity, Radio } from 'lucide-react';

export const SensorMarkers3D: React.FC = () => {
  const sensors = useSimulationStore(state => state.sensors);
  const selectedSensorId = useSimulationStore(state => state.selectedSensorId);
  const selectSensor = useSimulationStore(state => state.selectSensor);
  const selectComponent = useSimulationStore(state => state.selectComponent);
  const viewMode3D = useSimulationStore(state => state.viewMode3D);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);

  if (isPresentationMode) return null;

  return (
    <group name="SensorMarkersLayer">
      {Object.values(sensors).map((sensor) => {
        const isSelected = selectedSensorId === sensor.id;
        const [x, y, z] = sensor.position3D;

        return (
          <group key={sensor.id} position={[x, y, z]}>
            {/* 3D Physical Sensor Enclosure Puck */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                selectSensor(sensor.id);
                selectComponent(sensor.componentId);
              }}
              castShadow
            >
              <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
              <meshStandardMaterial
                color={isSelected ? '#06b6d4' : '#1e293b'}
                emissive={isSelected ? '#0891b2' : '#0f172a'}
                emissiveIntensity={isSelected ? 0.8 : 0.2}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Signal Transmission Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
              <ringGeometry args={[0.14, 0.18, 16]} />
              <meshBasicMaterial
                color={sensor.status === 'LIVE' ? '#10b981' : '#f59e0b'}
                transparent
                opacity={0.7}
              />
            </mesh>

            {/* Anchored 3D Telemetry Tooltip Badge */}
            {(viewMode3D === 'NORMAL' || viewMode3D === 'RISK' || isSelected) && (
              <Html
                position={[0, 0.35, 0]}
                center
                distanceFactor={18}
                zIndexRange={[100, 0]}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    selectSensor(sensor.id);
                    selectComponent(sensor.componentId);
                  }}
                  className={`cursor-pointer px-2 py-1 rounded-lg backdrop-blur-md border text-[9px] font-mono whitespace-nowrap transition-all duration-200 shadow-xl flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/50 scale-105'
                      : 'bg-slate-950/85 border-slate-800 text-slate-300 hover:border-cyan-500/60 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-cyan-300">{sensor.id}</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-white font-semibold">
                    {sensor.currentValue} {sensor.unit}
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
