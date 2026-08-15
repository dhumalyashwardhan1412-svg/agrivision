import React from 'react';
import clsx from 'clsx';

interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: 'green' | 'amber' | 'blue' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  color = 'green',
  size = 'md',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    green: 'bg-emerald-600',
    amber: 'bg-amber-500',
    blue: 'bg-sky-600',
    purple: 'bg-purple-600',
    red: 'bg-red-500',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={clsx('w-full space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-slate-100 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={clsx('h-full transition-all duration-500 rounded-full', colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
