import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { RiskBadge, PriorityBadge } from '../ui/StatusBadge';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  AlertTriangle,
  Layers
} from 'lucide-react';
import { formatMPa, formatMm, formatCurrencyUSD } from '../../utils/formatters';

import { MaintenanceRecommendation } from '../../types/simulation';
import { StructuralComponent, MaintenancePriority } from '../../types/bridge';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRIORITY_ORDER: Record<MaintenancePriority, number> = {
  P1: 1, P2: 2, P3: 3, P4: 4, P5: 5,
};

const INTERVENTION_COST: Record<MaintenancePriority, number> = {
  P1: 85000, P2: 52000, P3: 34000, P4: 18000, P5: 8000,
};

function deriveRecommendations(
  components: Record<string, StructuralComponent>
): MaintenanceRecommendation[] {
  return Object.values(components)
    .filter(c => c.maintenancePriority !== 'P5' || c.risk !== 'NORMAL')
    .sort((a, b) => PRIORITY_ORDER[a.maintenancePriority] - PRIORITY_ORDER[b.maintenancePriority])
    .slice(0, 6)
    .map(comp => {
      const driver = comp.riskDrivers.primary;
      const isCorrosion = comp.damage.corrosionPercentage > 50;
      const isCrack = comp.damage.crackSeverity > 60;
      const isOverload = comp.utilizationRatio > 0.85;

      const suggestedAction = isOverload
        ? 'Immediate load restriction, temporary shoring, and full structural assessment'
        : isCorrosion
        ? 'Apply CFRP wrapping and cathodic protection; evaluate section loss by core sampling'
        : isCrack
        ? 'Pressure-inject epoxy resin; install crack propagation gauges for monitoring'
        : 'Schedule detailed visual and NDE inspection within next maintenance window';

      const description = `${comp.name} presents ${driver.toLowerCase()} with a health index of ${comp.health}%. ` +
        `Current utilization ratio is ${(comp.utilizationRatio * 100).toFixed(0)}% of effective capacity. ` +
        `Crack severity: ${comp.damage.crackSeverity}%, Corrosion: ${comp.damage.corrosionPercentage}%.`;

      return {
        id: `rec-${comp.id}`,
        componentId: comp.id,
        componentName: comp.name,
        urgency: comp.maintenancePriority === 'P1' ? 'IMMEDIATE'
          : comp.maintenancePriority === 'P2' ? 'HIGH'
          : comp.maintenancePriority === 'P3' ? 'MEDIUM'
          : 'MONITOR',
        title: `${comp.name} — ${driver}`,
        description,
        suggestedAction,
        estimatedCostUSD: INTERVENTION_COST[comp.maintenancePriority],
        timeToFailureMonths: Math.max(1, Math.round((100 - comp.damage.crackSeverity) * 0.6)),
        priority: comp.maintenancePriority,
      } satisfies MaintenanceRecommendation;
    });
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const bridge = useSimulationStore(state => state.bridge);
  const params = useSimulationStore(state => state.params);
  const timeline = useSimulationStore(state => state.timeline);

  const recommendations = deriveRecommendations(bridge.components);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const reportData = {
      reportType: 'CRYONEX Structural Digital Twin Engineering Audit',
      generatedAt: new Date().toISOString(),
      simulatedYear: timeline.currentYear,
      asset: {
        id: bridge.id,
        name: bridge.name,
        code: bridge.assetCode,
        location: bridge.location,
      },
      simulationParameters: params,
      overallAssessment: {
        healthIndex: bridge.overallHealth,
        riskLevel: bridge.overallRisk,
        peakStressMPa: bridge.peakStressMPa,
        maxDeformationMm: bridge.maxDeformationMm,
      },
      components: Object.values(bridge.components),
      recommendations: recommendations,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CRYONEX_Audit_Report_${bridge.assetCode}_${timeline.currentYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalEstimatedCost = recommendations.reduce((acc, r) => acc + r.estimatedCostUSD, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                Structural Health Audit & Predictive Maintenance Report
              </h2>
              <p className="text-xs text-slate-400">
                Official SIH26158 Digital Twin Engineering Assessment Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors shadow-glow-cyan"
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Audit Document Layout */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-xs font-sans text-slate-200">
          {/* Executive Overview Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Infrastructure Asset</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{bridge.name}</span>
              <span className="text-[10px] text-cyan-400">{bridge.assetCode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Simulated Horizon</span>
              <span className="text-xs font-bold text-white mt-0.5 block">Year {timeline.currentYear}</span>
              <span className="text-[10px] text-slate-400">Baseline: 2026</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Health Index</span>
              <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{bridge.overallHealth}%</span>
              <RiskBadge risk={bridge.overallRisk} size="sm" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Peak Deflection / Stress</span>
              <span className="text-xs font-bold text-white mt-0.5 block">{formatMm(bridge.maxDeformationMm)}</span>
              <span className="text-[10px] text-amber-400">{formatMPa(bridge.peakStressMPa)}</span>
            </div>
          </div>

          {/* Component Integrity Matrix Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers size={14} className="text-cyan-400" />
              <span>Structural Component Health Matrix</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <th className="p-2.5">Component</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Health</th>
                    <th className="p-2.5">Stress</th>
                    <th className="p-2.5">Deformation</th>
                    <th className="p-2.5">Crack / Corr</th>
                    <th className="p-2.5">Risk</th>
                    <th className="p-2.5">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {Object.values(bridge.components).map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-2.5 font-bold text-slate-100">{comp.name}</td>
                      <td className="p-2.5 text-slate-400 uppercase text-[10px]">{comp.type}</td>
                      <td className="p-2.5 font-semibold text-cyan-300">{comp.health}%</td>
                      <td className="p-2.5 text-slate-200">{formatMPa(comp.stressMPa)}</td>
                      <td className="p-2.5 text-slate-200">{formatMm(comp.deformationMm)}</td>
                      <td className="p-2.5 text-slate-300">
                        {comp.damage.crackSeverity}% / {comp.damage.corrosionPercentage}%
                      </td>
                      <td className="p-2.5">
                        <RiskBadge risk={comp.risk} size="sm" />
                      </td>
                      <td className="p-2.5">
                        <PriorityBadge priority={comp.maintenancePriority} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Predictive Maintenance & Intervention Plan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-400" />
                <span>Recommended Engineering Interventions</span>
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400">
                Total Estimated Capex: {formatCurrencyUSD(totalEstimatedCost)}
              </span>
            </div>

            <div className="space-y-2.5">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{rec.title}</span>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      {formatCurrencyUSD(rec.estimatedCostUSD)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300">{rec.description}</p>

                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800/80 font-mono text-[10px] text-cyan-300">
                    <span className="text-slate-400 font-semibold">Suggested Action:</span> {rec.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
