
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bhdrlzaqejkrqsozbcbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZHJsemFxZWprcnFzb3piY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzM4OTAsImV4cCI6MjA4NTQ0OTg5MH0.W1kWS99fv-QjQI_eVE3XvPhMWbgMQoGqOtaUHcVlP9s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchReport() {
    console.log('Fetching data from Expense_report_2025...');

    const { data, error } = await supabase
        .from('Expense_report_2025')
        .select('*');

    if (error) {
        console.error('❌ Error fetching report:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} records:`);
        console.table(data);

        // Also log raw JSON for full clarity
        console.log('\nRaw JSON:');
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log('⚠️ Table exists but is empty.');
    }
}

fetchReport();
