
import { createClient } from '@supabase/supabase-js';

// ============================================================
// SUPABASE TROUBLESHOOTING GUIDE
// ============================================================
// If data isn't loading, check browser console (F12) for logs:
// 
// 1. Connection Test:
//    - Should see: "✅ Connection successful!"
//    - If fails: Check internet, Supabase URL, and API key
//
// 2. Table Access:
//    - Should see: "✅ Registered_Owner_Details fetched: N records"
//    - If fails with 401: RLS policy issue - need public access
//    - If fails with 404: Table doesn't exist or wrong name
//
// 3. Column Names:
//    - Sample record will show actual column names
//    - May have spaces: "Flat No" instead of "Flat_No"
//    - May be lowercase: "sn" instead of "SN"
//
// 4. Common Solutions:
//    - In Supabase dashboard > SQL Editor, run:
//      ALTER TABLE "Registered_Owner_Details" ENABLE ROW LEVEL SECURITY (OFF);
//      CREATE POLICY "Allow public read" ON "Registered_Owner_Details"
//        FOR SELECT USING (true);
//
// ============================================================

// Updated Project: bhdrlzaqejkrqsozbcbr
const SUPABASE_URL = 'https://bhdrlzaqejkrqsozbcbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZHJsemFxZWprcnFzb3piY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzM4OTAsImV4cCI6MjA4NTQ0OTg5MH0.W1kWS99fv-QjQI_eVE3XvPhMWbgMQoGqOtaUHcVlP9s';

// Secondary Project: vmtklhmiuxbfxmhpnjoi (Task Logs)
const SUPABASE_TASKS_URL = 'https://vmtklhmiuxbfxmhpnjoi.supabase.co';
const SUPABASE_TASKS_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdGtsaG1pdXhiZnhtaHBuam9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTgwMTcsImV4cCI6MjA4MjQ5NDAxN30.62uIPu8sarcMIZv4OgRqplmxVmOxqbTYIPIv1vv4ICo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const supabaseTasks = createClient(SUPABASE_TASKS_URL, SUPABASE_TASKS_ANON_KEY);

// Test connection with a single quick check
export const testConnection = async () => {
  try {
    // Quick connectivity test: fetch 1 row from a known table
    const { data, error } = await supabase
      .from('Registered_Owner_Details')
      .select('SN')
      .limit(1);

    if (error) {
      return false;
    }

    return true;
  } catch (err: any) {
    return false;
  }
};

// Smart column name detection with detailed logging
export const detectColumn = (obj: any, ...possibleNames: string[]) => {
  // First, try exact matches
  for (const name of possibleNames) {
    if (obj && obj[name] !== undefined) {
      return obj[name];
    }
  }

  // If no exact match, try case-insensitive search
  if (obj) {
    const objKeys = Object.keys(obj);
    for (const possibleName of possibleNames) {
      const lowerPossible = possibleName.toLowerCase().replace(/[_\s]/g, '');
      for (const objKey of objKeys) {
        const lowerKey = objKey.toLowerCase().replace(/[_\s]/g, '');
        if (lowerPossible === lowerKey && obj[objKey] !== undefined) {
          return obj[objKey];
        }
      }
    }
  }

  return null;
};

