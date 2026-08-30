import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Database, ArrowRight, Layers, Tag } from 'lucide-react';
import { formatKn, formatMPa } from '../../utils/formatters';

export const EngineeringDataView: React.FC = () => {
  const bridge = useSimulationStore(state => state.bridge);
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const selectComponent = useSimulationStore(state => state.selectComponent);
  const componentsList = Object.values(bridge.components);

  return (
    <div className="absolute inset-0 bg-[#050608]/95 backdrop-blur-2xl z-20 overflow-y-auto p-6 text-slate-200 font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                Structural Engineering Data & Provenance Catalog
              </h1>
              <p className="text-xs text-slate-400">
                Complete engineering parameters, section properties, SI units, and provenance status.
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

        {/* Component Catalog Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0B0F14]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="p-3">Component ID</th>
                <th className="p-3">Material Grade</th>
                <th className="p-3">Area (m²) / A_eff</th>
                <th className="p-3">Inertia (m⁴) / I_eff</th>
                <th className="p-3">E (GPa)</th>
                <th className="p-3">Mass (kg)</th>
                <th className="p-3">Yield (MPa)</th>
                <th className="p-3">Data Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {componentsList.map((comp) => (
                <tr
                  key={comp.id}
                  onClick={() => {
                    selectComponent(comp.id);
                    setActiveView('DIGITAL_TWIN');
                  }}
                  className="hover:bg-slate-900/40 cursor-pointer transition-colors"
                >
                  <td className="p-3">
                    <div className="font-bold text-white">{comp.name}</div>
                    <div className="text-[10px] text-slate-400">{comp.id} • {comp.lengthMeters.toFixed(1)}m</div>
                  </td>
                  <td className="p-3 text-slate-300">{comp.material.name}</td>
                  <td className="p-3">
                    <span className="font-bold text-white">{comp.section.areaM2.toFixed(3)}</span>
                    <span className="text-slate-400 text-[10px]"> (eff: {comp.section.effectiveAreaM2.toFixed(3)})</span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-white">{comp.section.momentOfInertiaM4.toFixed(4)}</span>
                    <span className="text-slate-400 text-[10px]"> (eff: {comp.section.effectiveMomentOfInertiaM4.toFixed(4)})</span>
                  </td>
                  <td className="p-3 font-bold text-cyan-300">{comp.material.youngsModulusGPa.toFixed(1)} GPa</td>
                  <td className="p-3 text-slate-300">{comp.massKg.toLocaleString()} kg</td>
                  <td className="p-3 font-bold text-white">{formatMPa(comp.material.yieldStrengthMPa)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {comp.dataStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
