import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { ViewMode3D, DeformationScale, CameraPreset, RenderingMode } from '../../types/simulation';
import { 
  Cpu, 
  Layers, 
  Flame, 
  Zap, 
  Activity, 
  RotateCcw, 
  ShieldAlert, 
  Eye, 
  Camera, 
  FileText,
  TrendingDown,
  Navigation,
  Box,
  Binary,
  SlidersHorizontal,
  Waves
} from 'lucide-react';

interface HeaderProps {
  onOpenReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenReport }) => {
  const viewMode3D = useSimulationStore(state => state.viewMode3D);
  const setViewMode3D = useSimulationStore(state => state.setViewMode3D);
  const renderingMode = useSimulationStore(state => state.renderingMode);
  const setRenderingMode = useSimulationStore(state => state.setRenderingMode);
  const isEngineeringMode = useSimulationStore(state => state.isEngineeringMode);
  const toggleEngineeringMode = useSimulationStore(state => state.toggleEngineeringMode);
  const deformationScale = useSimulationStore(state => state.deformationScale);
  const setDeformationScale = useSimulationStore(state => state.setDeformationScale);
  const cameraPreset = useSimulationStore(state => state.cameraPreset);
  const setCameraPreset = useSimulationStore(state => state.setCameraPreset);
  const resetSimulation = useSimulationStore(state => state.resetSimulation);
  const collapseState = useSimulationStore(state => state.collapseState);
  const triggerFailureSimulation = useSimulationStore(state => state.triggerFailureSimulation);
  const resetFailureSimulation = useSimulationStore(state => state.resetFailureSimulation);
  const bridge = useSimulationStore(state => state.bridge);

  return (
    <header className="h-14 bg-[#050608]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 flex items-center justify-between z-30 select-none text-slate-200 font-mono">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-cyan-400 to-sky-200 flex items-center justify-center shadow-glow-cyan">
            <Cpu className="text-slate-950 w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-white">
                CRYONEX
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                DIGITAL TWIN
              </span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-tight flex items-center gap-1.5">
              <span>{bridge.assetCode}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{bridge.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Bar: 3D View Modes & Rendering Modes */}
      <div className="flex items-center gap-2">
        {/* 3D Inspection Modes */}
        <div className="flex items-center gap-1 bg-[#0B0F14] p-1 rounded-xl border border-slate-800/80">
          {([
            { id: 'NORMAL', label: 'Twin', icon: <Eye size={12} /> },
            { id: 'STRESS', label: 'Stress', icon: <Flame size={12} /> },
            { id: 'DEFORMATION', label: 'Deform', icon: <TrendingDown size={12} /> },
            { id: 'DAMAGE', label: 'Damage', icon: <Zap size={12} /> },
            { id: 'RISK', label: 'Risk', icon: <Activity size={12} /> },
            { id: 'LOAD_PATH', label: 'Load Path', icon: <Navigation size={12} /> },
          ] as { id: ViewMode3D; label: string; icon: React.ReactNode }[]).map((mode) => {
            const isActive = viewMode3D === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode3D(mode.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? mode.id === 'STRESS'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-glow-amber'
                      : mode.id === 'LOAD_PATH'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Rendering Modes: Solid, Wireframe, Hybrid */}
        <div className="hidden lg:flex items-center bg-[#0B0F14] p-1 rounded-xl border border-slate-800 text-xs">
          {(['HYBRID', 'SOLID', 'WIREFRAME'] as RenderingMode[]).map((rm) => (
            <button
              key={rm}
              onClick={() => setRenderingMode(rm)}
              className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all ${
                renderingMode === rm
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {rm}
            </button>
          ))}
        </div>

        {/* Engineering Mode Toggle */}
        <button
          onClick={toggleEngineeringMode}
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
            isEngineeringMode
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-glow-cyan'
              : 'bg-[#0B0F14] border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Toggle engineering labels, streamlines, and telemetry overlay"
        >
          <SlidersHorizontal size={12} />
          <span>ENG MODE</span>
        </button>
      </div>

      {/* Right Controls: Camera Presets, Failure Trigger, Report & Reset */}
      <div className="flex items-center gap-2">
        {/* Quick Camera Preset Selector with Underwater */}
        <div className="hidden lg:flex items-center bg-[#0B0F14] rounded-lg p-0.5 border border-slate-800 text-[10px]">
          <span className="px-1.5 text-slate-500 flex items-center gap-1">
            <Camera size={11} />
          </span>
          {(['DEFAULT', 'FREE', 'FRONT', 'SIDE', 'TOP', 'UNDERSIDE', 'UNDERWATER'] as CameraPreset[]).map(preset => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                cameraPreset === preset
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={preset === 'UNDERWATER' ? 'Inspect submerged foundations & scour' : preset}
            >
              {preset === 'DEFAULT' ? '360°' : preset === 'UNDERWATER' ? '🌊 H2O' : preset.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Failure Trigger / Restore */}
        {!collapseState.isActive ? (
          <button
            onClick={() => triggerFailureSimulation('OVERLOAD', 'pier-p3')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-500/40 transition-all shadow-sm hover:shadow-glow-red"
            title="Trigger physics structural failure simulation"
          >
            <ShieldAlert size={14} className="text-red-400 animate-pulse" />
            <span>Simulate Failure</span>
          </button>
        ) : (
          <button
            onClick={resetFailureSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-glow-amber"
          >
            <RotateCcw size={14} />
            <span>Restore Bridge</span>
          </button>
        )}

        {/* Export Report */}
        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <FileText size={14} />
          <span className="hidden sm:inline">Report</span>
        </button>

        {/* Global Reset */}
        <button
          onClick={resetSimulation}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="Reset All Parameters to Baseline"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </header>
  );
};
