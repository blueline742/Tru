
import React, { useState, useEffect, useMemo } from 'react';
import { Job, JobStatus, ExpenseType, Expense } from './types';
import { Icons } from './constants';
import { JobCard } from './components/JobCard';
import { ProgressBar } from './components/ProgressBar';

type Tab = 'jobs' | 'history';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('jobs');
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('aaa_jobs');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Bathroom Remodel',
        customerName: 'Sarah Jenkins',
        estimatedPrice: 4500,
        dueDate: '2024-12-20',
        status: JobStatus.ACTIVE,
        expenses: [
          { id: 'e1', type: ExpenseType.MATERIAL, description: 'Tiles', amount: 1200, date: '2024-11-20' },
          { id: 'e2', type: ExpenseType.LABOR, description: 'Initial Plumbing', amount: 800, date: '2024-11-21' }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Rewire Workshop',
        customerName: 'Mike Thompson',
        estimatedPrice: 1200,
        dueDate: '2024-12-10',
        status: JobStatus.ACTIVE,
        expenses: [
          { id: 'e3', type: ExpenseType.MATERIAL, description: 'Cable Drums', amount: 450, date: '2024-11-22' }
        ],
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);

  useEffect(() => {
    localStorage.setItem('aaa_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const activeJobs = useMemo(() => jobs.filter(j => j.status === JobStatus.ACTIVE), [jobs]);
  const historyJobs = useMemo(() => jobs.filter(j => j.status === JobStatus.COMPLETED), [jobs]);
  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [jobs, selectedJobId]);

  const addJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const customer = formData.get('customer') as string;
    const estimate = Number(formData.get('estimate'));
    const dueDate = formData.get('dueDate') as string;
    
    if(!title || !customer || isNaN(estimate)) return;

    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      customerName: customer,
      estimatedPrice: estimate,
      dueDate,
      status: JobStatus.ACTIVE,
      expenses: [],
      createdAt: new Date().toISOString()
    };
    setJobs([newJob, ...jobs]);
    setIsAddingJob(false);
  };

  const updateJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJobId) return;
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const customer = formData.get('customer') as string;
    const estimate = Number(formData.get('estimate'));
    const dueDate = formData.get('dueDate') as string;
    const status = formData.get('status') as JobStatus;

    setJobs(jobs.map(j => j.id === selectedJobId ? {
      ...j,
      title,
      customerName: customer,
      estimatedPrice: estimate,
      dueDate,
      status
    } : j));
    setIsEditingJob(false);
  };

  const deleteJob = () => {
    if (!selectedJobId) return;
    if (window.confirm('Are you sure you want to permanently delete this project? This cannot be undone.')) {
      setJobs(jobs.filter(j => j.id !== selectedJobId));
      setSelectedJobId(null);
      setIsEditingJob(false);
    }
  };

  const addExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJobId) return;
    const formData = new FormData(e.currentTarget);
    const desc = formData.get('description') as string;
    const amt = Number(formData.get('amount'));
    
    if(!desc || isNaN(amt)) return;

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.get('type') as ExpenseType,
      description: desc,
      amount: amt,
      date: new Date().toISOString()
    };
    setJobs(prevJobs => prevJobs.map(j => j.id === selectedJobId ? { ...j, expenses: [newExpense, ...j.expenses] } : j));
    setIsAddingExpense(false);
  };

  if (selectedJobId && selectedJob) {
    const totalSpent = selectedJob.expenses.reduce((s, e) => s + e.amount, 0);
    const isCompleted = selectedJob.status === JobStatus.COMPLETED;

    return (
      <div className="min-h-screen pb-40">
        <header className="sticky top-0 bg-[#0D0F12]/90 backdrop-blur-md z-40 px-6 pt-10 pb-4 flex items-center justify-between border-b border-white/5">
          <button onClick={() => setSelectedJobId(null)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10">
            <Icons.ArrowLeft />
          </button>
          <div className="text-center px-4 overflow-hidden">
            <h2 className="text-xs font-bold tracking-tight text-white/90 truncate">{selectedJob.title}</h2>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">{selectedJob.customerName}</div>
          </div>
          <button onClick={() => setIsEditingJob(true)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V5.01M12 12V12.01M12 19V19.01M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6ZM12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13ZM12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </header>

        <main className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="liquid-glass p-6">
            <ProgressBar current={totalSpent} total={selectedJob.estimatedPrice} />
          </div>

          <section>
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-lg font-black text-white italic">Transactions</h3>
              {!isCompleted && (
                <button 
                  onClick={() => setIsAddingExpense(true)}
                  className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"
                >
                  <Icons.Plus /> New Entry
                </button>
              )}
            </div>

            <div className="space-y-3">
              {selectedJob.expenses.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">No expenses recorded yet</p>
                </div>
              )}
              {selectedJob.expenses.map(exp => (
                <div key={exp.id} className="liquid-glass p-5 flex justify-between items-center group border-white/5">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white text-sm tracking-tight">{exp.description}</p>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{exp.type}</span>
                  </div>
                  <p className="font-black text-white tabular-nums">£{exp.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {isEditingJob && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-end sm:items-center justify-center p-6">
            <div className="w-full max-w-md liquid-glass rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight italic">Manage Project</h2>
                <button onClick={() => setIsEditingJob(false)} className="text-slate-500 p-2 rotate-45 transition-transform"><Icons.Plus /></button>
              </div>
              <form onSubmit={updateJob} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Job Title</label>
                  <input name="title" defaultValue={selectedJob.title} required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5 focus:border-blue-500/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Client</label>
                  <input name="customer" defaultValue={selectedJob.customerName} required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5 focus:border-blue-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Budget (£)</label>
                    <input name="estimate" type="number" defaultValue={selectedJob.estimatedPrice} required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Status</label>
                    <select name="status" defaultValue={selectedJob.status} className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5">
                      <option value={JobStatus.ACTIVE} className="bg-[#0D0F12]">Active</option>
                      <option value={JobStatus.COMPLETED} className="bg-[#0D0F12]">Completed (Vault)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Due Date</label>
                  <input name="dueDate" type="date" defaultValue={selectedJob.dueDate} required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button type="button" onClick={deleteJob} className="bg-red-500/10 text-red-500 font-black py-4 rounded-2xl border border-red-500/20 shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[9px]">
                    Delete
                  </button>
                  <button type="submit" className="bg-white text-black font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[9px]">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isAddingExpense && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-end sm:items-center justify-center p-6">
            <div className="w-full max-w-md liquid-glass rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight italic">New Transaction</h2>
                <button onClick={() => setIsAddingExpense(false)} className="text-slate-500 p-2 rotate-45 transition-transform"><Icons.Plus /></button>
              </div>
              <form onSubmit={addExpense} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Description</label>
                  <input name="description" required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5" placeholder="e.g. Copper Piping" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Cost (£)</label>
                    <input name="amount" type="number" required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5" placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Category</label>
                    <select name="type" className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5">
                      <option value={ExpenseType.MATERIAL} className="bg-[#0D0F12]">Material</option>
                      <option value={ExpenseType.LABOR} className="bg-[#0D0F12]">Labor</option>
                      <option value={ExpenseType.MISC} className="bg-[#0D0F12]">Misc</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[9px] mt-2">
                  Commit Entry
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentJobsList = currentTab === 'jobs' ? activeJobs : historyJobs;

  return (
    <div className="min-h-screen pb-40">
      <header className="px-8 pt-12 pb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-[10px] font-black text-white italic">T</span>
            </div>
            <h1 className="text-[14px] font-black text-white tracking-[0.3em] uppercase italic">TRU</h1>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter">
            {currentTab === 'jobs' ? 'Live Track' : 'Archive'}
          </h2>
          <p className="text-slate-500 text-[10px] font-bold tracking-tight">
            {currentTab === 'jobs' ? `${activeJobs.length} active sites` : `${historyJobs.length} completed`}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/10"><Icons.Briefcase /></div>
      </header>

      <main className="px-6 py-4 space-y-4">
        {currentJobsList.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">{currentTab === 'jobs' ? 'No active projects' : 'Vault is empty'}</p>
          </div>
        )}
        {currentJobsList.map(job => (
          <JobCard 
            key={job.id}
            job={job} 
            onClick={() => setSelectedJobId(job.id)} 
          />
        ))}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 h-24 liquid-glass z-50 flex items-center justify-around px-8 shadow-2xl border-white/10">
        <button 
          onClick={() => setCurrentTab('jobs')}
          className={`flex flex-col items-center gap-2 transition-all ${currentTab === 'jobs' ? 'text-blue-500 scale-105' : 'text-slate-500'}`}
        >
          <Icons.Briefcase />
          <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
        </button>

        <button 
          onClick={() => setIsAddingJob(true)}
          className="w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-[20px] flex items-center justify-center border border-white/10 active:scale-90 transition-all shadow-xl"
        >
          <Icons.Plus />
        </button>

        <button 
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center gap-2 transition-all ${currentTab === 'history' ? 'text-blue-500 scale-105' : 'text-slate-500'}`}
        >
          <Icons.Clock />
          <span className="text-[10px] font-black uppercase tracking-widest">Vault</span>
        </button>
      </nav>

      {isAddingJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-end sm:items-center justify-center p-6">
          <div className="w-full max-w-md liquid-glass rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black tracking-tight italic">Initialize Job</h2>
              <button onClick={() => setIsAddingJob(false)} className="text-slate-500 p-2 rotate-45 transition-transform"><Icons.Plus /></button>
            </div>
            <form onSubmit={addJob} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Job Title</label>
                <input name="title" required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5 focus:border-blue-500/50" placeholder="e.g. Modern Suite" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Client Name</label>
                <input name="customer" required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5 focus:border-blue-500/50" placeholder="e.g. Sarah Jenkins" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Budget (£)</label>
                  <input name="estimate" type="number" required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Due Date</label>
                  <input name="dueDate" type="date" required className="w-full bg-white/5 rounded-xl p-4 text-sm font-bold text-white outline-none border border-white/5" />
                </div>
              </div>
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-[9px] mt-2">
                Deploy Site
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
