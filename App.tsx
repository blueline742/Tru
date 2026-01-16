
import React, { useState, useEffect, useMemo } from 'react';
import { Job, JobStatus, ExpenseType, Expense } from './types';
import { Icons } from './constants';
import { JobCard } from './components/JobCard';
import { ProgressBar } from './components/ProgressBar';
import { takePhoto } from './utils/camera';
import { shareJob } from './utils/share';
import { scanReceipt } from './utils/receiptScanner';
import { downloadJobPDF } from './utils/pdfExport';

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
  const [expensePhoto, setExpensePhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'over' | 'due'>('all');
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);

  useEffect(() => {
    localStorage.setItem('aaa_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const activeJobs = useMemo(() => jobs.filter(j => j.status === JobStatus.ACTIVE), [jobs]);
  const historyJobs = useMemo(() => jobs.filter(j => j.status === JobStatus.COMPLETED), [jobs]);
  const selectedJob = useMemo(() => jobs.find(j => j.id === selectedJobId), [jobs, selectedJobId]);

  const currentJobsList = currentTab === 'jobs' ? activeJobs : historyJobs;

  const filterJobs = (jobList: Job[]) => {
    let filtered = jobList;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(j =>
        j.title.toLowerCase().includes(query) ||
        j.customerName.toLowerCase().includes(query)
      );
    }

    // Apply filter type
    if (filterType === 'over') {
      filtered = filtered.filter(j => {
        const spent = j.expenses.reduce((sum, e) => sum + e.amount, 0);
        return spent > j.estimatedPrice;
      });
    } else if (filterType === 'due') {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      filtered = filtered.filter(j => new Date(j.dueDate) <= threeDaysFromNow);
    }

    return filtered;
  };

  const filteredJobs = useMemo(() => filterJobs(currentJobsList), [currentJobsList, searchQuery, filterType]);

  const addJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = (formData.get('title') as string)?.trim();
    const customer = (formData.get('customer') as string)?.trim();
    const estimate = Number(formData.get('estimate'));
    const dueDate = formData.get('dueDate') as string;

    if(!title || title.length < 2) {
      alert('Please enter a valid job title (at least 2 characters)');
      return;
    }
    if(!customer || customer.length < 2) {
      alert('Please enter a valid customer name (at least 2 characters)');
      return;
    }
    if(isNaN(estimate) || estimate <= 0) {
      alert('Please enter a valid budget amount greater than 0');
      return;
    }
    if(!dueDate) {
      alert('Please select a due date');
      return;
    }

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

  const handleTakePhoto = async () => {
    const photo = await takePhoto();
    if (photo) {
      setExpensePhoto(photo);
    }
  };

  const handleScanReceipt = async () => {
    if (!selectedJobId) return;

    setIsScanningReceipt(true);
    const photo = await takePhoto();

    if (!photo) {
      setIsScanningReceipt(false);
      return;
    }

    const result = await scanReceipt(photo);
    setIsScanningReceipt(false);

    if (result.error) {
      alert(`Receipt scan failed: ${result.error}`);
      return;
    }

    if (result.items.length === 0) {
      alert('No items found on receipt. Please try again or add manually.');
      return;
    }

    // Add all items from receipt as expenses
    const newExpenses: Expense[] = result.items.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      type: ExpenseType.MATERIAL,
      description: item.description,
      amount: item.amount,
      date: new Date().toISOString(),
      photo: photo
    }));

    setJobs(prevJobs => prevJobs.map(j =>
      j.id === selectedJobId
        ? { ...j, expenses: [...newExpenses, ...j.expenses] }
        : j
    ));

    alert(`Successfully added ${newExpenses.length} items from receipt!`);
  };

  const addExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJobId) return;
    const formData = new FormData(e.currentTarget);
    const desc = (formData.get('description') as string)?.trim();
    const amt = Number(formData.get('amount'));

    if(!desc || desc.length < 2) {
      alert('Please enter a valid description (at least 2 characters)');
      return;
    }
    if(isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.get('type') as ExpenseType,
      description: desc,
      amount: amt,
      date: new Date().toISOString(),
      photo: expensePhoto || undefined
    };
    setJobs(prevJobs => prevJobs.map(j => j.id === selectedJobId ? { ...j, expenses: [newExpense, ...j.expenses] } : j));
    setIsAddingExpense(false);
    setExpensePhoto(null);
  };

  const deleteExpense = (expenseId: string) => {
    if (!selectedJobId) return;
    if (window.confirm('Delete this expense?')) {
      setJobs(prevJobs => prevJobs.map(j =>
        j.id === selectedJobId
          ? { ...j, expenses: j.expenses.filter(e => e.id !== expenseId) }
          : j
      ));
    }
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
          <div className="text-center px-4 overflow-hidden flex-1">
            <h2 className="text-xs font-bold tracking-tight text-white/90 truncate">{selectedJob.title}</h2>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest truncate">{selectedJob.customerName}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => shareJob(selectedJob)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10 hover:bg-blue-500/10 transition-colors"
              title="Share job summary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 13.51l6.83 3.98m-.01-10.98l-6.82 3.98M21 5a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0zm12 7a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => downloadJobPDF(selectedJob)}
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/10 hover:bg-emerald-500/10 transition-colors"
              title="Download PDF"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 15l3 3l3 -3M12 18v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={() => setIsEditingJob(true)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10 hover:bg-white/10 transition-colors" title="Edit job">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V5.01M12 12V12.01M12 19V19.01M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6ZM12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13ZM12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="liquid-glass p-6">
            <ProgressBar current={totalSpent} total={selectedJob.estimatedPrice} />
          </div>

          <section>
            <div className="mb-4 px-1">
              <h3 className="text-lg font-black text-white italic mb-3">Transactions</h3>
              {!isCompleted && (
                <div className="flex gap-2">
                  <button
                    onClick={handleScanReceipt}
                    disabled={isScanningReceipt}
                    className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isScanningReceipt ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M2 10h20M7 5L8.5 2h7L18 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="12" cy="13" r="2.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        <span>AI Scan</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsAddingExpense(true)}
                    className="flex-1 bg-blue-600 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <Icons.Plus /> <span>Manual</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {selectedJob.expenses.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">No expenses recorded yet</p>
                </div>
              )}
              {selectedJob.expenses.map(exp => (
                <div key={exp.id} className="liquid-glass p-5 group border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 space-y-0.5">
                      <p className="font-bold text-white text-sm tracking-tight">{exp.description}</p>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{exp.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-black text-white tabular-nums">£{exp.amount.toLocaleString()}</p>
                      {!isCompleted && (
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {exp.photo && (
                    <img
                      src={exp.photo}
                      alt="Receipt"
                      className="w-full h-32 object-cover rounded-xl border border-white/10 mt-3 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(exp.photo, '_blank')}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>

        {isEditingJob && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-6">
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-6">
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

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Receipt/Photo (Optional)</label>
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 6L10 3h4l1 3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="text-xs font-bold">{expensePhoto ? 'Photo Added ✓' : 'Add Photo'}</span>
                  </button>
                  {expensePhoto && (
                    <div className="relative">
                      <img src={expensePhoto} alt="Receipt preview" className="w-full h-32 object-cover rounded-xl border border-white/10" />
                      <button
                        type="button"
                        onClick={() => setExpensePhoto(null)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  )}
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

  return (
    <div className="min-h-screen pb-40">
      <header className="px-6 pt-8 pb-6 text-center">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/icon.png"
            alt="TRU Logo"
            className="w-16 h-16 rounded-2xl shadow-xl mb-3"
          />
          <h1 className="text-lg font-black text-white tracking-[0.3em] uppercase opacity-90">TRU</h1>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-1">
          {currentTab === 'jobs' ? 'Live Jobs' : 'Completed'}
        </h2>
        <p className="text-slate-400 text-sm font-semibold">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
        </p>
      </header>

      <div className="px-6 pb-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search jobs or customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-blue-500/50 transition-colors"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
              filterType === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('over')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
              filterType === 'over'
                ? 'bg-red-500 text-white'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            Over Budget
          </button>
          <button
            onClick={() => setFilterType('due')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
              filterType === 'due'
                ? 'bg-orange-500 text-white'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            Due Soon
          </button>
        </div>
      </div>

      <main className="px-6 py-2 space-y-3">
        {filteredJobs.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-wider">
              {searchQuery || filterType !== 'all' ? 'No jobs match your filters' : currentTab === 'jobs' ? 'No active projects' : 'Vault is empty'}
            </p>
          </div>
        )}
        {filteredJobs.map(job => (
          <JobCard
            key={job.id}
            job={job}
            onClick={() => setSelectedJobId(job.id)}
          />
        ))}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 h-20 liquid-glass z-50 flex items-center justify-around px-6 shadow-2xl border-white/10">
        <button
          onClick={() => setCurrentTab('jobs')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${currentTab === 'jobs' ? 'text-blue-400 scale-105' : 'text-slate-500'}`}
        >
          <Icons.Briefcase />
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Live</span>
        </button>

        <button
          onClick={() => setIsAddingJob(true)}
          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-blue-500/30"
        >
          <Icons.Plus />
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center gap-1.5 transition-all duration-200 ${currentTab === 'history' ? 'text-blue-400 scale-105' : 'text-slate-500'}`}
        >
          <Icons.Clock />
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Vault</span>
        </button>
      </nav>

      {isAddingJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-6">
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
