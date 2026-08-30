import React from 'react';
import { getHealthColorHex } from '../../utils/mathUtils';

interface GaugeProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  size = 110,
  strokeWidth = 10,
  label = 'HEALTH',
  sublabel,
  showPercent = true,
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 240-degree arc
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clamped / 100) * arcLength;
  const color = getHealthColorHex(clamped);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-[135deg]">
        {/* Background Track Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Value Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>

      {/* Center Value Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold font-mono tracking-tight text-white">
          {Math.round(clamped)}{showPercent ? '%' : ''}
        </span>
        {label && (
          <span className="text-[9px] font-semibold tracking-wider uppercase text-slate-400 mt-[-2px]">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[8px] font-mono text-slate-500">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
