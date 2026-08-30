import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { X, AlertTriangle, ShieldCheck, Activity, Zap, TrendingDown, Layers } from 'lucide-react';
import { RiskBadge } from '../ui/StatusBadge';

interface RiskExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskExplanationModal: React.FC<RiskExplanationModalProps> = ({ isOpen, onClose }) => {
  const selectedComponentId = useSimulationStore(state => state.selectedComponentId);
  const component = useSimulationStore(state => 
    selectedComponentId ? state.bridge.components[selectedComponentId] : state.bridge.components['pier-p3']
  );
  const bridge = useSimulationStore(state => state.bridge);

  if (!isOpen || !component) return null;

  const { riskDrivers } = component;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-mono">
      <div className="w-full max-w-2xl bg-[#050608] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-200">
        {/* Header */}
        <div className="p-4 bg-[#0B0F14] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight uppercase">
                Physics Risk Explanation (Root-Cause Audit)
              </h2>
              <p className="text-[10px] text-slate-400">
                Transparent breakdown of structural vulnerability for {component.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar text-xs">
          {/* Primary Cause Banner */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-400 uppercase font-bold">Primary Risk Trigger</div>
              <div className="text-sm font-bold text-white mt-0.5">{riskDrivers.primary}</div>
            </div>
            <RiskBadge risk={component.risk} size="md" />
          </div>

          {/* Root-Cause Drivers Breakdown */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Contribution to Structural Degradation
            </div>

            {/* 1. Demand / Capacity Utilization */}
            <div className="p-3 rounded-xl bg-[#0B0F14] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Activity size={14} className="text-cyan-400" />
                  <span>Structural Demand vs Capacity</span>
                </div>
                <span className="font-bold text-cyan-400">{riskDrivers.utilizationContribution}% weight</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: `${riskDrivers.utilizationContribution}%` }} />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                <span>Applied Demand: {component.demandKn.toFixed(0)} kN</span>
                <span>Effective Capacity: {component.effectiveCapacityKn.toFixed(0)} kN</span>
                <span>Utilization: {(component.utilizationRatio * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* 2. Fracture Severity */}
            <div className="p-3 rounded-xl bg-[#0B0F14] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Zap size={14} className="text-amber-400" />
                  <span>Fracture Mechanics (K_I / K_Ic)</span>
                </div>
                <span className="font-bold text-amber-400">{riskDrivers.crackContribution}% weight</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${riskDrivers.crackContribution}%` }} />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                <span>Crack Width: {component.damage.crackWidthMm.toFixed(1)} mm</span>
                <span>K_I: {component.damage.stressIntensityFactorKI.toFixed(2)} MPa√m</span>
                <span>Critical K_Ic: {component.damage.fractureToughnessKIc.toFixed(1)} MPa√m</span>
              </div>
            </div>

            {/* 3. Corrosion Section Loss */}
            <div className="p-3 rounded-xl bg-[#0B0F14] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Layers size={14} className="text-orange-400" />
                  <span>Corrosion & Section Loss (A_loss)</span>
                </div>
                <span className="font-bold text-orange-400">{riskDrivers.corrosionContribution}% weight</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full" style={{ width: `${riskDrivers.corrosionContribution}%` }} />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                <span>Corrosion: {component.damage.corrosionPercentage}%</span>
                <span>Section Loss Ratio: {(component.damage.effectiveSectionLossRatio * 100).toFixed(1)}%</span>
                <span>Chloride Depth: {component.damage.chlorideIngressMm.toFixed(1)} mm</span>
              </div>
            </div>

            {/* 4. Deformation Limit Exceedance */}
            <div className="p-3 rounded-xl bg-[#0B0F14] border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold">
                  <TrendingDown size={14} className="text-cyan-400" />
                  <span>Serviceability Deflection Limit</span>
                </div>
                <span className="font-bold text-cyan-400">{riskDrivers.deflectionContribution}% weight</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: `${riskDrivers.deflectionContribution}%` }} />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                <span>Deflection: {component.deformationMm.toFixed(2)} mm</span>
                <span>Serviceability Ratio: {component.deflectionRatio}</span>
                <span>Limit Threshold: L/800</span>
              </div>
            </div>
          </div>

          {/* Engineering Integrity Notice */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            <span className="text-cyan-400 font-bold">CRYONEX TRANSPARENCY PRINCIPLE:</span> All risk scores are calculated directly from physical demand equations, fracture intensity factors, and section loss integrals. No arbitrary or unexplained heuristic ratings are used.
          </div>
        </div>
      </div>
    </div>
  );
};
