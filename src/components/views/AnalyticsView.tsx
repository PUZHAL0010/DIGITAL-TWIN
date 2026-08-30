import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { LineChart, ArrowRight, Activity, TrendingDown, Layers, ShieldCheck } from 'lucide-react';
import { formatMPa, formatKn, formatMm } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const bridge = useSimulationStore(state => state.bridge);
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const componentsList = Object.values(bridge.components);

  return (
    <div className="absolute inset-0 bg-[#050608]/95 backdrop-blur-2xl z-20 overflow-y-auto p-6 text-slate-200 font-mono select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <LineChart size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                Structural Capacity vs Demand Analytics
              </h1>
              <p className="text-xs text-slate-400">
                Asset-wide structural utilization and demand distribution profile.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('DIGITAL_TWIN')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow-cyan"
          >
            <span>Back to 3D Twin</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Global Summary Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Asset Health Index</span>
            <span className="text-lg font-extrabold text-white mt-1 block">{bridge.overallHealth}%</span>
            <span className="text-[9px] text-slate-500">Criticality-Weighted</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Max Utilization</span>
            <span className="text-lg font-extrabold text-amber-400 mt-1 block">{(bridge.overallUtilization * 100).toFixed(1)}%</span>
            <span className="text-[9px] text-slate-500">Peak Demand / Capacity</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Max Deflection (δ)</span>
            <span className="text-lg font-extrabold text-cyan-400 mt-1 block">{formatMm(bridge.maxDeformationMm)}</span>
            <span className="text-[9px] text-slate-500">AASHTO Serviceability</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">System Safety Factor</span>
            <span className="text-lg font-extrabold text-emerald-400 mt-1 block">{bridge.systemSafetyFactor.toFixed(2)}</span>
            <span className="text-[9px] text-slate-500">Global Structural Margin</span>
          </div>
        </div>

        {/* Component Utilization Bars */}
        <div className="p-5 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Component-by-Component Demand vs Effective Capacity Matrix
          </h2>

          <div className="space-y-3 text-xs">
            {componentsList.map((comp) => {
              const utilPerc = Math.min(100, comp.utilizationRatio * 100);
              const isOverloaded = comp.utilizationRatio > 0.8;
              const isCritical = comp.utilizationRatio > 1.0;

              return (
                <div key={comp.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{comp.name} ({comp.id})</span>
                    <span className={`font-bold ${isCritical ? 'text-red-400' : isOverloaded ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {utilPerc.toFixed(1)}% Utilization (SF: {comp.safetyFactor.toFixed(2)})
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isCritical ? 'bg-red-500' : isOverloaded ? 'bg-amber-500' : 'bg-cyan-500'}`}
                      style={{ width: `${utilPerc}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Applied Demand: {formatKn(comp.demandKn)}</span>
                    <span>Effective Capacity: {formatKn(comp.effectiveCapacityKn)}</span>
                    <span>Stress: {formatMPa(comp.stressMPa)}</span>
                    <span>Deflection: {formatMm(comp.deformationMm)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
