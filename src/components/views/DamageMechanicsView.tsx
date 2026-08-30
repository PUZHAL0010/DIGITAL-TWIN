import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Zap, ArrowRight, Activity, Layers, ShieldAlert } from 'lucide-react';

export const DamageMechanicsView: React.FC = () => {
  const bridge = useSimulationStore(state => state.bridge);
  const selectedComponentId = useSimulationStore(state => state.selectedComponentId);
  const comp = bridge.components[selectedComponentId || 'pier-p3'];
  const setActiveView = useSimulationStore(state => state.setActiveView);

  if (!comp) return null;

  return (
    <div className="absolute inset-0 bg-[#050608]/95 backdrop-blur-2xl z-20 overflow-y-auto p-6 text-slate-200 font-mono select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                Fracture Mechanics & Corrosion Degradation Lab
              </h1>
              <p className="text-xs text-slate-400">
                Linear Elastic Fracture Mechanics (LEFM) and Fickian chloride diffusion analysis for {comp.name}
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

        {/* Fracture Analysis Card */}
        <div className="p-5 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            <span>Linear Elastic Fracture Mechanics (LEFM) Assessment</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Stress Intensity (K_I)</span>
              <span className="text-lg font-extrabold text-cyan-300 mt-1 block">
                {comp.damage.stressIntensityFactorKI.toFixed(2)} MPa√m
              </span>
              <span className="text-[9px] text-slate-500">Formula: K_I = Y · σ · √(π·a)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Critical Toughness (K_Ic)</span>
              <span className="text-lg font-extrabold text-white mt-1 block">
                {comp.damage.fractureToughnessKIc.toFixed(2)} MPa√m
              </span>
              <span className="text-[9px] text-slate-500">Material Threshold</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Fracture Margin Ratio</span>
              <span className={`text-lg font-extrabold mt-1 block ${comp.damage.stressIntensityFactorKI >= comp.damage.fractureToughnessKIc ? 'text-red-400' : 'text-emerald-400'}`}>
                {((comp.damage.stressIntensityFactorKI / comp.damage.fractureToughnessKIc) * 100).toFixed(0)}% of K_Ic
              </span>
              <span className="text-[9px] text-slate-500">Unstable Fracture at 100%</span>
            </div>
          </div>
        </div>

        {/* Corrosion Section Loss Card */}
        <div className="p-5 rounded-2xl bg-[#0B0F14] border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers size={14} className="text-orange-400" />
            <span>Corrosion Section Loss & Chloride Ingress</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Original Section (A_0)</span>
              <span className="text-lg font-extrabold text-white mt-1 block">{comp.section.areaM2.toFixed(3)} m²</span>
              <span className="text-[9px] text-slate-500">I_0: {comp.section.momentOfInertiaM4.toFixed(4)} m⁴</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Effective Section (A_eff)</span>
              <span className="text-lg font-extrabold text-amber-400 mt-1 block">{comp.section.effectiveAreaM2.toFixed(3)} m²</span>
              <span className="text-[9px] text-slate-500">I_eff: {comp.section.effectiveMomentOfInertiaM4.toFixed(4)} m⁴</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Rebar Oxidation Loss</span>
              <span className="text-lg font-extrabold text-orange-400 mt-1 block">
                {(comp.damage.effectiveSectionLossRatio * 100).toFixed(1)}% Area Loss
              </span>
              <span className="text-[9px] text-slate-500">Chloride Depth: {comp.damage.chlorideIngressMm.toFixed(1)} mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
