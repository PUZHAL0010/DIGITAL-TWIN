import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Sliders, ArrowRight, Truck, Activity, Wind, Waves, Gauge, ShieldAlert } from 'lucide-react';
import { formatKn } from '../../utils/formatters';

export const SimulationStationView: React.FC = () => {
  const params = useSimulationStore(state => state.params);
  const setParam = useSimulationStore(state => state.setParam);
  const dynamicLoad = useSimulationStore(state => state.dynamicLoad);
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const triggerFailureSimulation = useSimulationStore(state => state.triggerFailureSimulation);

  return (
    <div className="absolute inset-0 bg-[#050608]/95 backdrop-blur-2xl z-20 overflow-y-auto p-6 text-slate-200 font-mono select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                Physics Simulation Engine & Dynamic Traffic Station
              </h1>
              <p className="text-xs text-slate-400">
                Configure live axle loads, dynamic amplification factors (DAF), and environmental hazard stresses.
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

        {/* Live Dynamic Live-Load Telemetry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Total Live Traffic Load</span>
            <span className="text-lg font-extrabold text-white mt-1 block">{formatKn(dynamicLoad.staticTotalKn)}</span>
            <span className="text-[9px] text-slate-500">{dynamicLoad.activeVehiclesCount} Active Vehicles</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Dynamic Amplification</span>
            <span className="text-lg font-extrabold text-cyan-400 mt-1 block">{(params.dynamicAmplificationFactor * 100).toFixed(0)}% DAF</span>
            <span className="text-[9px] text-slate-500">P_dyn = P_stat · (1 + DAF)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Amplified Dynamic Total</span>
            <span className="text-lg font-extrabold text-emerald-400 mt-1 block">{formatKn(dynamicLoad.totalDynamicLoadKn)}</span>
            <span className="text-[9px] text-slate-500">Combined Live Superposition</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Peak Axle Point Load</span>
            <span className="text-lg font-extrabold text-amber-400 mt-1 block">{formatKn(dynamicLoad.peakPointLoadKn)}</span>
            <span className="text-[9px] text-slate-500">Local Span Concentration</span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dynamic Amplification Factor (DAF) */}
          <div className="p-4 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Truck size={14} className="text-cyan-400" />
                <span>Dynamic Amplification Factor (DAF)</span>
              </span>
              <span className="text-cyan-400 font-bold">{(params.dynamicAmplificationFactor * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={0.60}
              step={0.05}
              value={params.dynamicAmplificationFactor}
              onChange={(e) => setParam('dynamicAmplificationFactor', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Accounts for vehicle impact vibrations and surface roughness dynamic shock.
            </p>
          </div>

          {/* Crack Network Severity */}
          <div className="p-4 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Activity size={14} className="text-amber-400" />
                <span>Crack & Fracture Severity</span>
              </span>
              <span className="text-amber-400 font-bold">{params.crackSeverityPercentage}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={params.crackSeverityPercentage}
              onChange={(e) => setParam('crackSeverityPercentage', parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Drives Linear Elastic Fracture Mechanics (LEFM) stress intensity K_I.
            </p>
          </div>

          {/* Corrosion & Rebar Oxidation */}
          <div className="p-4 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Waves size={14} className="text-orange-400" />
                <span>Corrosion & Section Loss</span>
              </span>
              <span className="text-orange-400 font-bold">{params.corrosionPercentage}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={params.corrosionPercentage}
              onChange={(e) => setParam('corrosionPercentage', parseInt(e.target.value))}
              className="w-full accent-orange-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Reduces effective cross-sectional area A_eff and moment of inertia I_eff.
            </p>
          </div>

          {/* Environmental Marine Stress */}
          <div className="p-4 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Wind size={14} className="text-cyan-400" />
                <span>Environmental / Marine Stress</span>
              </span>
              <span className="text-cyan-400 font-bold">{params.environmentalStress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={params.environmentalStress}
              onChange={(e) => setParam('environmentalStress', parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Accelerates chloride diffusion and carbonation de-passivation rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
