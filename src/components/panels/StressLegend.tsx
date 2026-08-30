import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Activity } from 'lucide-react';

export const StressLegend: React.FC = () => {
  const viewMode = useSimulationStore(state => state.viewMode3D);
  const peakStress = useSimulationStore(state => state.bridge.peakStressMPa);

  if (viewMode !== 'STRESS') return null;

  return (
    <div className="absolute bottom-24 left-6 z-20 bg-slate-950/85 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl w-64 text-xs font-mono select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider uppercase text-[11px]">
          <Activity size={14} />
          <span>Von Mises Stress (MPa)</span>
        </div>
        <div className="text-[10px] text-slate-400">Yield: 140 MPa</div>
      </div>

      {/* Heatmap Continuous Gradient Bar */}
      <div className="relative h-3 w-full rounded-md overflow-hidden border border-slate-600/50 mb-2">
        <div
          className="w-full h-full"
          style={{
            background: 'linear-gradient(to right, #0284c7 0%, #06b6d4 20%, #10b981 45%, #eab308 70%, #f97316 85%, #ef4444 95%, #ec4899 100%)',
          }}
        />
        {/* Peak Stress Indicator Marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-glow-cyan transform -translate-x-1/2"
          style={{ left: `${Math.min(100, (peakStress / 140) * 100)}%` }}
          title={`Peak Stress: ${peakStress} MPa`}
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between text-[9px] text-slate-400 mb-2">
        <span>0 MPa</span>
        <span>35 MPa</span>
        <span>70 MPa</span>
        <span>105 MPa</span>
        <span className="text-red-400 font-bold">&gt;140 MPa</span>
      </div>

      {/* Threshold Key */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 pt-1.5 border-t border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <span>Nominal (0-40)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Moderate (40-75)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Elevated (75-110)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>Critical (&gt;110)</span>
        </div>
      </div>
    </div>
  );
};
