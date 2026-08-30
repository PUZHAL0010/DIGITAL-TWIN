import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { RiskBadge, PriorityBadge } from '../ui/StatusBadge';
import { Gauge } from '../ui/Gauge';
import { Slider } from '../ui/Slider';
import { 
  X, 
  Activity, 
  Layers, 
  AlertTriangle, 
  Cpu
} from 'lucide-react';
import { formatMPa, formatMm, formatKn } from '../../utils/formatters';

export const ComponentInspector: React.FC = () => {
  const selectedComponentId = useSimulationStore(state => state.selectedComponentId);
  const component = useSimulationStore(state => 
    selectedComponentId ? state.bridge.components[selectedComponentId] : null
  );
  const selectComponent = useSimulationStore(state => state.selectComponent);
  const setParam = useSimulationStore(state => state.setParam);
  const crackParam = useSimulationStore(state => state.params.crackSeverityPercentage);
  const corrosionParam = useSimulationStore(state => state.params.corrosionPercentage);

  if (!component) return null;

  return (
    <div className="absolute top-20 left-6 z-20 w-80 sm:w-96 bg-slate-950/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-slate-100 font-sans animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu size={16} />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-tight text-white uppercase">
              {component.name}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              ID: {component.id} | Type: {component.type.toUpperCase()}
            </div>
          </div>
        </div>

        <button
          onClick={() => selectComponent(null)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Inspector"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar text-xs">
        {/* Health & Risk Hero Row */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <Gauge
            value={component.health}
            size={84}
            strokeWidth={8}
            label="HEALTH"
          />

          <div className="space-y-2 flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Risk Level:</span>
              <RiskBadge risk={component.risk} size="sm" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Priority:</span>
              <PriorityBadge priority={component.maintenancePriority} />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Span L/Ratio: <span className="text-cyan-400 font-semibold">{component.deflectionRatio}</span>
            </div>
          </div>
        </div>

        {/* Live Structural Telemetry Grid */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={12} className="text-cyan-400" />
            <span>Structural Response</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 font-mono">
              <div className="text-[10px] text-slate-400">Von Mises Stress</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {formatMPa(component.stressMPa)}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Yield: {component.material.yieldStrengthMPa} MPa
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 font-mono">
              <div className="text-[10px] text-slate-400">3D Deformation</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">
                {formatMm(component.deformationMm)}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">
                Applied Load: {formatKn(component.appliedForceKn)}
              </div>
            </div>
          </div>
        </div>

        {/* Damage Severity Metrics */}
        <div className="space-y-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-400" />
            <span>Damage & Fracture State</span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">Crack Severity:</span>
              <span className="font-semibold text-amber-400">{component.damage.crackSeverity}%</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">Crack Dimensions:</span>
              <span className="text-slate-200">
                {component.damage.crackWidthMm.toFixed(1)}mm × {component.damage.crackLengthMeters.toFixed(2)}m
              </span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-800/60">
              <span className="text-slate-400">Corrosion Level:</span>
              <span className="font-semibold text-orange-400">{component.damage.corrosionPercentage}%</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Rebar Exposed:</span>
              <span className={component.damage.rebarExposure ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                {component.damage.rebarExposure ? 'YES (CRITICAL)' : 'NO'}
              </span>
            </div>
          </div>
        </div>

        {/* Material & Engineering Spec */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={12} className="text-cyan-400" />
            <span>Material Properties</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1 font-mono text-[10px] text-slate-300">
            <div><span className="text-slate-400">Grade:</span> {component.material.name} ({component.material.type})</div>
            <div><span className="text-slate-400">Young's Modulus E:</span> {component.material.youngsModulusGPa} GPa</div>
            <div><span className="text-slate-400">Safety Factor:</span> <span className={component.safetyFactor < 1.5 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{component.safetyFactor.toFixed(2)}</span></div>
          </div>
        </div>

        {/* Interactive Local Damage Adjusters */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            Simulate Component Damage
          </div>
          <Slider
            label="Local Crack Severity"
            value={crackParam}
            accentColor="amber"
            onChange={(val) => setParam('crackSeverityPercentage', val)}
          />
          <Slider
            label="Local Corrosion Depth"
            value={corrosionParam}
            accentColor="red"
            onChange={(val) => setParam('corrosionPercentage', val)}
          />
        </div>
      </div>
    </div>
  );
};
