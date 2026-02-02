
import { Owner, Payment2025, Payment2026, ExpenseRecord } from './types';

/*
Full Registry from "Registered Owner Details" CSV
All hardcoded data has been moved to Supabase database.
See lib/supabase.ts for connection and data fetching.
*/

// Fallback/Default exports for when Supabase is unavailable
export const owners: Owner[] = [];

export const payments2026: Payment2026[] = [];

export const societyExpenses2025: ExpenseRecord[] = [];

export const totalCollections2025 = {
  owners: 0,
  realtech: 0,
  total: 0
};

export const payments2025: Payment2025[] = [];

// Note: Data is loaded dynamically from Supabase
// See App.tsx for fetchAllData() which loads owners, payments2025, and payments2026
// Supabase Project: https://bhdrlzaqejkrqsozbcbr.supabase.co
// Tables: owners, payments_2025, payments_2026
