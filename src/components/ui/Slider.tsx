import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  icon?: React.ReactNode;
  accentColor?: 'cyan' | 'amber' | 'red' | 'emerald';
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '%',
  icon,
  accentColor = 'cyan',
  onChange,
  disabled = false,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const colorStyles = {
    cyan: 'bg-cyan-500 shadow-glow-cyan',
    amber: 'bg-amber-500 shadow-glow-amber',
    red: 'bg-red-500 shadow-glow-red',
    emerald: 'bg-emerald-500 shadow-glow-cyan',
  }[accentColor];

  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          {icon && <span className="text-cyan-400">{icon}</span>}
          <span>{label}</span>
        </div>
        <div className="font-mono font-semibold text-slate-100 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-[11px]">
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </div>
      </div>

      <div className="relative flex items-center h-4">
        {/* Custom Track Background */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/40">
          <div
            className={`h-full transition-all duration-75 ${colorStyles}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Real Native Range Input overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};
