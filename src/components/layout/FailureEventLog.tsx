import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Terminal, ChevronDown, ChevronUp, X } from 'lucide-react';

export const FailureEventLog: React.FC = () => {
  const simulationEvents = useSimulationStore(state => state.simulationEvents);
  const isEventLogOpen = useSimulationStore(state => state.isEventLogOpen);
  const toggleEventLog = useSimulationStore(state => state.toggleEventLog);
  const isPresentationMode = useSimulationStore(state => state.isPresentationMode);

  if (isPresentationMode) return null;

  return (
    <div className="absolute bottom-20 right-4 z-20 font-mono text-xs select-none">
      {!isEventLogOpen ? (
        /* Collapsed Tiny Pill Indicator */
        <button
          onClick={toggleEventLog}
          className="flex items-center gap-2 bg-[#05070A]/90 backdrop-blur-xl border border-slate-800/80 px-3 py-1.5 rounded-2xl shadow-2xl hover:border-slate-700 transition-all text-slate-300 hover:text-white"
          title="Open Simulation Event Log"
        >
          <Terminal size={12} className="text-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {simulationEvents.length > 0 ? `${simulationEvents.length} Events` : 'Event Log'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </button>
      ) : (
        /* Expanded Floating Event Stream Panel */
        <div className="w-72 sm:w-80 bg-[#05070A]/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="p-2 bg-[#080B10] border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[10px] uppercase">
              <Terminal size={12} />
              <span>Simulation Event Stream</span>
            </div>
            <button
              onClick={toggleEventLog}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X size={12} />
            </button>
          </div>

          {/* Stream list */}
          <div className="p-2.5 max-h-48 overflow-y-auto space-y-1.5 custom-scrollbar text-[10px]">
            {simulationEvents.slice(-6).reverse().map((evt) => (
              <div
                key={evt.id}
                className={`p-1.5 rounded-lg border leading-tight ${
                  evt.severity === 'CRITICAL'
                    ? 'bg-red-950/30 border-red-500/40 text-red-200'
                    : evt.severity === 'WARNING'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between text-slate-400 font-semibold mb-0.5">
                  <span>{evt.timestampStr}</span>
                  <span className="text-[9px] uppercase">{evt.category}</span>
                </div>
                <div>{evt.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
