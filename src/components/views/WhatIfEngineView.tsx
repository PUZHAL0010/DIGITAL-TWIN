import React from 'react';
import { useSimulationStore, SCENARIOS_DEFINITIONS } from '../../state/useSimulationStore';
import { FailureScenarioType } from '../../types/simulation';
import { Sparkles, ArrowRight, Truck, Waves, Clock, Anchor, Activity, Ship, Play, AlertOctagon } from 'lucide-react';

export const WhatIfEngineView: React.FC = () => {
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const runScenario = useSimulationStore(state => state.runScenario);
  const triggerFailureSimulation = useSimulationStore(state => state.triggerFailureSimulation);

  const scenarioCards: {
    id: FailureScenarioType;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'CORROSION',
      icon: <Waves size={20} className="text-orange-400" />,
      color: 'border-orange-500/40 hover:border-orange-500',
    },
    {
      id: 'OVERLOAD',
      icon: <Truck size={20} className="text-amber-400" />,
      color: 'border-amber-500/40 hover:border-amber-500',
    },
    {
      id: 'SHIP_COLLISION',
      icon: <Ship size={20} className="text-red-400" />,
      color: 'border-red-500/40 hover:border-red-500',
    },
    {
      id: 'SCOUR',
      icon: <Anchor size={20} className="text-sky-400" />,
      color: 'border-sky-500/40 hover:border-sky-500',
    },
    {
      id: 'DEFERRED_MAINTENANCE',
      icon: <Clock size={20} className="text-cyan-400" />,
      color: 'border-cyan-500/40 hover:border-cyan-500',
    },
    {
      id: 'SEISMIC',
      icon: <Activity size={20} className="text-purple-400" />,
      color: 'border-purple-500/40 hover:border-purple-500',
    },
  ];

  const handleRunDegradation = (scenarioId: FailureScenarioType) => {
    runScenario(scenarioId);
  };

  const handleRunCollapse = (scenarioId: FailureScenarioType) => {
    runScenario(scenarioId);
    const def = SCENARIOS_DEFINITIONS[scenarioId];
    triggerFailureSimulation(scenarioId, def.affectedComponents[0], def.mechanism);
  };

  return (
    <div className="absolute inset-0 bg-[#000000]/95 backdrop-blur-2xl z-20 overflow-y-auto p-6 text-slate-200 font-mono select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                What-If Infrastructure Scenario Engine (50-Year Horizon)
              </h1>
              <p className="text-xs text-slate-400">
                Execute physics-grounded structural simulations. Every scenario calculates progressive degradation, dynamic limit states, and distinct 3D failure kinematics.
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

        {/* 6 Scenario Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarioCards.map(({ id, icon, color }) => {
            const sc = SCENARIOS_DEFINITIONS[id];
            return (
              <div
                key={id}
                className={`p-4 rounded-2xl bg-[#05070A] border ${color} transition-all duration-200 flex flex-col justify-between space-y-3 shadow-xl`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {icon}
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {sc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-tight">{sc.name}</h3>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="p-2 rounded-lg bg-[#080B10] border border-slate-800 space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Causal Mechanism:</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{sc.mechanism}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-[#080B10] border border-slate-800 space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Affected Components:</span>
                      <p className="text-cyan-300 text-[11px] font-semibold">{sc.affectedComponents.join(', ')}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-[#080B10] border border-slate-800 space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block">Failure Criterion:</span>
                      <p className="text-amber-300 text-[10px] font-semibold">{sc.failureCriterionDescription}</p>
                    </div>

                    {/* Limit State Year & 50-Year Health Comparison */}
                    <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
                      <div>
                        <span className="text-slate-500">Limit State: </span>
                        <span className="text-amber-400 font-bold">Year {sc.expectedFailureYear}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">50-Yr Residual: </span>
                        <span className="text-red-400 font-bold">{sc.scenarioHealth50Years}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dual Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => handleRunDegradation(id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold transition-all"
                    title="Initialize clean scenario & run 50-year timeline degradation"
                  >
                    <Play size={12} className="text-cyan-400" />
                    <span>Run Timeline</span>
                  </button>

                  <button
                    onClick={() => handleRunCollapse(id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-200 text-[11px] font-bold transition-all shadow-glow-red"
                    title="Simulate immediate kinematic structural collapse"
                  >
                    <AlertOctagon size={12} className="text-red-400" />
                    <span>Sim Failure</span>
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
