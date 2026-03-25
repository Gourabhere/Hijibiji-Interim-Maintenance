import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function hashPin(pin: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { flatNo, pin } = await req.json();

        if (!flatNo || !pin) {
            return new Response(
                JSON.stringify({ error: 'flatNo and pin are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get stored hash
        const { data, error } = await supabase
            .from('flat_pins')
            .select('id, pin_hash, failed_attempts, locked_until')
            .eq('flat_no', flatNo)
            .single();

        if (error || !data) {
            return new Response(
                JSON.stringify({ verified: false, error: 'PIN not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Check lock status
        if (data.locked_until && new Date(data.locked_until) > new Date()) {
            return new Response(
                JSON.stringify({ verified: false, error: 'Account locked due to too many attempts. Please verify via OTP.' }),
                { status: 423, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const inputHash = await hashPin(pin);
        const defaultHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // SHA-256 of "1234"

        if (inputHash === data.pin_hash) {
            // Correct PIN -> Reset failures
            await supabase
                .from('flat_pins')
                .update({ failed_attempts: 0, locked_until: null })
                .eq('id', data.id);

            return new Response(
                JSON.stringify({
                    verified: true,
                    isDefault: inputHash === defaultHash
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        } else {
            // Wrong PIN -> Increment failures
            const newFailures = (data.failed_attempts || 0) + 1;
            let updateData: any = { failed_attempts: newFailures };

            // Lock after 5 attempts
            if (newFailures >= 5) {
                // Lock for 1 hour (or until OTP verify)
                updateData.locked_until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            }

            await supabase
                .from('flat_pins')
                .update(updateData)
                .eq('id', data.id);

            return new Response(
                JSON.stringify({
                    verified: false,
                    error: newFailures >= 5 ? 'Too many attempts. Account locked. Please verify via OTP.' : 'Incorrect PIN',
                    attemptsLeft: Math.max(0, 5 - newFailures)
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

    } catch (err) {
        console.error('verify-pin error:', err);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
