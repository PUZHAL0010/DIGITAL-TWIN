import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { X, FileText, Download, Printer, ShieldCheck, AlertTriangle } from 'lucide-react';
import { formatMPa, formatMm, formatKn } from '../../utils/formatters';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const bridge = useSimulationStore(state => state.bridge);
  const timeline = useSimulationStore(state => state.timeline);
  const interventions = useSimulationStore(state => state.interventions);
  const componentsList = Object.values(bridge.components);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none font-mono">
      <div className="w-full max-w-4xl bg-[#050608] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-200 text-xs">
        {/* Header */}
        <div className="p-4 bg-[#0B0F14] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight">
                CRYONEX Structural Engineering Assessment Report
              </h2>
              <p className="text-[10px] text-slate-400">
                Asset: {bridge.assetCode} • {bridge.name} • Horizon Year {Math.floor(timeline.currentYear)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                  assetCode: bridge.assetCode,
                  assetName: bridge.name,
                  simulationYear: Math.floor(timeline.currentYear),
                  overallHealth: bridge.overallHealth,
                  overallRisk: bridge.overallRisk,
                  peakStressMPa: bridge.peakStressMPa,
                  maxDeformationMm: bridge.maxDeformationMm,
                  safetyFactor: bridge.systemSafetyFactor,
                  components: componentsList.map(c => ({
                    id: c.id,
                    name: c.name,
                    health: c.health,
                    demandKn: c.demandKn,
                    capacityKn: c.effectiveCapacityKn,
                    utilization: c.utilizationRatio,
                    risk: c.risk,
                    stressMPa: c.stressMPa,
                    deflectionMm: c.deformationMm,
                  })),
                  interventions,
                }, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute('href', dataStr);
                downloadAnchor.setAttribute('download', `CRYONEX_Report_${bridge.assetCode}_${Math.floor(timeline.currentYear)}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
            >
              <Download size={13} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs"
            >
              <Printer size={13} />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-[#0B0F14] border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              1. Executive Structural Health Summary
            </div>
            <p className="text-slate-300 leading-relaxed">
              The physics digital twin simulation for {bridge.name} evaluates an asset health index of{' '}
              <strong className="text-white">{bridge.overallHealth}%</strong> with an overall risk classification of{' '}
              <strong className="text-amber-400">{bridge.overallRisk}</strong>. Maximum elastic deflection is{' '}
              <strong className="text-white">{formatMm(bridge.maxDeformationMm)}</strong> under dynamic traffic live loads (Safety Factor: {bridge.systemSafetyFactor.toFixed(2)}).
            </p>
          </div>

          {/* Component Health & Risk Table */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Critical Structural Component Status
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="p-2.5">Component</th>
                    <th className="p-2.5">Health</th>
                    <th className="p-2.5">Demand (kN)</th>
                    <th className="p-2.5">Capacity (kN)</th>
                    <th className="p-2.5">Utilization</th>
                    <th className="p-2.5">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {componentsList.map((c) => (
                    <tr key={c.id}>
                      <td className="p-2.5 font-bold">{c.name}</td>
                      <td className="p-2.5">{c.health}%</td>
                      <td className="p-2.5">{formatKn(c.demandKn)}</td>
                      <td className="p-2.5">{formatKn(c.effectiveCapacityKn)}</td>
                      <td className="p-2.5 font-bold text-cyan-300">{(c.utilizationRatio * 100).toFixed(1)}%</td>
                      <td className="p-2.5 font-bold">{c.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maintenance Recommendations */}
          <div className="p-4 rounded-xl bg-[#0B0F14] border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              3. Recommended Predictive Interventions
            </div>
            <div className="space-y-1 text-slate-300">
              {interventions.map(intv => (
                <div key={intv.id} className="flex justify-between py-1 border-b border-slate-800/60">
                  <span>• {intv.actionType.replace('_', ' ')} on {intv.targetComponentId} (Scheduled: {intv.yearScheduled})</span>
                  <span className="font-bold text-white">${intv.costUSD.toLocaleString()} USD ({intv.applied ? 'APPLIED' : 'RECOMMENDED'})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            <span className="text-cyan-400 font-bold">DISCLAIMER:</span> This report was generated by the CRYONEX Physics-Informed Digital Twin simulation prototype for the Smart India Hackathon (SIH26158). It integrates deterministic Euler-Bernoulli flexural mechanics and Linear Elastic Fracture Mechanics (LEFM).
          </div>
        </div>
      </div>
    </div>
  );
};
