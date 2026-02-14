import { createClient } from '@supabase/supabase-js';

// Main Project Config
const SUPABASE_URL = 'https://bhdrlzaqejkrqsozbcbr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZHJsemFxZWprcnFzb3piY2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzM4OTAsImV4cCI6MjA4NTQ0OTg5MH0.W1kWS99fv-QjQI_eVE3XvPhMWbgMQoGqOtaUHcVlP9s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectTasks() {
    console.log('--- Inspecting task_logs in Main Project ---');

    // 1. Try to fetch one record
    const { data, error } = await supabase
        .from('task_logs')
        .select('*')
        .limit(1);

    if (error) {
        console.error('❌ Error fetching task_logs:', error);
        if (error.code === '42P01') {
            console.error('   -> Table "task_logs" does not exist in this project.');
        } else if (error.code === '42501') {
            console.error('   -> Permission denied (RLS policy). Needs public read access.');
        }
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  Table "task_logs" exists but is EMPTY.');
        return;
    }

    console.log('✅ Successfully fetched record!');
    console.log('Sample Record Structure:', JSON.stringify(data[0], null, 2));

    // 2. Check for specific columns
    const r = data[0];
    const missingCols = [];
    if (r.block === undefined) missingCols.push('block');
    if (r.flat === undefined) missingCols.push('flat');
    if (r.floor === undefined) missingCols.push('floor');
    if (r.timestamp === undefined) missingCols.push('timestamp');
    if (r.image_url === undefined) missingCols.push('image_url');

    if (missingCols.length > 0) {
        console.warn('⚠️  Potential Missing/Renamed Columns:', missingCols.join(', '));
        console.log('Available Columns:', Object.keys(r).join(', '));
    } else {
        console.log('✅ All expected columns (block, flat, floor, timestamp, image_url) found.');
    }
}

inspectTasks();
