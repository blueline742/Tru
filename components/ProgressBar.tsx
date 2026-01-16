
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min((current / total) * 100, 100);
  const isOver = current > total;

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Spent</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black tracking-tight ${isOver ? 'text-red-400' : 'text-blue-400'}`}>
              £{current.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">of £{total.toLocaleString()}</span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
            {percentage.toFixed(0)}%
          </p>
        </div>
      </div>
      <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
        <div
          className="h-full transition-all duration-1000 ease-out rounded-full relative progress-liquid animate-in slide-in-from-left"
          style={{
            width: `${percentage}%`,
            background: isOver
              ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
              : 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
            boxShadow: isOver
              ? '0 0 20px rgba(239, 68, 68, 0.4)'
              : '0 0 20px rgba(59, 130, 246, 0.4)'
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[50%] bg-white/25 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
