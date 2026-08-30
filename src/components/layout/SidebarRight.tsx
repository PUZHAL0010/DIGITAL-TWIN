import React, { useState } from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Slider } from '../ui/Slider';
import { SCENARIOS } from '../../data/scenarios';
import { FailureScenarioType } from '../../types/simulation';
import { 
  Play, 
  Pause, 
  StepForward, 
  Sliders, 
  Calendar, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

interface SidebarRightProps {
  onOpenScenarios: () => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({ onOpenScenarios }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const params = useSimulationStore(state => state.params);
  const setParam = useSimulationStore(state => state.setParam);
  const timeline = useSimulationStore(state => state.timeline);
  const setTimelineYear = useSimulationStore(state => state.setTimelineYear);
  const playTimeline = useSimulationStore(state => state.playTimeline);
  const pauseTimeline = useSimulationStore(state => state.pauseTimeline);
  const stepTimeline = useSimulationStore(state => state.stepTimeline);
  const setPlaybackSpeed = useSimulationStore(state => state.setPlaybackSpeed);
  const runScenario = useSimulationStore(state => state.runScenario);
  const activeScenarioId = useSimulationStore(state => state.activeScenarioId);

  // Map ScenarioPreset string ids → FailureScenarioType for the store action.
  // Note: 'crack-propagation' maps to 'CORROSION' since pier cracking in this
  // project is driven by chloride-induced corrosion (not a standalone SHEAR scenario).
  const PRESET_TO_SCENARIO: Record<string, FailureScenarioType> = {
    'normal':                 'OVERLOAD',
    'heavy-traffic':          'OVERLOAD',
    'crack-propagation':      'CORROSION',
    'long-term-deterioration':'CORROSION',
    'critical-failure':       'DEFERRED_MAINTENANCE',
  };

  return (
    <aside
      className={`absolute top-14 bottom-16 right-0 z-20 transition-all duration-300 flex flex-col bg-slate-950/85 backdrop-blur-xl border-l border-slate-800/80 ${
        isCollapsed ? 'w-12' : 'w-80'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand Simulation Controls' : 'Collapse Controls'}
        >
          {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {!isCollapsed && (
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
            <Sliders size={15} className="text-cyan-400" />
            <span>Simulation Control Station</span>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs font-sans">
          {/* 1. Time-Based Deterioration Timeline (2026 - 2036) */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                <Calendar size={13} className="text-cyan-400" />
                <span>Simulation Horizon</span>
              </div>
              <div className="text-xs font-mono font-extrabold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                Year {Math.floor(timeline.currentYear)}
              </div>
            </div>

            {/* Interactive Timeline Scrub Slider — full 50-year horizon 2026–2076 */}
            <div className="space-y-1">
              <div className="relative flex items-center h-4">
                <input
                  type="range"
                  min={2026}
                  max={2076}
                  step={0.1}
                  value={timeline.currentYear}
                  onChange={(e) => setTimelineYear(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
              <div className="flex justify-between font-mono text-[9px] text-slate-400">
                <span>2026 (Baseline)</span>
                <span>2051 (+25y)</span>
                <span>2076 (+50y)</span>
              </div>
            </div>

            {/* Playback Controls & Speed Toggle */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-mono">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={timeline.isPlaying ? pauseTimeline : playTimeline}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeline.isPlaying
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-glow-amber'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan'
                  }`}
                >
                  {timeline.isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{timeline.isPlaying ? 'PAUSE' : 'START'}</span>
                </button>

                <button
                  onClick={() => stepTimeline(1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                  title="Step Forward 1 Year"
                >
                  <StepForward size={14} />
                </button>
              </div>

              {/* Speed Multipliers — matches store's supported playback speeds */}
              <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
                {[1, 2, 5, 10, 25, 50].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      timeline.playbackSpeed === speed
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Structural & Damage Parameter Sliders */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                Multi-Hazard Parameters
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Dynamic 3D State</span>
            </div>

            {/* Structural Load */}
            <Slider
              label="Structural Traffic Load"
              value={params.structuralLoadPercentage}
              accentColor="cyan"
              onChange={(val) => setParam('structuralLoadPercentage', val)}
            />

            {/* Crack Severity */}
            <Slider
              label="Shear & Flexural Cracks"
              value={params.crackSeverityPercentage}
              accentColor="amber"
              onChange={(val) => setParam('crackSeverityPercentage', val)}
            />

            {/* Corrosion */}
            <Slider
              label="Chloride Rebar Corrosion"
              value={params.corrosionPercentage}
              accentColor="red"
              onChange={(val) => setParam('corrosionPercentage', val)}
            />

            {/* Environmental Stress */}
            <Slider
              label="Environmental Stress (Marine / Temp)"
              value={params.environmentalStress}
              accentColor="cyan"
              onChange={(val) => setParam('environmentalStress', val)}
            />

            {/* Traffic Flow Rate */}
            <Slider
              label="Traffic Flow Rate"
              value={params.trafficFlowRateVehMin}
              min={0}
              max={120}
              unit=" veh/min"
              accentColor="cyan"
              onChange={(val) => setParam('trafficFlowRateVehMin', val)}
            />

            {/* Seismic Activity */}
            <Slider
              label="Seismic Ground Vibration"
              value={params.seismicIntensity}
              min={0}
              max={5.0}
              step={0.1}
              unit=" M"
              accentColor="red"
              onChange={(val) => setParam('seismicIntensity', val)}
            />
          </div>

          {/* 3. Scenario Presets Quick Launcher */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-cyan-400" />
                <span>What-If Presets</span>
              </div>
              <button
                onClick={onOpenScenarios}
                className="text-[10px] font-mono text-cyan-400 hover:underline"
              >
                View Details
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => runScenario(PRESET_TO_SCENARIO[sc.id] ?? 'OVERLOAD')}
                    className={`flex items-center justify-between p-2 rounded-lg text-left text-xs font-mono transition-all border ${
                      activeScenarioId === (PRESET_TO_SCENARIO[sc.id] ?? 'OVERLOAD')
                        ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-glow-cyan'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{sc.name.split('(')[0]}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {sc.badge}
                    </span>
                  </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
