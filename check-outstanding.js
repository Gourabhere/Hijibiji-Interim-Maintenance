// Script to check outstanding amounts for specific flats
// Run with: node check-outstanding.js

import { supabase } from './lib/supabase.js';

// Function to get outstanding amount for a specific flat
async function getOutstandingForFlat(flatNo) {
  try {
    console.log(`\n🔍 Checking outstanding for flat: ${flatNo}`);
    
    // Query Collections_2025 for outstanding amount
    const { data: p25, error: p25Error } = await supabase
      .from('Collections_2025')
      .select('*')
      .eq('Flat_No', flatNo)
      .single();
    
    if (p25Error) {
      console.error(`❌ Error fetching 2025 data for ${flatNo}:`, p25Error.message);
      return null;
    }
    
    // Query Collections_2026 for outstanding amount
    const { data: p26, error: p26Error } = await supabase
      .from('Collections_2026')
      .select('*')
      .eq('Flat_No', flatNo)
      .single();
    
    if (p26Error) {
      console.error(`❌ Error fetching 2026 data for ${flatNo}:`, p26Error.message);
      return null;
    }
    
    // Extract outstanding amounts
    const outstanding2025 = p25?.Outstanding_in_2025 || 0;
    const outstanding2026 = p26?.Outstanding || 0;
    const totalOutstanding = outstanding2025 + outstanding2026;
    
    console.log(`📊 ${flatNo} - 2025 Outstanding: ₹${outstanding2025}`);
    console.log(`📊 ${flatNo} - 2026 Outstanding: ₹${outstanding2026}`);
    console.log(`📊 ${flatNo} - Total Outstanding: ₹${totalOutstanding}`);
    
    return {
      flatNo,
      outstanding2025,
      outstanding2026,
      totalOutstanding
    };
    
  } catch (error) {
    console.error(`❌ Error checking outstanding for ${flatNo}:`, error);
    return null;
  }
}

// Main function to check multiple flats
async function checkOutstanding() {
  try {
    console.log('📊 Checking outstanding amounts for specific flats...\n');
    
    const flatsToCheck = ['1a3', '1e1'];
    const results = [];
    
    for (const flat of flatsToCheck) {
      const result = await getOutstandingForFlat(flat);
      if (result) {
        results.push(result);
      }
    }
    
    console.log('\n📋 Summary:');
    results.forEach(result => {
      console.log(`  ${result.flatNo}: ₹${result.totalOutstanding}`);
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Error in checkOutstanding:', error);
    return [];
  }
}

// Run the check
checkOutstanding()
  .then(results => {
    if (results.length === 0) {
      console.log('⚠️ No results found for the specified flats');
    }
  })
  .catch(error => {
    console.error('❌ Script execution failed:', error);
  });