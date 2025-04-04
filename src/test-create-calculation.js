// Test script for creating a tax calculation
import Stripe from 'stripe';

// Test data
const apiKey = 'sk_test_51PWT2cKaxbmGncEinBnQ5lyb8Bri4Y3jJrwzceLwZJsfa3ckhu5nJtx8uUPgrv2sZ5gURfaqjs4y99ktyVgteD6N00BDso5koh';
const params = {
  currency: 'usd',
  customer_details: {
    address: {
      country: 'US',
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94105'
    },
    address_source: 'shipping' // Required when providing an address
  },
  line_items: [
    {
      amount: 1000,
      reference: 'test_product',
      tax_behavior: 'exclusive'
    }
  ]
};

/**
 * Creates a tax calculation in Stripe
 * @param {string} apiKey - The Stripe API key
 * @param {Object} params - The parameters for the tax calculation
 * @returns {Object} The created tax calculation object
 */
async function createTaxCalculation(apiKey, params) {
  try {
    // Initialize Stripe with the provided API key
    const stripe = new Stripe(apiKey);
    
    console.log(`Attempting to create a tax calculation with the following parameters:`);
    console.log(JSON.stringify(params, null, 2));
    
    // Make the API call to create the tax calculation
    const calculation = await stripe.tax.calculations.create(params);
    return calculation;
  } catch (error) {
    console.error("Error creating tax calculation:", error);
    throw new Error(`Failed to create tax calculation: ${error.message}`);
  }
}

// Run the test
(async () => {
  try {
    console.log('Starting tax calculation creation test...');
    
    const calculation = await createTaxCalculation(apiKey, params);
    
    console.log('Tax calculation created successfully:');
    console.log(JSON.stringify(calculation, null, 2));
    
    // Check for expected properties
    if (calculation.id && calculation.id.startsWith('taxcalc_')) {
      console.log('\n✅ Test passed: Calculation ID is valid');
    } else {
      console.log('\n❌ Test failed: Calculation ID is invalid or missing');
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
    
    // Store the calculation ID for use in line items test
    console.log(`\nStoring calculation ID for line items test: ${calculation.id}`);
    console.log(`To test line items, run: npm run test:lineitems -- --id=${calculation.id}`);
    
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Test failed with error:', error.message);
    process.exit(1);
  }
})();