
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bhdrlzaqejkrqsozbcbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZHJsemFxZWprcnFzb3piY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzM4OTAsImV4cCI6MjA4NTQ0OTg5MH0.W1kWS99fv-QjQI_eVE3XvPhMWbgMQoGqOtaUHcVlP9s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchSpecificValue() {
    console.log('Querying Expense_report_2025 for SL no 11...');

    const { data, error } = await supabase
        .from('Expense_Report_2025')
        .select('*')
        // Assuming there is an 'SL no' or similar column. If not, we might need to fetch all and filter or check column names. 
        // Based on typical schema, let's try 'Sl_No' or 'Sl. No.'.
        // Or cleaner: fetch simple select and filter in JS if unsure of column name exact casing.
        .limit(100);

    if (error) {
        console.error('❌ Error fetching data:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️ No data found.');
        return;
    }

    // Find row 11 (either by index 10 or by a specific ID column if it exists)
    // User asked for "SL no 11". I'll look for a column that looks like a serial number.
    const row = data.find(r => r['Sl No'] == 11 || r['SL No'] == 11 || r['Sl_No'] == 11 || r['id'] == 11 || r['Sl. No.'] == 11 || r['Sl. No'] == 11);

    if (row) {
        console.log(`✅ Found Row with SL no 11:`);
        console.log(JSON.stringify(row, null, 2));

        // Check for Dec_2025 column
        const decVal = row['Dec_2025'] || row['dec_2025'] || row['Dec 2025'] || row['December 2025'];
        console.log(`\n👉 Value for Dec_2025: ${decVal}`);
    } else {
        console.log('⚠️ Could not find a row with SL No 11. Here are the first few rows to check keys/ids:');
        console.log(JSON.stringify(data.slice(0, 3), null, 2));
    }
}

fetchSpecificValue();
