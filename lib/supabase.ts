
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

console.log('🔌 Initializing Supabase client...');
console.log('📍 URL:', SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global debug store for column inspection
export const debugInfo = {
  p25Sample: null as any,
  p26Sample: null as any,
  p25Columns: [] as string[],
  p26Columns: [] as string[]
};

// Make it available globally for inspection
if (typeof window !== 'undefined') {
  (window as any).hijibijnDebug = debugInfo;
}

// Test connection and show diagnostic info
export const testConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // First test: just authenticate
    console.log('  → Checking auth...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) console.warn('    Auth check:', authError);
    console.log('    Session:', authData?.session ? 'Active' : 'Anon');
    
    // Test each table and show column names
    const tables = ['Registered_Owner_Details', 'Collections_2025', 'Collections_2026', 'Excess_Amount_2025'];
    
    for (const tableName of tables) {
      console.log(`\n  → Testing table: ${tableName}`);
      const { data: tableData, error: tableError, status } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error(`    ❌ Error accessing ${tableName}:`, tableError.message);
      } else if (tableData && tableData.length > 0) {
        const columns = Object.keys(tableData[0]);
        console.log(`    ✅ Found ${tableData.length}+ records`);
        console.log(`    Columns: ${columns.join(', ')}`);
        console.log(`    Sample:`, tableData[0]);
      } else {
        console.warn(`    ⚠️ Table exists but has no data`);
      }
    }
    
    console.log('\n✅ Connection and diagnostics complete!');
    return true;
  } catch (err: any) {
    console.error('❌ Connection error:', {
      message: err?.message,
      stack: err?.stack,
      type: err?.constructor?.name
    });
    return false;
  }
};

