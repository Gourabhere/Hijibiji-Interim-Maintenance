
import { createClient } from '@supabase/supabase-js';

// Secondary Project: vmtklhmiuxbfxmhpnjoi (Task Logs)
const SUPABASE_TASKS_URL = 'https://vmtklhmiuxbfxmhpnjoi.supabase.co';
const SUPABASE_TASKS_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdGtsaG1pdXhiZnhtaHBuam9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MTgwMTcsImV4cCI6MjA4MjQ5NDAxN30.62uIPu8sarcMIZv4OgRqplmxVmOxqbTYIPIv1vv4ICo';

const supabaseTasks = createClient(SUPABASE_TASKS_URL, SUPABASE_TASKS_ANON_KEY);

async function inspectTable() {
    console.log('🔍 Inspecting task_logs table structure...');

    try {
        const { data: logs, error } = await supabaseTasks
            .from('task_logs')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Error fetching logs:', error);
            return;
        }

        if (logs && logs.length > 0) {
            console.log('✅ Sample Record Keys:', Object.keys(logs[0]));
            console.log('📄 Sample Record:', logs[0]);
        } else {
            console.log('⚠️ Table is empty.');
        }

    } catch (err) {
        console.error('❌ Exception:', err);
    }
}

inspectTable();
