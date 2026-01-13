
import React from 'react';
import { Job } from '../types';
import { Icons } from '../constants';
import { ProgressBar } from './ProgressBar';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const totalExpenses = job.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  return (
    <button 
      onClick={onClick}
      className="w-full text-left liquid-glass p-8 mb-6 outline-none block group shimmer-premium relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white tracking-tighter group-active:text-blue-400 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black bg-white/5 text-slate-500 px-2.5 py-1.5 rounded-lg uppercase tracking-widest border border-white/5">
              Principal
            </span>
            <span className="text-sm font-bold text-slate-400 tracking-tight">{job.customerName}</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-all border border-white/5 shadow-lg group-hover:bg-white/10">
          <Icons.ChevronRight />
        </div>
      </div>
      
      <div className="bg-black/30 rounded-[24px] p-6 mb-8 border border-white/5 shadow-inner backdrop-blur-md">
        <ProgressBar current={totalExpenses} total={job.estimatedPrice} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mr-3 text-slate-500">
            <Icons.Clock />
          </div>
          Timeline &bull; {new Date(job.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
        
        {totalExpenses > job.estimatedPrice && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">At Risk</span>
          </div>
        )}
      </div>
    </button>
  );
};
