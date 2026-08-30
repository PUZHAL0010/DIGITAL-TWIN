import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Gauge } from '../ui/Gauge';
import { RiskBadge, PriorityBadge } from '../ui/StatusBadge';
import { StructuralComponent, MaintenancePriority } from '../../types/bridge';
import { 
  Activity, 
  Wrench, 
  TrendingDown, 
  ArrowUpRight
} from 'lucide-react';
import { formatMPa, formatMm } from '../../utils/formatters';

interface BottomTelemetryProps {
  onOpenReport: () => void;
}

// Priority order for sorting: P1 is most urgent
const PRIORITY_ORDER: Record<MaintenancePriority, number> = {
  P1: 1, P2: 2, P3: 3, P4: 4, P5: 5,
};

/** Derive the top maintenance recommendation from live component data */
function getPrimaryRecommendation(
  components: Record<string, StructuralComponent>
): { title: string; suggestedAction: string; priority: MaintenancePriority } | null {
  const sorted = Object.values(components).sort(
    (a, b) => PRIORITY_ORDER[a.maintenancePriority] - PRIORITY_ORDER[b.maintenancePriority]
  );
  const top = sorted[0];
  if (!top) return null;

  const driver = top.riskDrivers.primary;
  const action = top.utilizationRatio > 0.9
    ? `Immediate load restriction & structural assessment required`
    : top.damage.corrosionPercentage > 50
    ? `Schedule corrosion treatment & section loss evaluation`
    : top.damage.crackSeverity > 60
    ? `Inject epoxy & monitor crack propagation rate`
    : `Perform detailed inspection and update maintenance schedule`;

  return {
    title: `${top.name} — ${driver}`,
    suggestedAction: action,
    priority: top.maintenancePriority,
  };
}

export const BottomTelemetry: React.FC<BottomTelemetryProps> = ({ onOpenReport }) => {
  const bridge = useSimulationStore(state => state.bridge);

  const primaryRec = getPrimaryRecommendation(bridge.components);

  const criticalCount = Object.values(bridge.components).filter(c => c.risk === 'CRITICAL').length;
  const highCount = Object.values(bridge.components).filter(c => c.risk === 'HIGH').length;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-4 flex items-center justify-between z-20 select-none text-xs font-mono">
      {/* Left: Overall Health Index Gauge & Risk */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Gauge
              value={bridge.overallHealth}
              size={44}
              strokeWidth={5}
              label=""
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                {bridge.overallHealth}% Health
              </span>
              <RiskBadge risk={bridge.overallRisk} size="sm" />
            </div>
            <div className="text-[10px] text-slate-400">
              {criticalCount > 0 ? (
                <span className="text-red-400 font-bold">{criticalCount} Critical Components</span>
              ) : highCount > 0 ? (
                <span className="text-amber-400">{highCount} High-Risk Elements</span>
              ) : (
                <span className="text-emerald-400">All Spans Stable</span>
              )}
            </div>
          </div>
        </div>

        {/* Global Stress & Max Deflection */}
        <div className="hidden md:flex items-center gap-6 pl-4 border-l border-slate-800 text-slate-300">
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Peak Stress</div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <Activity size={12} className="text-cyan-400" />
              <span>{formatMPa(bridge.peakStressMPa)}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 uppercase">Max Deflection</div>
            <div className="text-xs font-bold text-cyan-400 flex items-center gap-1">
              <TrendingDown size={12} className="text-cyan-400" />
              <span>{formatMm(bridge.maxDeformationMm)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center/Right: Dynamic AI Maintenance Recommendation */}
      {primaryRec && (
        <div
          onClick={onOpenReport}
          className="flex items-center gap-3 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all max-w-xl truncate group"
        >
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <Wrench size={14} />
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-xs truncate group-hover:text-cyan-400 transition-colors">
                {primaryRec.title}
              </span>
              <PriorityBadge priority={primaryRec.priority} />
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {primaryRec.suggestedAction}
            </div>
          </div>

          <ArrowUpRight size={14} className="text-slate-400 group-hover:text-cyan-400 flex-shrink-0" />
        </div>
      )}
    </div>
  );
};
