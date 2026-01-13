
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
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-0.5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Capital Outlay</p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black tracking-tighter ${isOver ? 'text-red-400' : 'text-white'}`}>
              £{current.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600">Actual</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Threshold</p>
          <p className="text-xs font-bold text-slate-400">£{total.toLocaleString()}</p>
        </div>
      </div>
      <div className="h-5 w-full bg-black/50 rounded-full overflow-hidden p-[4px] border border-white/5 relative">
        <div 
          className="h-full transition-all duration-1000 cubic-bezier(0.19, 1, 0.22, 1) rounded-full relative progress-liquid"
          style={{ 
            width: `${percentage}%`,
            background: isOver 
              ? 'linear-gradient(90deg, #F87171 0%, #EF4444 100%)' 
              : 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)'
          }}
        >
          {/* Internal Shine Refraction */}
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20 rounded-full mx-1"></div>
        </div>
      </div>
    </div>
  );
};
