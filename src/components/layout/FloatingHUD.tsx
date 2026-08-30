import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { RiskBadge } from '../ui/StatusBadge';
import { formatMm, formatMPa } from '../../utils/formatters';
import { Eye, EyeOff, Activity, HelpCircle } from 'lucide-react';

interface FloatingHUDProps {
  onOpenWhyModal: () => void;
}

export const FloatingHUD: React.FC<FloatingHUDProps> = ({ onOpenWhyModal }) => {
  const bridge = useSimulationStore(state => state.bridge);
  const lifecycleState = useSimulationStore(state => state.lifecycleState);
  const isHudVisible = useSimulationStore(state => state.isHudVisible);
  const toggleHud = useSimulationStore(state => state.toggleHud);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);
  const deformationScale = useSimulationStore(state => state.deformationScale);
  const viewMode3D = useSimulationStore(state => state.viewMode3D);

  if (isPresentationMode) return null;

  if (!isHudVisible) {
    return (
      <button
        onClick={toggleHud}
        className="absolute bottom-20 left-4 z-20 p-2 rounded-xl bg-[#05070A]/85 backdrop-blur-xl border border-slate-800 text-slate-400 hover:text-white shadow-2xl transition-all font-mono text-xs flex items-center gap-1.5 pointer-events-auto"
        title="Show Status HUD"
      >
        <Eye size={13} />
        <span className="text-[10px] font-bold">HUD</span>
      </button>
    );
  }

  const getLifecycleColor = () => {
    switch (lifecycleState) {
      case 'BASELINE': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'AGING': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'DAMAGE_DEVELOPMENT': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CRITICAL': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'COLLAPSING':
      case 'FAILURE_TRIGGERED':
      case 'POST_FAILURE': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="absolute bottom-20 left-4 z-20 flex items-center gap-2 bg-[#05070A]/90 backdrop-blur-2xl border border-slate-800/80 px-3.5 py-1.5 rounded-2xl shadow-2xl font-mono text-xs select-none pointer-events-auto">
      {/* 0. Lifecycle State Machine Badge */}
      <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800/80">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getLifecycleColor()}`}>
          {lifecycleState.replace('_', ' ')}
        </span>
      </div>

      {/* 1. Health Index */}
      <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800/80">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-[10px] text-slate-400 uppercase">HEALTH</span>
        <span className="text-xs font-extrabold text-white">{bridge.overallHealth}%</span>
      </div>

      {/* 2. Utilization */}
      <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800/80">
        <span className="text-[10px] text-slate-400 uppercase">UTIL</span>
        <span className={`text-xs font-extrabold ${bridge.overallUtilization > 0.8 ? 'text-red-400' : 'text-cyan-400'}`}>
          {(bridge.overallUtilization * 100).toFixed(0)}%
        </span>
      </div>

      {/* 3. Max Deflection */}
      <div className="hidden sm:flex items-center gap-1.5 pr-2.5 border-r border-slate-800/80">
        <span className="text-[10px] text-slate-400 uppercase">DEF</span>
        <span className="text-xs font-extrabold text-white">
          {formatMm(bridge.maxDeformationMm)}
        </span>
      </div>

      {/* 4. Peak Stress */}
      <div className="hidden md:flex items-center gap-1.5 pr-2.5 border-r border-slate-800/80">
        <span className="text-[10px] text-slate-400 uppercase">STRESS</span>
        <span className="text-xs font-extrabold text-white">{formatMPa(bridge.peakStressMPa)}</span>
      </div>

      {/* 5. Risk Badge & Why Modal */}
      <div className="flex items-center gap-1.5">
        <RiskBadge risk={bridge.overallRisk} size="sm" />
        <button
          onClick={onOpenWhyModal}
          className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-0.5 ml-0.5"
          title="Root-Cause Risk Explanation"
        >
          <HelpCircle size={11} />
          <span>Why?</span>
        </button>
      </div>

      {/* Minimize Toggle */}
      <button
        onClick={toggleHud}
        className="text-slate-500 hover:text-slate-300 p-0.5 ml-1 transition-colors"
        title="Hide Status HUD"
      >
        <EyeOff size={12} />
      </button>
    </div>
  );
};
