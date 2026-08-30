import React from 'react';
import { SCENARIOS } from '../../data/scenarios';
import { useSimulationStore } from '../../state/useSimulationStore';
import { FailureScenarioType } from '../../types/simulation';
import { X, Play, Sparkles, CheckCircle2 } from 'lucide-react';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({ isOpen, onClose }) => {
  const activeScenarioId = useSimulationStore(state => state.activeScenarioId);
  const runScenario = useSimulationStore(state => state.runScenario);

  // Map ScenarioPreset string ids → FailureScenarioType for the store action.
  // Note: 'crack-propagation' maps to 'CORROSION' since pier cracking in this
  // project is driven by chloride-induced corrosion (not a standalone SHEAR scenario).
  const PRESET_TO_SCENARIO: Record<string, FailureScenarioType> = {
    'normal':                  'OVERLOAD',
    'heavy-traffic':           'OVERLOAD',
    'crack-propagation':       'CORROSION',
    'long-term-deterioration': 'CORROSION',
    'critical-failure':        'DEFERRED_MAINTENANCE',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono tracking-tight">
                What-If Structural Scenarios
              </h2>
              <p className="text-xs text-slate-400">
                Execute preset multi-hazard simulation profiles to evaluate 3D structural resilience.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: List of Scenarios */}
        <div className="p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {SCENARIOS.map((scenario) => {
            const mappedId = PRESET_TO_SCENARIO[scenario.id] ?? 'OVERLOAD';
            const isActive = activeScenarioId === mappedId;

            return (
              <div
                key={scenario.id}
                onClick={() => {
                  runScenario(mappedId);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-glow-cyan'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">
                      {scenario.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300">
                      {scenario.badge}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-cyan-400">
                        <CheckCircle2 size={12} /> ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">
                    {scenario.description}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mt-2">
                    <span className="text-cyan-400 font-semibold">Engineering Rationale:</span> {scenario.engineeringRationale}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runScenario(mappedId);
                      onClose();
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                        : 'bg-slate-800 text-white hover:bg-cyan-500 hover:text-slate-950'
                    }`}
                  >
                    <Play size={14} />
                    <span>Run Simulation</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
