
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bhdrlzaqejkrqsozbcbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZHJsemFxZWprcnFzb3piY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzM4OTAsImV4cCI6MjA4NTQ0OTg5MH0.W1kWS99fv-QjQI_eVE3XvPhMWbgMQoGqOtaUHcVlP9s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function probeTables() {
    const candidates = [
        'Expenses',
        'Monthly_Expenses',
        'Maintenance_Expenses',
        'Expenses_2025',
        'Expense_Details',
        'Society_Expenses',
        'Sinking_Fund'
    ];

    console.log('Probing for expense tables...');

    for (const table of candidates) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (!error) {
                console.log(`✅ FOUND TABLE: "${table}"`);
                if (data && data.length > 0) {
                    console.log('   Columns:', Object.keys(data[0]).join(', '));
                    console.log('   Sample:', JSON.stringify(data[0]));
                } else {
                    console.log('   Table is empty.');
                }
            } else {
                // console.log(`❌ ${table}: ${error.message}`);
            }
        } catch (e) {
            console.log(`Error probing ${table}:`, e);
        }
    }
}

probeTables();
