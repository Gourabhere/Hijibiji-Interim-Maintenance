
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.48.1';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchAllData = async () => {
  const { data: owners, error: ownersError } = await supabase.from('owners').select('*').order('sn', { ascending: true });
  const { data: p25, error: p25Error } = await supabase.from('payments_2025').select('*');
  const { data: p26, error: p26Error } = await supabase.from('payments_2026').select('*');

  if (ownersError || p25Error || p26Error) {
    console.error('Error fetching Supabase data:', { ownersError, p25Error, p26Error });
    return null;
  }

  return { owners, p25, p26 };
};

export const upsertOwners = async (owners: any[]) => {
  const { error } = await supabase.from('owners').upsert(owners);
  return { error };
};

export const upsertPayments2025 = async (payments: any[]) => {
  const { error } = await supabase.from('payments_2025').upsert(payments);
  return { error };
};

export const upsertPayments2026 = async (payments: any[]) => {
  const { error } = await supabase.from('payments_2026').upsert(payments);
  return { error };
};
