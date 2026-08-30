import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { formatMPa } from '../../utils/formatters';

export const BottomTimeline: React.FC = () => {
  const timeline = useSimulationStore(state => state.timeline);
  const bridge = useSimulationStore(state => state.bridge);
  const lifecycleState = useSimulationStore(state => state.lifecycleState);
  const playTimeline = useSimulationStore(state => state.playTimeline);
  const pauseTimeline = useSimulationStore(state => state.pauseTimeline);
  const stepTimeline = useSimulationStore(state => state.stepTimeline);
  const setTimelineYear = useSimulationStore(state => state.setTimelineYear);
  const setPlaybackSpeed = useSimulationStore(state => state.setPlaybackSpeed);
  const resetSimulation = useSimulationStore(state => state.resetSimulation);

  const elapsedYears = Math.max(0, timeline.currentYear - timeline.startYear);
  const currentYearInt = Math.floor(timeline.currentYear);
  const isFrozen = timeline.isFrozenOnFailure || lifecycleState === 'POST_FAILURE';

  return (
    <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 font-mono text-xs select-none pointer-events-none">
      {/* 1. Left Telemetry Badges Matching Reference Image */}
      <div className="flex items-center gap-2 bg-[#070a10]/95 backdrop-blur-2xl border border-slate-800/90 p-1.5 rounded-2xl shadow-2xl pointer-events-auto">
        {/* Baseline State Pill */}
        <div className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
          BASELINE
        </div>

        {/* Health */}
        <div className="flex items-center gap-1 px-2 text-[10px]">
          <span className="text-slate-400">HEALTH:</span>
          <span className="text-white font-bold">{bridge.overallHealth}%</span>
        </div>

        {/* Utilization */}
        <div className="flex items-center gap-1 px-2 text-[10px] border-l border-slate-800">
          <span className="text-slate-400">UTIL:</span>
          <span className="text-cyan-300 font-bold">{Math.round(bridge.overallUtilization * 100)}%</span>
        </div>

        {/* Risk */}
        <div className="flex items-center gap-1 px-2 text-[10px] border-l border-slate-800">
          <span className="text-slate-400">RISK:</span>
          <span className={`font-bold ${
            bridge.overallRisk === 'CRITICAL' ? 'text-red-400' :
            bridge.overallRisk === 'HIGH' ? 'text-orange-400' :
            bridge.overallRisk === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {bridge.overallRisk}
          </span>
        </div>

        {/* Stress */}
        <div className="flex items-center gap-1 px-2 text-[10px] border-l border-slate-800">
          <span className="text-slate-400">STRESS:</span>
          <span className="text-white font-bold">{formatMPa(bridge.peakStressMPa)}</span>
        </div>
      </div>

      {/* 2. Center/Right Timeline Controls & Year Slider */}
      <div className="flex items-center gap-3 bg-[#070a10]/95 backdrop-blur-2xl border border-slate-800/90 px-3.5 py-1.5 rounded-2xl shadow-2xl pointer-events-auto flex-1 max-w-2xl min-w-[320px]">
        {/* Play / Pause / Step Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => stepTimeline(-1)}
            disabled={isFrozen}
            className={`p-1.5 rounded-xl border transition-colors ${
              isFrozen
                ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Step -1 Year"
          >
            <SkipBack size={13} />
          </button>

          {isFrozen ? (
            <button
              onClick={resetSimulation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-glow-amber text-[10px]"
              title="Restore Bridge"
            >
              <RotateCcw size={12} />
              <span>Restore</span>
            </button>
          ) : timeline.isPlaying ? (
            <button
              onClick={pauseTimeline}
              className="p-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-glow-amber"
              title="Pause Simulation"
            >
              <Pause size={13} />
            </button>
          ) : (
            <button
              onClick={playTimeline}
              className="p-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-glow-cyan"
              title="Play 50-Year Simulation"
            >
              <Play size={13} />
            </button>
          )}

          <button
            onClick={() => stepTimeline(1)}
            disabled={isFrozen}
            className={`p-1.5 rounded-xl border transition-colors ${
              isFrozen
                ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800 text-slate-600'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="Step +1 Year"
          >
            <SkipForward size={13} />
          </button>
        </div>

        {/* Year Label */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b0f17] border border-slate-800 text-[10px] font-bold">
          <span className="text-white">YEAR {currentYearInt}</span>
          <span className={isFrozen ? 'text-red-400' : 'text-cyan-400'}>
            {isFrozen ? 'FROZEN' : `+${elapsedYears.toFixed(0)} YEARS`}
          </span>
        </div>

        {/* Timeline Range Slider */}
        <div className="flex-1 flex flex-col justify-center min-w-[120px]">
          <input
            type="range"
            min={timeline.startYear}
            max={timeline.endYear}
            step={0.1}
            disabled={isFrozen}
            value={timeline.currentYear}
            onChange={(e) => setTimelineYear(parseFloat(e.target.value))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-cyan-400 ${
              isFrozen ? 'bg-red-950/40 opacity-60 cursor-not-allowed' : 'bg-slate-800'
            }`}
          />
          <div className="flex justify-between text-[8px] text-slate-500 mt-0.5 px-0.5">
            <span>2026</span>
            <span>2034</span>
            <span>2044</span>
            <span>2054</span>
            <span>2064</span>
            <span>2074</span>
          </div>
        </div>

        {/* Playback Speeds */}
        <div className="hidden sm:flex items-center bg-[#0b0f17] p-0.5 rounded-xl border border-slate-800 text-[9px]">
          {[1, 2, 5, 10, 25, 50].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              disabled={isFrozen}
              className={`px-1.5 py-0.5 rounded-lg font-bold transition-all ${
                timeline.playbackSpeed === spd
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
