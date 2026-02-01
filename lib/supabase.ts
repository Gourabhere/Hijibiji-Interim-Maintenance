
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.48.1';

// Provide empty strings as fallbacks to prevent createClient from throwing immediately
const supabaseUrl = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || '';

// Only initialize if we have valid-looking keys, otherwise provide a dummy client
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const fetchAllData = async () => {
  if (!supabase) {
    console.warn('Supabase not configured. Skipping cloud fetch.');
    return null;
  }

  try {
    const { data: owners, error: ownersError } = await supabase.from('owners').select('*').order('sn', { ascending: true });
    const { data: p25, error: p25Error } = await supabase.from('payments_2025').select('*');
    const { data: p26, error: p26Error } = await supabase.from('payments_2026').select('*');

    if (ownersError || p25Error || p26Error) {
      console.error('Error fetching Supabase data:', { ownersError, p25Error, p26Error });
      return null;
    }

    return { owners, p25, p26 };
  } catch (e) {
    console.error('Supabase connection failed:', e);
    return null;
  }
};

export const upsertOwners = async (owners: any[]) => {
  if (!supabase) throw new Error('Supabase not configured');
  return await supabase.from('owners').upsert(owners);
};

export const upsertPayments2025 = async (payments: any[]) => {
  if (!supabase) throw new Error('Supabase not configured');
  return await supabase.from('payments_2025').upsert(payments);
};

export const upsertPayments2026 = async (payments: any[]) => {
  if (!supabase) throw new Error('Supabase not configured');
  return await supabase.from('payments_2026').upsert(payments);
};
