import React from 'react';
import { Html } from '@react-three/drei';
import { useSimulationStore } from '../../state/useSimulationStore';

interface DefectPinMarkerProps {
  defect: {
    id: string;
    componentId: string;
    type: 'crack_flexural' | 'crack_shear' | 'spalling_corrosion' | 'cable_corrosion';
    confidenceScore: number;
    position3D: [number, number, number];
    dimensionsMeters: [number, number, number];
    severityScore: number;
    droneCaptureTimestamp: string;
  };
}

export const DefectPinMarker: React.FC<DefectPinMarkerProps> = ({ defect }) => {
  const selectedComponentId = useSimulationStore(state => state.selectedComponentId);
  const selectComponent = useSimulationStore(state => state.selectComponent);
  const showAnnotations = useSimulationStore(state => state.showAnnotations);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);

  if (!showAnnotations || isPresentationMode) return null;

  const isSelected = selectedComponentId === defect.componentId;

  return (
    <group position={defect.position3D}>
      {/* 1. Small 3D Origin Indicator Sphere */}
      <mesh>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* 2. World-Space Vertical Callout Stem */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
      </mesh>

      {/* 3. Compact World-Space Engineering Label */}
      <Html
        position={[0, 0.95, 0]}
        center
        distanceFactor={18}
        zIndexRange={[100, 0]}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            selectComponent(defect.componentId);
          }}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border shadow-xl cursor-pointer transition-all duration-150 font-mono text-[10px] whitespace-nowrap select-none ${
            isSelected
              ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 scale-105 shadow-glow-amber'
              : 'bg-[#05070A]/90 text-amber-300 border-amber-500/40 hover:border-amber-400 hover:scale-105'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
          <span className="font-bold">
            {defect.type === 'crack_shear' ? 'AI CRACK (P-03)' : 'AI CRACK (SPAN-3)'}
          </span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-200">
            {defect.severityScore}%
          </span>
        </div>
      </Html>
    </group>
  );
};