export const fetchAllData = async () => {
  try {
    // Fetch from Registered_Owner_Details
    const { data: ownersFullRaw, error: ownersFullError } = await supabase
      .from('Registered_Owner_Details')
      .select('*');

    if (ownersFullError) {
      return null;
    }

    // Fetch from Collections_2025
    const { data: p25Raw, error: p25Error } = await supabase
      .from('Collections_2025')
      .select('*');

    if (p25Error) {
      return null;
    }

    // Fetch from Collections_2026
    const { data: p26Raw, error: p26Error } = await supabase
      .from('Collections_2026')
      .select('*');

    if (p26Error) {
      return null;
    }

    // Fetch from Excess_Amount_2025
    const { data: excessRaw, error: excessError } = await supabase
      .from('Excess_Amount_2025')
      .select('*');

    if (excessError) {
    }

    // Fetch Expense_report_2025
    const { data: expenseReportRaw, error: expenseReportError } = await supabase
      .from('Expense_report_2025')
      .select('*');

    if (expenseReportError) {
    }

    // Fetch Maintenance_Config
    const { data: configRaw, error: configError } = await supabase
      .from('Maintenance_Config')
      .select('*');

    let expenses2025 = { aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }; // Default Fallback
    let config = { q1Due: 6000, monthlyMaintenance2026: 2000 }; // Default Fallback

    if (!configError && configRaw) {
      const expensesRow = configRaw.find((r: any) => r.key === 'expenses_2025');
      if (expensesRow?.value) {
        expenses2025 = expensesRow.value;
      }

      const generalRow = configRaw.find((r: any) => r.key === 'general_config');
      if (generalRow?.value) {
        config = {
          q1Due: generalRow.value.q1_due_amount || 6000,
          monthlyMaintenance2026: generalRow.value.monthly_maintenance_2026 || 2000
        };
      }
    }

    if (!ownersFullRaw || !p25Raw || !p26Raw) {
      return null;
    }

    if (!ownersFullRaw || !p25Raw || !p26Raw) {
      return null;
    }

    // Helper function to clean and convert amount values
    const cleanAmount = (value: any): number => {
      if (value === null || value === undefined) return 0;

      // If already a number, return as is
      if (typeof value === 'number') return Number(value);

      // Convert to string and remove commas, then parse
      const strValue = String(value).trim();
      const cleanValue = strValue.replace(/,/g, '');
      const numValue = Number(cleanValue);

      return isNaN(numValue) ? 0 : numValue;
    };

    // Auto-detect columns by analyzing first record's numeric values
    const autoDetectAmountColumns = (sample: any, expectedCount: number) => {
      const numericCols = Object.entries(sample)
        .filter(([key, val]) => {
          const num = cleanAmount(val);
          return !isNaN(num) && key.toLowerCase() !== 'flatno' && key.toLowerCase() !== 'flat_no' && key.toLowerCase() !== 'sn';
        })
        .map(([key]) => key);

      return numericCols;
    };

    // Build excess maps
    const excessMap: Record<string, number> = {};
    const sharedExp2025Map: Record<string, number> = {};
    (excessRaw || []).forEach(e => {
      const flatNo = detectColumn(e, 'Flat_No', 'flat_no', 'Flat No');
      const carryFwd = detectColumn(e, 'Carry_Forward_to_2026', 'carry_forward_to_2026');
      const sharedExp = detectColumn(e, 'Expense_borne_by_each_Owner', 'expense_borne_by_each_owner', 'Expense borne by each Owner');

      if (flatNo) {
        excessMap[flatNo] = cleanAmount(carryFwd);
        sharedExp2025Map[flatNo] = cleanAmount(sharedExp);
      }
    });

    // Map Registered_Owner_Details - auto-detect columns
    const owners = (ownersFullRaw || []).map(o => ({
      sn: detectColumn(o, 'SN', 'sn', 'Sn') || 0,
      flatNo: detectColumn(o, 'Flat_No', 'flat_no', 'Flat No', 'flat no', 'FlatNo') || '',
      name: detectColumn(o, 'Name', 'name') || '',
      possessionDate: detectColumn(o, 'Possession_Date', 'possession_date', 'Possession Date') || ''
    }));

    // Map Collections_2025 - auto-detect columns
    const p25 = (p25Raw || []).map((p, idx) => {
      const mapped = {
        flatNo: detectColumn(p, 'Flat_No', 'flat_no', 'Flat No', 'flat no') || '',
        aug: cleanAmount(detectColumn(p, 'Aug_2025', 'aug_2025', 'Aug', 'aug')),
        sept: cleanAmount(detectColumn(p, 'Sept_2025', 'sept_2025', 'Sept', 'sept', 'Sep', 'sep')),
        oct: cleanAmount(detectColumn(p, 'Oct_2025', 'oct_2025', 'Oct', 'oct')),
        nov: cleanAmount(detectColumn(p, 'Nov_2025', 'nov_2025', 'Nov', 'nov')),
        dec: cleanAmount(detectColumn(p, 'Dec_2025', 'dec_2025', 'Dec', 'dec')),
        paidTillDate: cleanAmount(detectColumn(p, 'Total_Paid_in_2025', 'total_paid_in_2025')),
        outstanding: cleanAmount(detectColumn(p, 'Outstanding_in_2025', 'outstanding_in_2025')),
        sharedExp2025: sharedExp2025Map[detectColumn(p, 'Flat_No', 'flat_no', 'Flat No', 'flat no') || ''] || 0
      };
      return mapped;
    });

    // Map Collections_2026 - auto-detect columns
    const p26 = (p26Raw || []).map((p, idx) => {
      const mapped = {
        flatNo: detectColumn(p, 'Flat_No', 'flat_no', 'Flat No') || '',
        carryForward2025: excessMap[detectColumn(p, 'Flat_No', 'flat_no') || ''] || cleanAmount(detectColumn(p, '2025_Carry_Forward', 'carry_forward_2025')),
        q1Payment: cleanAmount(detectColumn(p, 'Q1_Payment', 'q1_payment')),
        jan: cleanAmount(detectColumn(p, 'January_2026', 'january_2026', 'January', 'january')),
        feb: cleanAmount(detectColumn(p, 'February_2026', 'february_2026', 'February', 'february')),
        mar: cleanAmount(detectColumn(p, 'March_2026', 'march_2026', 'March', 'march')),
        apr: cleanAmount(detectColumn(p, 'April_2026', 'april_2026', 'April', 'april')),
        may: cleanAmount(detectColumn(p, 'May_2026', 'may_2026', 'May', 'may')),
        jun: cleanAmount(detectColumn(p, 'June_2026', 'june_2026', 'June', 'june')),
        jul: cleanAmount(detectColumn(p, 'July_2026', 'july_2026', 'July', 'july')),
        aug: cleanAmount(detectColumn(p, 'August_2026', 'august_2026', 'August', 'august')),
        sep: cleanAmount(detectColumn(p, 'September_2026', 'september_2026', 'September', 'september')),
        oct: cleanAmount(detectColumn(p, 'October_2026', 'october_2026', 'October', 'october')),
        nov: cleanAmount(detectColumn(p, 'November_2026', 'november_2026', 'November', 'november')),
        dec: cleanAmount(detectColumn(p, 'December_2026', 'december_2026', 'December', 'december')),
        paidTillDate: cleanAmount(detectColumn(p, 'Paid_Till_Date', 'paid_till_date')),
        outstanding: cleanAmount(detectColumn(p, 'Outstanding_in_2026', 'Outstanding', 'outstanding')),
        remarks: detectColumn(p, 'Remarks', 'remarks', 'REMARKS') || '',
        janExempt: (typeof detectColumn(p, 'January_2026', 'january_2026', 'January', 'january') === 'string' &&
          detectColumn(p, 'January_2026', 'january_2026', 'January', 'january').toLowerCase().includes('n/a')),
        febExempt: (typeof detectColumn(p, 'February_2026', 'february_2026', 'February', 'february') === 'string' &&
          detectColumn(p, 'February_2026', 'february_2026', 'February', 'february').toLowerCase().includes('n/a')),
        sharedExp2025: sharedExp2025Map[detectColumn(p, 'Flat_No', 'flat_no', 'Flat No') || ''] || 0
      };

      // EXCEPTION: Exempted Flats Logic for 1A3 and 1E1
      // Force outstanding to 0 regardless of DB value
      const exemptedFlats = ['1A3', '1E1'];
      if (exemptedFlats.includes(mapped.flatNo)) {
        mapped.outstanding = 0;
      }

      return mapped;
    });

    return { owners, p25, p26, expenses2025, config };
  } catch (err: any) {
    return null;
  }
};

