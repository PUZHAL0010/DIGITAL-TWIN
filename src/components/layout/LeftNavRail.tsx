import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { 
  Home, 
  Search, 
  Layers, 
  Crosshair, 
  Ruler, 
  Activity, 
  Radio,
  FileText, 
  Settings 
} from 'lucide-react';

interface LeftNavRailProps {
  onOpenReport: () => void;
  onOpenSettings?: () => void;
}

export const LeftNavRail: React.FC<LeftNavRailProps> = ({ onOpenReport, onOpenSettings }) => {
  const activeView = useSimulationStore(state => state.activeView);
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);
  const cameraPreset = useSimulationStore(state => state.cameraPreset);
  const setCameraPreset = useSimulationStore(state => state.setCameraPreset);
  const selectedComponentId = useSimulationStore(state => state.selectedComponentId);
  const selectComponent = useSimulationStore(state => state.selectComponent);
  const measurementMode = useSimulationStore(state => state.measurementMode);
  const setMeasurementMode = useSimulationStore(state => state.setMeasurementMode);

  if (isPresentationMode) return null;

  return (
    <aside className="absolute left-4 top-20 bottom-24 z-20 w-16 bg-[#070a10]/90 backdrop-blur-2xl border border-slate-800/80 rounded-2xl shadow-2xl flex flex-col items-center py-4 justify-between font-mono text-slate-400 select-none">
      {/* Top Group */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* 1. HOME (Digital Twin) */}
        <button
          onClick={() => {
            setActiveView('DIGITAL_TWIN');
            setCameraPreset('ISOMETRIC');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl w-12 transition-all ${
            activeView === 'DIGITAL_TWIN' && cameraPreset !== 'DRONE_INSPECTION'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'hover:text-white hover:bg-slate-900/80'
          }`}
          title="Digital Twin Home"
        >
          <Home size={18} />
          <span className="text-[9px] font-bold tracking-tight">HOME</span>
        </button>

        {/* 2. INSPECT (Toggle Pier P-03 Inspector) */}
        <button
          onClick={() => {
            selectComponent(selectedComponentId ? null : 'pier-p3');
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl w-12 transition-all ${
            selectedComponentId
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'hover:text-white hover:bg-slate-900/80'
          }`}
          title="Inspect Structural Components"
        >
          <Search size={18} />
          <span className="text-[9px] font-bold tracking-tight">INSPECT</span>
        </button>

        {/* 3. COMPONENTS (Asset Tree / View) */}
        <button
          onClick={() => setActiveView('ENGINEERING_DATA')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl w-12 transition-all ${
            activeView === 'ENGINEERING_DATA'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'hover:text-white hover:bg-slate-900/80'
          }`}
          title="Components & Assets"
        >
          <Layers size={18} />
          <span className="text-[9px] font-bold tracking-tight">COMPONENTS</span>
        </button>

        {/* 4. DRONE (Drone Survey Flight) */}
        <button
          onClick={() => setCameraPreset('DRONE_INSPECTION')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl w-12 transition-all ${
            cameraPreset === 'DRONE_INSPECTION'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan animate-pulse'
              : 'hover:text-white hover:bg-slate-900/80'
          }`}
          title="AI Drone Inspection Survey"
        >
          <Crosshair size={18} />
          <span className="text-[9px] font-bold tracking-tight">DRONE</span>
        </button>

        {/* 5. MEASURE (3D Measurement Tools) */}
        <button
          onClick={() => {
            setMeasurementMode(
              measurementMode === 'NONE' ? 'SPAN' :
              measurementMode === 'SPAN' ? 'DISTANCE' :
              measurementMode === 'DISTANCE' ? 'CRACK' :
              measurementMode === 'CRACK' ? 'DEFLECTION' : 'NONE'
            );
          }}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl w-12 transition-all ${
            measurementMode !== 'NONE'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'hover:text-white hover:bg-slate-900/80'
          }`}
          title={`3D Measurement Tool (${measurementMode})`}
        >
          <Ruler size={18} />
          <span className="text-[9px] font-bold tracking-tight">MEASURE</span>
        </button>

        {/* 6. ANALYSIS (Analytics & Stress) */}
        <button
          onClick={() => setActiveView('ANALYTICS')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl w-12 transition-all ${
            activeView === 'ANALYTICS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'hover:text-white hover:bg-slate-900/80'
          }`}
          title="Structural Analysis & Analytics"
        >
          <Activity size={18} />
          <span className="text-[9px] font-bold tracking-tight">ANALYSIS</span>
        </button>

        {/* 6b. SENSORS (IoT Telemetry Stream) */}
        <button
          onClick={() => setActiveView('SENSORS')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl w-12 transition-all ${
            activeView === 'SENSORS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
              : 'hover:text-white hover:bg-slate-900/80'
          }`}
          title="IoT Sensors & Telemetry"
        >
          <Radio size={18} />
          <span className="text-[9px] font-bold tracking-tight">SENSORS</span>
        </button>
      </div>

      {/* Bottom Group */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* 7. REPORTS (Assessment Report) */}
        <button
          onClick={onOpenReport}
          className="flex flex-col items-center gap-1 p-2 rounded-xl w-12 hover:text-white hover:bg-slate-900/80 transition-all"
          title="Engineering Reports"
        >
          <FileText size={18} />
          <span className="text-[9px] font-bold tracking-tight">REPORTS</span>
        </button>

        {/* 8. SETTINGS */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center gap-1 p-2 rounded-xl w-12 hover:text-white hover:bg-slate-900/80 transition-all"
          title="Platform Settings"
        >
          <Settings size={18} />
          <span className="text-[9px] font-bold tracking-tight">SETTINGS</span>
        </button>
      </div>
    </aside>
  );
};
