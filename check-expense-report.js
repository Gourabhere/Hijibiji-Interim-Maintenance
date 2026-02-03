
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bhdrlzaqejkrqsozbcbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZHJsemFxZWprcnFzb3piY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzM4OTAsImV4cCI6MjA4NTQ0OTg5MH0.W1kWS99fv-QjQI_eVE3XvPhMWbgMQoGqOtaUHcVlP9s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkExpenseReport() {
    const { data, error } = await supabase
        .from('Expense_report_2025')
        .select('*');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Expense_Report_2025 Data:');
    console.log(JSON.stringify(data, null, 2));
}

checkExpenseReport();
