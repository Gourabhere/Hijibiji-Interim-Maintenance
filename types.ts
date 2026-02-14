
export interface Owner {
  sn: number;
  flatNo: string;
  name: string;
  possessionDate: string;
}

export interface Payment2025 {
  flatNo: string;
  aug: number;
  sept: number;
  oct: number;
  nov: number;
  dec: number;
  paidTillDate: number;
  outstanding: number;
  sharedExp2025?: number;
}

export interface Payment2026 {
  flatNo: string;
  carryForward2025: number;
  q1Payment: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
  paidTillDate: number;
  outstanding: number;
  remarks?: string;
  janExempt?: boolean;
  febExempt?: boolean;
  sharedExp2025?: number;
}

export interface ExpenseRecord {
  category: string;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

export interface ExpenseReportItem {
  month: string;
  amount: number;
  // Dynamic keys might exist, so we accept loose typing or specific fields if known
  [key: string]: any;
}

export interface TaskLog {
  id: number;
  created_at: string;
  timestamp?: string; // New field for specific task time
  task_description: string;
  status: string;
  image_url: string;
  flat_no?: string; // Optional if linked to a specific flat
}

export interface MaintenanceConfig {
  key: string;
  value: any;
  description?: string;
}

export interface DashboardData {
  owner: Owner;
  p2025: Payment2025;
  p2026: Payment2026;
  expenses2025: Record<string, number>;
  config: {
    q1Due: number;
    monthlyMaintenance2026: number;
  };
  calculated: {
    expenseShare2025: number;
    carryForward: number;
    q1Status: 'Covered' | 'Partial Covered' | 'Paid' | 'Partial Paid' | 'Due';
    maintenancePaidTillDate: number;
    currentBalance: number;
  };
  taskLogs?: TaskLog[];
}
