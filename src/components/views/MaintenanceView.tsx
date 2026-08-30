import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Wrench, ArrowRight, TrendingUp, AlertTriangle, ShieldCheck, CheckCircle2, DollarSign } from 'lucide-react';
import { formatCurrencyUSD } from '../../utils/formatters';

export const MaintenanceView: React.FC = () => {
  const comparativeTrajectories = useSimulationStore(state => state.comparativeTrajectories);
  const interventions = useSimulationStore(state => state.interventions);
  const toggleIntervention = useSimulationStore(state => state.toggleIntervention);
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const setTimelineYear = useSimulationStore(state => state.setTimelineYear);

  const totalCost = interventions.filter(i => i.applied).reduce((acc, curr) => acc + curr.costUSD, 0);

  return (
    <div className="absolute inset-0 bg-[#050608]/95 backdrop-blur-2xl z-20 overflow-y-auto p-6 text-slate-200 font-mono select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Wrench size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                Predictive Maintenance & Optimal Intervention Window
              </h1>
              <p className="text-xs text-slate-400">
                "Failure is the end of the trajectory. CRYONEX is designed to intervene before the trajectory reaches failure."
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

        {/* The 6-Stage Intervention Spectrum */}
        <div className="p-4 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Lifecycle Deterioration Spectrum & Optimal Intervention Window
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">1. HEALTHY</span>
              <span className="text-xs font-extrabold text-white block">100 - 85%</span>
              <span className="text-[9px] text-slate-400">Elastic nominal</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/40 space-y-1">
              <span className="text-[10px] text-blue-400 font-bold uppercase">2. MONITOR</span>
              <span className="text-xs font-extrabold text-white block">85 - 70%</span>
              <span className="text-[9px] text-slate-400">Micro-crazing</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase">3. WARNING</span>
              <span className="text-xs font-extrabold text-white block">70 - 55%</span>
              <span className="text-[9px] text-slate-400">Chloride ingress</span>
            </div>
            {/* The Intervention Window Core */}
            <div className="p-2.5 rounded-xl bg-cyan-950/60 border-2 border-cyan-400 shadow-glow-cyan space-y-1 transform scale-105">
              <span className="text-[10px] text-cyan-300 font-extrabold uppercase animate-pulse">4. INTERVENE</span>
              <span className="text-xs font-extrabold text-cyan-200 block">55 - 45%</span>
              <span className="text-[9px] text-cyan-300 font-bold">CRYONEX TARGET</span>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/40 space-y-1">
              <span className="text-[10px] text-orange-400 font-bold uppercase">5. CRITICAL</span>
              <span className="text-xs font-extrabold text-white block">45 - 25%</span>
              <span className="text-[9px] text-slate-400">Rebar section loss</span>
            </div>
            <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-500/40 space-y-1">
              <span className="text-[10px] text-red-400 font-bold uppercase">6. FAILURE</span>
              <span className="text-xs font-extrabold text-white block">&lt; 25%</span>
              <span className="text-[9px] text-slate-400">Plastic collapse</span>
            </div>
          </div>
        </div>

        {/* Interactive Maintenance Interventions Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Wrench size={14} className="text-cyan-400" />
              <span>Available Engineering Interventions (Configure Trajectory)</span>
            </h2>
            <span className="text-xs font-bold text-emerald-400">
              Total Capex: {formatCurrencyUSD(totalCost)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {interventions.map((intv) => (
              <div
                key={intv.id}
                onClick={() => toggleIntervention(intv.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 space-y-2 ${
                  intv.applied
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-glow-cyan'
                    : 'bg-[#0B0F14] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{intv.actionType.replace('_', ' ')}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${intv.applied ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    {intv.applied ? 'APPLIED' : 'DISABLED'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Target Component: <span className="text-slate-200 font-bold">{intv.targetComponentId}</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-slate-800 text-slate-300">
                  <div>Capacity Restored: <span className="text-emerald-400 font-bold">+{intv.capacityRestorationPercentage}%</span></div>
                  <div>Cost: <span className="text-white font-bold">{formatCurrencyUSD(intv.costUSD)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparative Trajectories Matrix: With vs Without Maintenance */}
        <div className="p-4 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-400" />
              <span>Comparative Trajectories: Without vs With Maintenance</span>
            </h2>
            <span className="text-[10px] text-slate-400">Continuous 50-Year Lifecycle Forecast (2026 → 2076)</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="p-2.5">Year</th>
                  <th className="p-2.5 text-red-400">Without Maint. Health</th>
                  <th className="p-2.5 text-red-400">Without Capacity (kN)</th>
                  <th className="p-2.5 text-emerald-400">With Maint. Health</th>
                  <th className="p-2.5 text-emerald-400">With Capacity (kN)</th>
                  <th className="p-2.5">Intervention Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {comparativeTrajectories.map((pt) => {
                  const healthGain = pt.healthWithMaintenance - pt.healthWithoutMaintenance;
                  return (
                    <tr
                      key={pt.year}
                      onClick={() => {
                        setTimelineYear(pt.year);
                        setActiveView('DIGITAL_TWIN');
                      }}
                      className="hover:bg-slate-900/40 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 font-bold text-white">Year {pt.year}</td>
                      <td className="p-2.5 text-red-400 font-bold">{pt.healthWithoutMaintenance}% ({pt.riskWithout})</td>
                      <td className="p-2.5 text-slate-400">{pt.capacityWithoutKn.toLocaleString()} kN</td>
                      <td className="p-2.5 text-emerald-400 font-bold">{pt.healthWithMaintenance}% ({pt.riskWith})</td>
                      <td className="p-2.5 text-slate-200">{pt.capacityWithKn.toLocaleString()} kN</td>
                      <td className="p-2.5 text-cyan-400 font-bold">+{healthGain}% Health</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
