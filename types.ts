
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
}

export interface ExpenseRecord {
  category: string;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

export interface DashboardData {
  owner: Owner;
  p2025: Payment2025;
  p2026: Payment2026;
  calculated: {
    expenseShare2025: number;
    carryForward: number;
    q1Status: 'Covered' | 'Partial Covered' | 'Paid' | 'Partial Paid' | 'Due';
    maintenancePaidTillDate: number;
    currentBalance: number;
  };
}
