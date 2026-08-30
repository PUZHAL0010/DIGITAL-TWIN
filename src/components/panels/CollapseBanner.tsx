import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { SCENARIO_CONFIGS } from '../../physics/scenarioFailureEngine';
import { Video, RotateCcw, AlertOctagon } from 'lucide-react';

export const CollapseBanner: React.FC = () => {
  const collapseState = useSimulationStore(state => state.collapseState);
  const setCinematicCamera = useSimulationStore(state => state.setCinematicCamera);
  const resetFailureSimulation = useSimulationStore(state => state.resetFailureSimulation);
  const bridge = useSimulationStore(state => state.bridge);
  const timeline = useSimulationStore(state => state.timeline);

  if (!collapseState.isActive) return null;

  const scenarioConfig = SCENARIO_CONFIGS[collapseState.activeScenarioId] || SCENARIO_CONFIGS.OVERLOAD;
  const triggerComp = bridge.components[collapseState.triggerComponentId] || bridge.components['pier-p3'];
  const currentYearInt = Math.floor(timeline.currentYear);
  const elapsedYears = Math.max(0, timeline.currentYear - 2026);

  return (
    <div className="absolute top-16 right-4 z-30 w-72 sm:w-80 bg-[#05070A]/95 backdrop-blur-2xl border border-red-500/50 rounded-2xl p-3 shadow-2xl shadow-glow-red text-xs font-mono select-none text-red-200 animate-in slide-in-from-top-2 duration-200 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-red-500/30">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <AlertOctagon size={15} className="text-red-400 animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider">{scenarioConfig.title}</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-200 border border-red-500/40 font-bold">
          {collapseState.stage.replace('_', ' ')} (T+{(collapseState.simulationTimeSec).toFixed(1)}s)
        </span>
      </div>

      {/* Component & Year Details */}
      <div className="grid grid-cols-2 gap-1 py-1.5 text-[10px] border-b border-red-500/20 text-slate-300">
        <div>
          <span className="text-slate-500">Component: </span>
          <span className="text-white font-bold">{triggerComp ? triggerComp.name : 'Span 03'}</span>
        </div>
        <div>
          <span className="text-slate-500">Year: </span>
          <span className="text-amber-300 font-bold">{currentYearInt} (+{elapsedYears.toFixed(1)}y)</span>
        </div>
        <div>
          <span className="text-slate-500">Peak Stress: </span>
          <span className="text-red-400 font-bold">{bridge.peakStressMPa} MPa</span>
        </div>
        <div>
          <span className="text-slate-500">FoS / Risk: </span>
          <span className="text-red-400 font-bold">{bridge.systemSafetyFactor.toFixed(2)} ({bridge.overallRisk})</span>
        </div>
      </div>

      {/* Description / Cause */}
      <p className="text-[10px] text-slate-300 leading-snug py-1.5 truncate">
        {collapseState.triggerCause}
      </p>

      {/* Mini Controls: Cinematic & Restore Bridge */}
      <div className="flex items-center justify-between pt-1 border-t border-red-500/20 text-[10px]">
        <button
          onClick={() => setCinematicCamera(!collapseState.cinematicCameraActive)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold transition-all ${
            collapseState.cinematicCameraActive
              ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
              : 'bg-slate-900 text-slate-300 border border-slate-700'
          }`}
        >
          <Video size={11} />
          <span>{collapseState.cinematicCameraActive ? 'Cinematic' : 'Free Cam'}</span>
        </button>

        <button
          onClick={resetFailureSimulation}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-glow-amber"
        >
          <RotateCcw size={11} />
          <span>Restore Bridge</span>
        </button>
      </div>
    </div>
  );
};
