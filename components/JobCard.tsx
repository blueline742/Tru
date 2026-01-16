
import React from 'react';
import { Job, JobStatus } from '../types';
import { Icons } from '../constants';
import { ProgressBar } from './ProgressBar';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const totalExpenses = job.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const percentage = Math.min((totalExpenses / job.estimatedPrice) * 100, 100);
  const isOver = totalExpenses > job.estimatedPrice;
  const isCompleted = job.status === JobStatus.COMPLETED;
  const budgetDifference = job.estimatedPrice - totalExpenses;

  return (
    <button
      onClick={onClick}
      className="w-full text-left liquid-glass p-5 mb-3 outline-none block group shimmer-premium relative overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-black text-white tracking-tight group-active:text-blue-400 transition-colors mb-1">
            {job.title}
          </h3>
          <p className="text-sm font-semibold text-slate-500">{job.customerName}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-all border border-white/5 group-hover:bg-white/10 group-hover:border-blue-500/30 ml-3 flex-shrink-0">
          <Icons.ChevronRight />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-slate-500 font-semibold">
          £{totalExpenses.toLocaleString()} / £{job.estimatedPrice.toLocaleString()}
        </span>
        <span className={`font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 relative">
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{
            width: `${percentage}%`,
            background: isOver
              ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
              : 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        {isCompleted ? (
          <>
            <div className="flex items-center text-xs text-emerald-400 font-bold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Job Complete</span>
            </div>

            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              budgetDifference >= 0
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <span className={`text-[9px] font-black uppercase tracking-wider ${
                budgetDifference >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {budgetDifference >= 0 ? '+' : ''}£{Math.abs(budgetDifference).toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center text-xs text-slate-500 font-semibold">
              <Icons.Clock />
              <span className="ml-1.5">Due {new Date(job.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>

            {isOver && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
                <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">Over</span>
              </div>
            )}
          </>
        )}
      </div>
    </button>
  );
};
