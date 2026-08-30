import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { SCENARIOS_DEFINITIONS } from '../../state/useSimulationStore';
import { Terminal, X, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export const SimulationDebugOverlay: React.FC = () => {
  const showSimulationDebug = useSimulationStore(state => state.showSimulationDebug);
  const toggleSimulationDebug = useSimulationStore(state => state.toggleSimulationDebug);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);
  
  const activeScenarioId = useSimulationStore(state => state.activeScenarioId);
  const collapseState = useSimulationStore(state => state.collapseState);
  const bridge = useSimulationStore(state => state.bridge);
  const dynamicLoad = useSimulationStore(state => state.dynamicLoad);
  const waterConfig = useSimulationStore(state => state.waterConfig);
  const timeline = useSimulationStore(state => state.timeline);

  if (!showSimulationDebug || isPresentationMode) return null;

  const scenarioDef = SCENARIOS_DEFINITIONS[activeScenarioId] || SCENARIOS_DEFINITIONS.OVERLOAD;
  const targetComp = bridge.components[scenarioDef.affectedComponents[0]] || bridge.components['pier-p3'];

  return (
    <div className="absolute top-16 left-4 z-40 w-80 sm:w-96 bg-[#05070A]/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="p-2.5 bg-[#080B10] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
          <Terminal size={14} />
          <span>Simulation Physics Debug</span>
        </div>
        <button
          onClick={toggleSimulationDebug}
          className="text-slate-400 hover:text-white p-0.5 rounded-lg"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content Stream */}
      <div className="p-3 max-h-[75vh] overflow-y-auto space-y-3 custom-scrollbar text-[11px]">
        {/* Scenario State */}
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Active Scenario:</div>
          <div className="text-cyan-300 font-bold">{scenarioDef.name} ({activeScenarioId})</div>
          <div className="text-[10px] text-slate-400">Kinematic Mode: {scenarioDef.collapseMode}</div>
          <div className="text-[10px] text-amber-300">Criterion: {scenarioDef.failureCriterionDescription}</div>
        </div>

        {/* Global Structural Metrics */}
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Authoritative System State:</div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>Overall Health: <span className="font-bold text-white">{bridge.overallHealth}%</span></div>
            <div>Max Utilization: <span className={`font-bold ${bridge.overallUtilization > 0.8 ? 'text-red-400' : 'text-cyan-400'}`}>{(bridge.overallUtilization * 100).toFixed(0)}%</span></div>
            <div>Peak Stress: <span className="font-bold text-white">{bridge.peakStressMPa} MPa</span></div>
            <div>Max Deflection: <span className="font-bold text-white">{bridge.maxDeformationMm} mm</span></div>
            <div>System SF: <span className="font-bold text-emerald-400">{bridge.systemSafetyFactor}</span></div>
            <div>Total Load: <span className="font-bold text-cyan-300">{dynamicLoad.totalDynamicLoadKn.toFixed(0)} kN</span></div>
          </div>
        </div>

        {/* Critical Component Mechanics */}
        {targetComp && (
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Critical Target ({targetComp.id}):</div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div>A_eff: <span className="text-slate-300">{(targetComp.section.effectiveAreaM2).toFixed(3)} m²</span></div>
              <div>Demand: <span className="text-slate-300">{targetComp.appliedForceKn.toFixed(0)} kN</span></div>
              <div>Capacity: <span className="text-slate-300">{targetComp.effectiveCapacityKn.toFixed(0)} kN</span></div>
              <div>KI / KIc: <span className="text-slate-300">{targetComp.damage.stressIntensityFactorKI.toFixed(2)} / {targetComp.material.fractureToughnessMPaSqrtM}</span></div>
              <div>Crack Sev: <span className="text-amber-300">{targetComp.damage.crackSeverity}%</span></div>
              <div>Corrosion: <span className="text-amber-300">{targetComp.damage.corrosionPercentage}%</span></div>
            </div>
          </div>
        )}

        {/* Failure & Water Telemetry */}
        <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-[10px]">
          <div className="text-slate-500 font-bold uppercase">Dynamic Environment & Physics:</div>
          <div>Failure State: <span className={collapseState.isActive ? 'text-red-400 font-bold' : 'text-emerald-400'}>{collapseState.isActive ? `ACTIVE (${collapseState.stage})` : 'STABLE'}</span></div>
          <div>Scour Depth: <span className="text-sky-300 font-bold">{waterConfig.scourExcavationDepthM.toFixed(2)} m</span></div>
          <div>Current Flow: <span className="text-sky-300">{waterConfig.currentVelocityMps} m/s</span></div>
          <div>Collapsed Members: <span className="text-slate-300">{collapseState.collapsedComponentIds.length > 0 ? collapseState.collapsedComponentIds.join(', ') : 'None'}</span></div>
        </div>
      </div>
    </div>
  );
};
