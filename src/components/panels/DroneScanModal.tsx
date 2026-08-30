import React, { useState } from 'react';
import { MOCK_DRONE_MISSION } from '../../data/droneScanMock';
import {
  X,
  Plane,
  Cpu,
  Boxes,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface DroneScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DroneScanModal: React.FC<DroneScanModalProps> = ({ isOpen, onClose }) => {
  // Mission data comes from the static mock — the global store does not track drone missions.
  const mission = MOCK_DRONE_MISSION;

  // Local toggle: controls whether the 3D drone path visualizer is in active (fast)
  // or survey-idle (slow) flight mode. Not persisted to the global store.
  const [isDroneFlightActive, setDroneFlightActive] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Plane size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono tracking-tight flex items-center gap-2">
                <span>Autonomous UAV Survey &amp; AI Defect Pipeline</span>
                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 font-mono">
                  SIH26158
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Drone photogrammetry reconstruction &amp; deep learning computer vision defect segmentation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar text-xs">
          {/* Architecture Pipeline Flow Diagram */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
              End-to-End System Pipeline Architecture
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col items-center gap-1.5">
                <Plane size={18} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-white">1. UAV Photogrammetry</span>
                <span className="text-[9px] text-slate-400">RTK Lidar + 45MP Multi-Angle Imagery</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col items-center gap-1.5">
                <Boxes size={18} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-white">2. 3D Digital Twin</span>
                <span className="text-[9px] text-slate-400">Dense Point Cloud &amp; Parametric Meshing</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col items-center gap-1.5">
                <Cpu size={18} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-white">3. AI Defect Detection</span>
                <span className="text-[9px] text-slate-400">YOLO-V8 / Mask R-CNN Fracture Mapping</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col items-center gap-1.5">
                <TrendingUp size={18} className="text-cyan-400" />
                <span className="text-[10px] font-bold text-white">4. 3D FEA Simulation</span>
                <span className="text-[9px] text-slate-400">Stiffness Loss, Stress &amp; Predictive Lifecycle</span>
              </div>
            </div>
          </div>

          {/* Active Mission Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">Mission Code</div>
              <div className="text-xs font-bold text-white mt-1">{mission.missionId}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">UAV Platform</div>
              <div className="text-xs font-bold text-cyan-400 mt-1">{mission.droneModel.split(' ')[0]}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">Point Cloud Density</div>
              <div className="text-xs font-bold text-emerald-400 mt-1">{mission.pointCloudDensityPtsSqM.toLocaleString()} pts/m²</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">Defects Tagged</div>
              <div className="text-xs font-bold text-amber-400 mt-1">{mission.detectedDefectsCount} AI Bounding Boxes</div>
            </div>
          </div>

          {/* AI Defect List */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Segmented Structural Defects (Computer Vision)</span>
              <span className="text-[10px] text-slate-400 font-normal">Auto-mapped to 3D Coordinates</span>
            </div>

            <div className="space-y-2">
              {mission.defects.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-glow-red" />
                    <div>
                      <div className="text-xs font-bold text-slate-100">
                        {(d.type as string).replace(/_/g, ' ').toUpperCase()} on {d.componentId.toUpperCase()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Timestamp: {d.droneCaptureTimestamp} | Spatial XYZ: [{d.position3D.join(', ')}]
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-cyan-400">
                      {(d.confidenceScore * 100).toFixed(1)}% Confidence
                    </div>
                    <div className="text-[10px] text-amber-400 font-semibold">
                      Severity: {d.severityScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drone Action Button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Full compliance with SIH26158 Digital Twin standard</span>
            </div>

            <button
              onClick={() => {
                setDroneFlightActive(prev => !prev);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-glow-cyan"
            >
              <Plane size={14} />
              <span>{isDroneFlightActive ? 'Pause Drone Flight' : 'Launch 3D UAV Flight Orbit'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};