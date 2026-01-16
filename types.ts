
export enum JobStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ExpenseType {
  MATERIAL = 'MATERIAL',
  LABOR = 'LABOR',
  MISC = 'MISC'
}

export interface Expense {
  id: string;
  type: ExpenseType;
  description: string;
  amount: number;
  date: string;
  photo?: string; // base64 encoded photo
}

export interface Job {
  id: string;
  title: string;
  customerName: string;
  estimatedPrice: number;
  dueDate: string;
  status: JobStatus;
  expenses: Expense[];
  createdAt: string;
}

export interface AppState {
  jobs: Job[];
  selectedJobId: string | null;
  isAddingJob: boolean;
}
