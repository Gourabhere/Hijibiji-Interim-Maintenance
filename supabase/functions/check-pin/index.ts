import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { flatNo } = await req.json();

        if (!flatNo) {
            return new Response(
                JSON.stringify({ error: 'flatNo is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('flat_pins')
            .select('failed_attempts, locked_until')
            .eq('flat_no', flatNo)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is no rows found
            console.error('check-pin error:', error);
            return new Response(
                JSON.stringify({ hasPin: false, error: 'Database error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const hasPin = !!data;
        const isLocked = data?.locked_until && new Date(data.locked_until) > new Date();

        return new Response(
            JSON.stringify({ hasPin, isLocked, failedAttempts: data?.failed_attempts || 0 }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