export const fetchAllData = async () => {
  try {
    console.log('📥 Starting data fetch from Supabase...');
    
    // Fetch from Registered_Owner_Details - try with wildcard first to see all columns
    console.log('Fetching Registered_Owner_Details (discovering columns)...');
    const { data: ownersRaw, error: ownersError } = await supabase
      .from('Registered_Owner_Details')
      .select('*')
      .limit(1);
    
    if (ownersError) {
      console.error('❌ Owners fetch error:', ownersError);
      return null;
    }
    
    if (ownersRaw && ownersRaw.length > 0) {
      const columns = Object.keys(ownersRaw[0]);
      console.log('✅ Owners table columns:', columns.join(', '));
      console.log('   Sample record:', ownersRaw[0]);
    }
    
    // Now fetch all owners
    const { data: ownersFullRaw, error: ownersFullError } = await supabase
      .from('Registered_Owner_Details')
      .select('*');
    
    if (ownersFullError) {
      console.error('❌ Full owners fetch error:', ownersFullError);
      return null;
    }
    console.log('✅ Owners fetched:', ownersFullRaw?.length || 0, 'records');
    // Fetch from Collections_2025
    console.log('Fetching Collections_2025 (discovering columns)...');
    const { data: p25Raw, error: p25Error } = await supabase
      .from('Collections_2025')
      .select('*');
    
    if (p25Error) {
      console.error('❌ Collections_2025 fetch error:', p25Error);
      return null;
    }
    console.log('✅ Collections_2025 fetched:', p25Raw?.length || 0, 'records');
    
    if (p25Raw && p25Raw.length > 0) {
      console.log('📊 Collections_2025 columns:', Object.keys(p25Raw[0]).join(', '));
      console.log('📊 Collections_2025 FIRST RECORD (RAW):', JSON.stringify(p25Raw[0], null, 2));
      debugInfo.p25Sample = p25Raw[0];
      debugInfo.p25Columns = Object.keys(p25Raw[0]);
    }
    
    // Fetch from Collections_2026
    console.log('Fetching Collections_2026 (discovering columns)...');
    const { data: p26Raw, error: p26Error } = await supabase
      .from('Collections_2026')
      .select('*');
    
    if (p26Error) {
      console.error('❌ Collections_2026 fetch error:', p26Error);
      return null;
    }
    console.log('✅ Collections_2026 fetched:', p26Raw?.length || 0, 'records');
    
    if (p26Raw && p26Raw.length > 0) {
      console.log('📊 Collections_2026 columns:', Object.keys(p26Raw[0]).join(', '));
      console.log('📊 Collections_2026 FIRST RECORD (RAW):', JSON.stringify(p26Raw[0], null, 2));
      debugInfo.p26Sample = p26Raw[0];
      debugInfo.p26Columns = Object.keys(p26Raw[0]);
    }
    
    // Fetch from Excess_Amount_2025
    console.log('Fetching Excess_Amount_2025...');
    const { data: excessRaw, error: excessError } = await supabase
      .from('Excess_Amount_2025')
      .select('*');

    if (excessError) {
      console.error('❌ Excess_Amount_2025 fetch error:', excessError);
      // Don't fail - this table is optional
    } else {
      console.log('✅ Excess_Amount_2025 fetched:', excessRaw?.length || 0, 'records');
    }

    if (!ownersFullRaw || !p25Raw || !p26Raw) {
      console.error('⚠️ Some required queries failed');
      return null;
    }

    // Check if data tables are empty
    if (p25Raw.length === 0) {
      console.warn('⚠️ Collections_2025 is EMPTY - no payment records in database!');
    } else {
      console.log('✅ Collections_2025 has data for', p25Raw.length, 'records');
    }
    
    if (p26Raw.length === 0) {
      console.warn('⚠️ Collections_2026 is EMPTY - no payment records in database!');
    } else {
      console.log('✅ Collections_2026 has data for', p26Raw.length, 'records');
    }

    // Smart column name detection with detailed logging
    const detectColumn = (obj: any, ...possibleNames: string[]) => {
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
      
      console.log(`📊 Found ${numericCols.length} numeric columns: ${numericCols.join(', ')}`);
      return numericCols;
    };

    // Debug: Log actual columns from sample records
    if (p25Raw && p25Raw.length > 0) {
      debugInfo.p25Sample = p25Raw[0];
      debugInfo.p25Columns = Object.keys(p25Raw[0]);
      console.log('📊 Collections_2025 sample record:', p25Raw[0]);
      console.log('   Available columns:', Object.keys(p25Raw[0]).join(', '));
      
      // Log to window for debugging
      if (typeof window !== 'undefined') {
        (window as any).p25SampleDebug = p25Raw[0];
      }
    } else {
      console.warn('⚠️ Collections_2025 has NO data!');
    }
    
    if (p26Raw && p26Raw.length > 0) {
      debugInfo.p26Sample = p26Raw[0];
      debugInfo.p26Columns = Object.keys(p26Raw[0]);
      console.log('📊 Collections_2026 sample record:', p26Raw[0]);
      console.log('   Available columns:', Object.keys(p26Raw[0]).join(', '));
      
      // Log to window for debugging
      if (typeof window !== 'undefined') {
        (window as any).p26SampleDebug = p26Raw[0];
      }
    } else {
      console.warn('⚠️ Collections_2026 has NO data!');
    }

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
        outstanding: cleanAmount(detectColumn(p, 'Outstanding_in_2025', 'outstanding_in_2025'))
      };
      if (idx === 0) {
        console.log('✅ Collections_2025 first record mapped:', mapped);
        console.log('   Raw record was:', p);
      }
      return mapped;
    });

    // Build excess map
    const excessMap: Record<string, number> = {};
    (excessRaw || []).forEach(e => {
      const flatNo = detectColumn(e, 'Flat_No', 'flat_no', 'Flat No');
      const carryFwd = detectColumn(e, 'Carry_Forward_to_2026', 'carry_forward_to_2026');
      if (flatNo) excessMap[flatNo] = cleanAmount(carryFwd);
    });
    console.log('📊 Excess Map built for', Object.keys(excessMap).length, 'flats');

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
        outstanding: cleanAmount(detectColumn(p, 'Outstanding', 'outstanding'))
      };
      if (idx === 0) {
        console.log('✅ Collections_2026 first record mapped:', mapped);
        console.log('   Raw record was:', p);
      }
      return mapped;
    });

    console.log('✅ Data mapping complete. Summary:', {
      owners: owners.length,
      collections2025: p25.length,
      collections2026: p26.length,
      averageP25Amount: p25.length > 0 ? (p25.reduce((sum, p) => sum + (p.aug + p.sept + p.oct + p.nov + p.dec), 0) / p25.length / 5).toFixed(2) : 'N/A',
      averageP26Amount: p26.length > 0 ? (p26.reduce((sum, p) => sum + (p.jan + p.feb + p.mar + p.apr + p.may + p.jun + p.jul + p.aug + p.sep + p.oct + p.nov + p.dec), 0) / p26.length / 12).toFixed(2) : 'N/A'
    });

    return { owners, p25, p26 };
  } catch (err) {
    console.error('❌ Supabase operation failed:', err);
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
