import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { History, BookOpen, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';

export const HistoricalCaseView: React.FC = () => {
  const historicalCase = useSimulationStore(state => state.historicalCase);
  const setTimelineYear = useSimulationStore(state => state.setTimelineYear);
  const setActiveView = useSimulationStore(state => state.setActiveView);
  const triggerFailureSimulation = useSimulationStore(state => state.triggerFailureSimulation);

  return (
    <div className="absolute inset-0 bg-[#050608]/95 backdrop-blur-2xl z-20 overflow-y-auto p-6 text-slate-200 font-mono select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <History size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                {historicalCase.title}
              </h1>
              <p className="text-xs text-slate-400">
                {historicalCase.subtitle} • {historicalCase.location}
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

        {/* Mandatory Forensic Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 text-amber-200 text-xs leading-relaxed flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300 uppercase tracking-wider mb-1">
              Methodological Separation & Forensic Research Notice
            </div>
            <p>{historicalCase.disclaimer}</p>
          </div>
        </div>

        {/* Asset Historical Specifications */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Lead Designer</span>
            <span className="font-bold text-white mt-1 block">{historicalCase.designer}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Structural Typology</span>
            <span className="font-bold text-white mt-1 block">{historicalCase.designType}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Construction Period</span>
            <span className="font-bold text-white mt-1 block">{historicalCase.constructionYears}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0F14] border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Documented Casualties</span>
            <span className="font-bold text-red-400 mt-1 block">{historicalCase.casualtiesCount} Fatalities</span>
          </div>
        </div>

        {/* Chronological Milestone Timeline */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <BookOpen size={14} className="text-cyan-400" />
            <span>Chronological Engineering Milestones</span>
          </h2>

          <div className="space-y-3">
            {historicalCase.milestones.map((m, idx) => {
              const isFact = m.category === 'FACT';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isFact
                      ? 'bg-[#0B0F14] border-slate-800 hover:border-slate-700'
                      : 'bg-cyan-950/20 border-cyan-500/40 shadow-glow-cyan'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">
                        {m.year} • {m.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          isFact
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                        }`}
                      >
                        {isFact ? 'VERIFIED HISTORICAL FACT' : 'CRYONEX SIMULATION OUTPUT'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setTimelineYear(m.year);
                        setActiveView('DIGITAL_TWIN');
                        if (m.year === 2018) triggerFailureSimulation('DEFERRED_MAINTENANCE', 'cable-stay-c3', 'Stay Tendon Fatigue Severance');
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs transition-colors"
                    >
                      Jump to Year {m.year}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">{m.description}</p>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <div>
                      <span className="text-cyan-400 font-semibold">Engineering Mechanism:</span> {m.engineeringDetails}
                    </div>
                    {m.verifiedSource && (
                      <div className="text-[10px] text-slate-500">
                        <span className="text-slate-400 font-semibold">Source Reference:</span> {m.verifiedSource}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Sources & Peer-Reviewed Literature */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Verified Academic Literature & Inquiry Sources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {historicalCase.sources.map((src, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#0B0F14] border border-slate-800 space-y-1 text-[11px]">
                <div className="font-bold text-white">{src.title}</div>
                <div className="text-slate-400">{src.authors} ({src.year})</div>
                <div className="text-slate-500 text-[10px]">{src.publisher}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
