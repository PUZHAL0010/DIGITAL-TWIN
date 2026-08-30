import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Navigation, Radio, Battery, Crosshair, X, Aperture } from 'lucide-react';

export const DroneInspectionHUD: React.FC = () => {
  const cameraPreset = useSimulationStore(state => state.cameraPreset);
  const setCameraPreset = useSimulationStore(state => state.setCameraPreset);
  const bridge = useSimulationStore(state => state.bridge);

  if (cameraPreset !== 'DRONE_INSPECTION') return null;

  const pier3 = bridge.components['pier-p3'];
  const crackSev = pier3 ? pier3.damage.crackSeverity : 20;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 font-mono select-none text-cyan-300 p-6 flex flex-col justify-between animate-in fade-in duration-300">
      {/* Top Telemetry Bar */}
      <div className="flex items-center justify-between pointer-events-auto bg-[#05070A]/85 backdrop-blur-xl border border-cyan-500/40 px-4 py-2 rounded-2xl max-w-2xl mx-auto shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>REC [4K 60FPS]</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-xs text-white">
            <Navigation size={13} className="text-cyan-400" />
            <span>AI DRONE SURVEY (SIH26158)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-slate-300">
            <Radio size={13} className="text-emerald-400" />
            <span>5.8 GHz [18 SAT]</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <Battery size={13} className="text-emerald-400" />
            <span>88% (24 MIN)</span>
          </div>
          <button
            onClick={() => setCameraPreset('ISOMETRIC')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Drone Inspection Flight"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Central AI Vision Defect Reticle */}
      <div className="relative w-72 h-72 mx-auto flex items-center justify-center pointer-events-none">
        {/* Outer Crosshair Box */}
        <div className="absolute inset-0 border-2 border-cyan-400/40 rounded-3xl animate-pulse" />
        
        {/* Corner Reticles */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

        <div className="text-center space-y-1 bg-[#05070A]/85 backdrop-blur-md p-2.5 rounded-xl border border-cyan-500/50">
          <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-300 font-bold uppercase">
            <Aperture size={12} className="text-cyan-400 animate-spin" />
            <span>AI CRACK SEGMENTATION</span>
          </div>
          <div className="text-xs font-extrabold text-white">TARGET: PIER P-03</div>
          <div className="text-[10px] text-amber-300">
            Depth: 4.2mm • Conf: 94.8%
          </div>
          <div className="text-[9px] text-slate-400">
            Sev: {crackSev}% • State: ACTIVE
          </div>
        </div>
      </div>

      {/* Bottom LiDAR Rangefinder Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-4 py-1.5 rounded-xl bg-[#05070A]/80 backdrop-blur-md border border-slate-800 max-w-xl mx-auto">
        <div>
          <span>ALT: </span>
          <span className="text-white font-bold">4.2 m</span>
        </div>
        <div>
          <span>LiDAR DIST: </span>
          <span className="text-cyan-300 font-bold">1.84 m</span>
        </div>
        <div>
          <span>SPEED: </span>
          <span className="text-white font-bold">3.2 m/s</span>
        </div>
        <div>
          <span>PITCH/ROLL: </span>
          <span className="text-white font-bold">-4.2° / +1.1°</span>
        </div>
      </div>
    </div>
  );
};
