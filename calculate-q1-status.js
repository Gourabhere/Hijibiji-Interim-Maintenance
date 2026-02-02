// Script to calculate Q1 2026 status for specific flats using the same formula
// Run with: node calculate-q1-status.js

import { supabase } from './lib/supabase.js';

// Constants
const Q1_DUE_AMOUNT = 6000;

// Function to get Q1 2026 status for a specific flat
async function getQ1StatusForFlat(flatNo) {
  try {
    console.log(`\n⏰ Calculating Q1 2026 status for flat: ${flatNo}`);
    
    // Query Collections_2026 for carry forward and Q1 payment
    const { data: p26, error: p26Error } = await supabase
      .from('Collections_2026')
      .select('*')
      .eq('Flat_No', flatNo)
      .single();
    
    if (p26Error) {
      console.error(`❌ Error fetching 2026 data for ${flatNo}:`, p26Error.message);
      return null;
    }
    
    // Extract values
    const carryForward2025 = p26?.carryForward2025 || 0;
    const q1Payment = p26?.q1Payment || 0;
    const totalAvailable = carryForward2025 + q1Payment;
    
    // Determine Q1 status using the same formula
    let q1Status = 'Due';
    
    if (q1Payment > 0) {
      q1Status = 'Paid';
    } else if (carryForward2025 >= Q1_DUE_AMOUNT) {
      q1Status = 'Covered';
    } else if (carryForward2025 > 0) {
      q1Status = 'Partial Covered';
    } else {
      q1Status = 'Due';
    }
    
    console.log(`📊 ${flatNo} - Carry Forward 2025: ₹${carryForward2025}`);
    console.log(`📊 ${flatNo} - Q1 Payment: ₹${q1Payment}`);
    console.log(`📊 ${flatNo} - Total Available: ₹${totalAvailable}`);
    console.log(`📊 ${flatNo} - Q1 Due Amount: ₹${Q1_DUE_AMOUNT}`);
    console.log(`📊 ${flatNo} - Q1 2026 Status: ${q1Status}`);
    
    return {
      flatNo,
      carryForward2025,
      q1Payment,
      totalAvailable,
      q1DueAmount: Q1_DUE_AMOUNT,
      q1Status
    };
    
  } catch (error) {
    console.error(`❌ Error calculating Q1 status for ${flatNo}:`, error);
    return null;
  }
}

// Main function to check multiple flats
async function calculateQ1Status() {
  try {
    console.log('📊 Calculating Q1 2026 status for specific flats using the same formula...\n');
    
    const flatsToCheck = ['1a3', '1e1'];
    const results = [];
    
    for (const flat of flatsToCheck) {
      const result = await getQ1StatusForFlat(flat);
      if (result) {
        results.push(result);
      }
    }
    
    console.log('\n📅 Summary:');
    results.forEach(result => {
      console.log(`  ${result.flatNo}: ${result.q1Status} (Available: ₹${result.totalAvailable}, Due: ₹${result.q1DueAmount})`);
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Error in calculateQ1Status:', error);
    return [];
  }
}

// Run the calculation
calculateQ1Status()
  .then(results => {
    if (results.length === 0) {
      console.log('⚠️ No results found for the specified flats');
    }
  })
  .catch(error => {
    console.error('❌ Script execution failed:', error);
  });