export const upsertOwners = async (owners: any[]) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  return await supabase.from('Registered_Owner_Details').upsert(owners);
};

export const upsertPayments2025 = async (payments: any[]) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  return await supabase.from('Collections_2025').upsert(payments);
};

export const upsertPayments2026 = async (payments: any[]) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  return await supabase.from('Collections_2026').upsert(payments);
};

export const fetchTaskLogs = async () => {
  try {
    console.log('Fetching task logs from secondary project (Task Logs)...');
    const { data: taskLogs, error } = await supabaseTasks
      .from('task_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching task logs:', error);
      return [];
    }

    // Map raw logs to typed TaskLog objects
    const mappedLogs = (taskLogs || []).map((log: any) => {
      const block = detectColumn(log, 'block', 'Block');
      const floor = detectColumn(log, 'floor', 'Floor');
      const flat = detectColumn(log, 'flat', 'Flat', 'flat_no', 'unit_no');

      // Construct flat_no: Block + Floor + Flat (e.g., 1 + A + 3 = 1A3)
      // If direct flat_no exists, use it as fallback or primary if others missing
      let contentFlatNo = detectColumn(log, 'flat_no', 'flat_no_full');

      if (block && floor && flat) {
        contentFlatNo = `${block}${flat}${floor}`;
      }

      return {
        id: log.id,
        created_at: log.created_at,
        timestamp: detectColumn(log, 'timestamp', 'date', 'time'),
        task_description: detectColumn(log, 'task_description', 'description', 'task'),
        status: detectColumn(log, 'status', 'current_status'),
        image_url: detectColumn(log, 'image_url', 'image', 'url', 'photo'),
        flat_no: contentFlatNo,
        block,
        floor,
        flat
      };
    });

    return mappedLogs;
  } catch (err) {
    console.error('Exception fetching task logs:', err);
    return [];
  }
};
