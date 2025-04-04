// Test script for retrieving a tax calculation
import Stripe from 'stripe';

// Parse command line arguments to get calculation ID
let calculationId = 'taxcalc_1R9hJdKaxbmGncEiJdwPh78S'; // default ID (from previous test)
process.argv.forEach(arg => {
  if (arg.startsWith('--id=')) {
    calculationId = arg.substring(5);
  }
});

// Test data
const apiKey = 'sk_test_51PWT2cKaxbmGncEinBnQ5lyb8Bri4Y3jJrwzceLwZJsfa3ckhu5nJtx8uUPgrv2sZ5gURfaqjs4y99ktyVgteD6N00BDso5koh';

/**
 * Retrieves a tax calculation from Stripe by ID
 * @param {string} apiKey - The Stripe API key
 * @param {string} calculationId - The ID of the tax calculation to retrieve
 * @returns {Object} The tax calculation object
 */
async function retrieveTaxCalculation(apiKey, calculationId) {
  try {
    // Initialize Stripe with the provided API key
    const stripe = new Stripe(apiKey);
    
    console.log(`Attempting to retrieve tax calculation with ID: ${calculationId}`);
    
    // Make the API call to retrieve the tax calculation
    const calculation = await stripe.tax.calculations.retrieve(calculationId);
    return calculation;
  } catch (error) {
    console.error("Error retrieving tax calculation:", error);
    throw new Error(`Failed to retrieve tax calculation: ${error.message}`);
  }
}

// Run the test
(async () => {
  try {
    console.log('Starting tax calculation retrieval test...');
    
    const calculation = await retrieveTaxCalculation(apiKey, calculationId);
    
    console.log('Tax calculation retrieved successfully:');
    console.log(JSON.stringify(calculation, null, 2));
    
    // Check for expected properties
    if (calculation.id === calculationId) {
      console.log('\n✅ Test passed: Calculation ID matches expected value');
    } else {
      console.log('\n❌ Test failed: Calculation ID does not match expected value');
    }
    
    if (calculation.object === 'tax.calculation') {
      console.log('✅ Test passed: Object type is correct');
    } else {
      console.log(`❌ Test failed: Object type is "${calculation.object}" instead of "tax.calculation"`);
    }
    
    // Check for essential data properties
    const requiredProps = ['amount_total', 'currency', 'tax_breakdown'];
    const missingProps = requiredProps.filter(prop => !calculation.hasOwnProperty(prop));
    
    if (missingProps.length === 0) {
      console.log('✅ Test passed: All required properties are present');
    } else {
      console.log(`❌ Test failed: Missing required properties: ${missingProps.join(', ')}`);
    }
    
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Test failed with error:', error.message);
    process.exit(1);
  }
})();