import React from 'react';
import { Html } from '@react-three/drei';
import { useSimulationStore } from '../../state/useSimulationStore';

export const MeasurementTool3D: React.FC = () => {
  const measurementMode = useSimulationStore(state => state.measurementMode);
  const bridge = useSimulationStore(state => state.bridge);
  const pier3 = bridge.components['pier-p3'];
  const deck3 = bridge.components['deck-span-3'];

  if (measurementMode === 'NONE') return null;

  return (
    <group name="3d-measurement-annotations">
      {/* 1. SPAN MEASUREMENT MODE */}
      {measurementMode === 'SPAN' && (
        <group position={[0, 5.8, 3.8]}>
          {/* Main Span Dimension Line */}
          {[-18, -6, 6, 18].map((px, idx) => (
            <React.Fragment key={`span-dim-${idx}`}>
              <mesh position={[px, 0, 0]}>
                <sphereGeometry args={[0.15, 12, 12]} />
                <meshBasicMaterial color="#00f2fe" />
              </mesh>
              {idx < 3 && (
                <group position={[px + 6, 0.4, 0]}>
                  <Html distanceFactor={18} center>
                    <div className="bg-[#05070A]/90 backdrop-blur-md border border-cyan-500/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-300 shadow-xl whitespace-nowrap">
                      SPAN {idx + 1}: 12.00 m
                    </div>
                  </Html>
                </group>
              )}
            </React.Fragment>
          ))}
          {/* Total Length Annotation */}
          <group position={[0, 1.4, 0]}>
            <Html distanceFactor={20} center>
              <div className="bg-[#05070A]/95 backdrop-blur-md border border-amber-500/60 px-2.5 py-1 rounded text-[11px] font-mono font-bold text-amber-300 shadow-2xl whitespace-nowrap">
                TOTAL BRIDGE LENGTH: 48.00 m (4 Spans)
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* 2. VERTICAL CLEARANCE & DISTANCE MEASUREMENT */}
      {measurementMode === 'DISTANCE' && (
        <group position={[0, 0, 0]}>
          {/* Water to Deck Navigation Clearance */}
          <group position={[0, 1.5, 0]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 4.1, 8]} />
              <meshBasicMaterial color="#00f2fe" />
            </mesh>
            <Html distanceFactor={16} position={[0.8, 0, 0]} center>
              <div className="bg-[#05070A]/90 backdrop-blur-md border border-cyan-500/50 px-2 py-1 rounded text-[10px] font-mono font-bold text-cyan-300 shadow-xl whitespace-nowrap">
                NAV CLEARANCE: 4.10 m (HWL)
              </div>
            </Html>
          </group>
          {/* Pier Column Width */}
          <group position={[6, 0, 1.8]}>
            <Html distanceFactor={14} center>
              <div className="bg-[#05070A]/90 backdrop-blur-md border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 shadow-xl whitespace-nowrap">
                PIER P-03 DIA: 2.40 m
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* 3. CRACK DIMENSION MEASUREMENT */}
      {measurementMode === 'CRACK' && (
        <group position={[6.9, 1.8, 0.95]}>
          <mesh>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <Html distanceFactor={12} position={[0.6, 0.4, 0]} center>
            <div className="bg-[#05070A]/95 backdrop-blur-md border border-red-500/60 p-2 rounded text-[10px] font-mono text-slate-200 shadow-2xl whitespace-nowrap space-y-0.5">
              <div className="text-red-400 font-bold">CRACK-024 (PIER P-03)</div>
              <div>Length: <span className="text-white font-bold">1.85 m</span></div>
              <div>Width: <span className="text-amber-300 font-bold">{pier3 ? pier3.damage.crackWidthMm.toFixed(2) : '4.20'} mm</span></div>
              <div>Severity: <span className="text-red-400 font-bold">{pier3 ? pier3.damage.crackSeverity : 78}%</span></div>
            </div>
          </Html>
        </group>
      )}

      {/* 4. MIDSPAN DEFLECTION MEASUREMENT */}
      {measurementMode === 'DEFLECTION' && (
        <group position={[6.0, 3.6, 0]}>
          <Html distanceFactor={14} position={[0, -0.8, 0]} center>
            <div className="bg-[#05070A]/95 backdrop-blur-md border border-amber-500/60 p-2 rounded text-[10px] font-mono text-slate-200 shadow-2xl whitespace-nowrap space-y-0.5">
              <div className="text-amber-400 font-bold">MIDSPAN LIVE DEFLECTION (SPAN 3)</div>
              <div>Current Deflection: <span className="text-white font-bold">{deck3 ? deck3.deformationMm.toFixed(1) : '12.4'} mm</span></div>
              <div>Allowable Limit (L/250): <span className="text-cyan-300 font-bold">48.0 mm</span></div>
              <div>Deflection Ratio: <span className="text-emerald-400 font-bold">{deck3 ? deck3.deflectionRatio : 'L/968'}</span></div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};
