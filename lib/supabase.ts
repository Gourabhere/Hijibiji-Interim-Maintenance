
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.48.1';

// Project credentials provided by the user
const SUPABASE_URL = 'https://xmrkiyaiqdspwhbfwiae.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcmtpeWFpcWRzcHdoYmZ3aWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MzcwMjQsImV4cCI6MjA4NTQxMzAyNH0.TO79AckV909Kga32xvSV5OPRST8x19UKx9MFOXaKbYQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetches all necessary portal data from Supabase and maps it to the frontend types.
 */
export const fetchAllData = async () => {
  try {
    const { data: ownersRaw, error: ownersError } = await supabase
      .from('owners')
      .select('*')
      .order('sn', { ascending: true });
    
    const { data: p25Raw, error: p25Error } = await supabase
      .from('payments_2025')
      .select('*');
    
    const { data: p26Raw, error: p26Error } = await supabase
      .from('payments_2026')
      .select('*');

    if (ownersError || p25Error || p26Error) {
      console.error('Supabase fetch error:', { ownersError, p25Error, p26Error });
      return null;
    }

    // Transform database records (snake_case) to application types (camelCase)
    const owners = (ownersRaw || []).map(o => ({
      sn: o.sn,
      flatNo: o.flat_no || o.flatNo,
      name: o.name,
      possessionDate: o.possession_date || o.possessionDate
    }));

    const p25 = (p25Raw || []).map(p => ({
      flatNo: p.flat_no || p.flatNo,
      aug: p.aug || 0,
      sept: p.sept || 0,
      oct: p.oct || 0,
      nov: p.nov || 0,
      dec: p.dec || 0,
      paidTillDate: p.paid_till_date || p.paidTillDate || 0,
      outstanding: p.outstanding || 0
    }));

    const p26 = (p26Raw || []).map(p => ({
      flatNo: p.flat_no || p.flatNo,
      carryForward2025: p.carry_forward_2025 || p.carryForward2025 || 0,
      q1Payment: p.q1_payment || p.q1Payment || 0,
      jan: p.jan || 0, feb: p.feb || 0, mar: p.mar || 0,
      apr: p.apr || 0, may: p.may || 0, jun: p.jun || 0,
      jul: p.jul || 0, aug: p.aug || 0, sep: p.sep || 0,
      oct: p.oct || 0, nov: p.nov || 0, dec: p.dec || 0,
      paidTillDate: p.paid_till_date || p.paidTillDate || 0,
      outstanding: p.outstanding || 0
    }));

    return { owners, p25, p26 };
  } catch (err) {
    console.error('Supabase connection failed unexpectedly:', err);
    return null;
  }
};

export const upsertOwners = async (owners: any[]) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  return await supabase.from('owners').upsert(owners);
};

export const upsertPayments2025 = async (payments: any[]) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  return await supabase.from('payments_2025').upsert(payments);
};

export const upsertPayments2026 = async (payments: any[]) => {
  if (!supabase) throw new Error('Supabase client not initialized');
  return await supabase.from('payments_2026').upsert(payments);
};
