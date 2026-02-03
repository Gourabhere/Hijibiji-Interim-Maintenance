// Quick test to check Supabase data
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bhdrlzaqejkrqsozbcbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZHJsemFxZWprcnFzb3piY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzM4OTAsImV4cCI6MjA4NTQ0OTg5MH0.W1kWS99fv-QjQI_eVE3XvPhMWbgMQoGqOtaUHcVlP9s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  try {
    console.log('Testing Supabase connection...\n');

    // Test Collections_2025
    console.log('=== Collections_2025 ===');
    const { data: p25, error: p25Error } = await supabase
      .from('Collections_2025')
      .select('*')
      .limit(1);

    if (p25Error) {
      console.error('Error:', p25Error);
    } else if (p25 && p25.length > 0) {
      console.log('Columns:', Object.keys(p25[0]).join(', '));
      console.log('First record:', JSON.stringify(p25[0], null, 2));
    } else {
      console.log('No data in Collections_2025');
    }

    // Test Collections_2026
    console.log('\n=== Collections_2026 ===');
    const { data: p26, error: p26Error } = await supabase
      .from('Collections_2026')
      .select('*')
      .limit(1);

    if (p26Error) {
      console.error('Error:', p26Error);
    } else if (p26 && p26.length > 0) {
      console.log('Columns:', Object.keys(p26[0]).join(', '));
      console.log('First record:', JSON.stringify(p26[0], null, 2));
    } else {
      console.log('No data in Collections_2026');
    }

    // Count records
    console.log('\n=== Record Counts ===');
    const { count: p25Count, error: p25CountError } = await supabase
      .from('Collections_2025')
      .select('*', { count: 'exact', head: true });

    const { count: p26Count, error: p26CountError } = await supabase
      .from('Collections_2026')
      .select('*', { count: 'exact', head: true });

    console.log(`Collections_2025 records: ${p25Count}`);
    console.log(`Collections_2026 records: ${p26Count}`);

    // Test Maintenance_Config
    console.log('\n=== Maintenance_Config ===');
    const { data: config, error: configError } = await supabase
      .from('Maintenance_Config')
      .select('*');

    if (configError) {
      console.log('❌ Maintenance_Config table NOT FOUND or not accessible.');
      console.log('   Run the provided SQL script to create it.');
    } else {
      console.log(`✅ Found ${config.length} config records.`);
      config.forEach(c => console.log(`   - ${c.key}:`, JSON.stringify(c.value)));
    }

  } catch (err) {
    console.error('Fatal error:', err);
  }
}

test();
