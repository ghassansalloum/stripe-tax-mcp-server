// Test script for retrieving a tax calculation
import Stripe from 'stripe';

// Parse command line arguments to get calculation ID
let calculationId = 'taxcalc_1R9hJdKaxbmGncEiJdwPh78S'; // default ID (from previous test)
process.argv.forEach(arg => {
  if (arg.startsWith('--id=')) {
    calculationId = arg.substring(5);
  }
});

// Test data - replace with your own valid Stripe API key
const apiKey = process.env.STRIPE_API_KEY || 'sk_test_your_test_key_here';

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
    
    // Make the API call to retrieve the tax calculation with expanded line_items
    // In Stripe Node.js SDK, options need to be passed as query parameters
    const calculation = await stripe.tax.calculations.retrieve(calculationId, { expand: ['line_items'] });
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
    
    // Verify expanded line_items is present
    if (calculation.line_items && calculation.line_items.object === 'list') {
      console.log('✅ Test passed: Expanded line_items is present');
      
      // Check if data array exists
      if (Array.isArray(calculation.line_items.data) && calculation.line_items.data.length > 0) {
        console.log('✅ Test passed: line_items.data array is present and contains items');
        
        // Check if tax_breakdown is present in each line item
        const firstItem = calculation.line_items.data[0];
        if (Array.isArray(firstItem.tax_breakdown) && firstItem.tax_breakdown.length > 0) {
          console.log('✅ Test passed: tax_breakdown is present in line items');
        } else {
          console.log('❌ Test failed: tax_breakdown is missing in line items');
        }
      } else {
        console.log('❌ Test failed: line_items.data array is empty or missing');
      }
    } else {
      console.log('❌ Test failed: Expanded line_items is missing or invalid');
    }
    
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Test failed with error:', error.message);
    process.exit(1);
  }
})();