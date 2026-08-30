import React from 'react';
import { RiskLevel, MaintenancePriority } from '../../types/bridge';

interface RiskBadgeProps {
  risk: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  risk,
  size = 'md',
  showPulse = true,
}) => {
  const styles = {
    NORMAL: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    LOW: {
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      dot: 'bg-blue-400',
    },
    MODERATE: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    HIGH: {
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      dot: 'bg-orange-400',
    },
    CRITICAL: {
      bg: 'bg-red-500/15 text-red-400 border-red-500/40 shadow-glow-red animate-pulse',
      dot: 'bg-red-400',
    },
  }[risk];

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono font-medium tracking-wide ${styles.bg} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${
          showPulse && (risk === 'HIGH' || risk === 'CRITICAL') ? 'animate-ping' : ''
        }`}
      />
      <span>{risk}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: MaintenancePriority }> = ({ priority }) => {
  const styles = {
    P1: 'bg-red-500/20 text-red-300 border-red-500/40',
    P2: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    P3: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    P4: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    P5: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  }[priority];

  return (
    <span className={`inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${styles}`}>
      {priority}
    </span>
  );
};
