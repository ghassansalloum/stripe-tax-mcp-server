// Test script for listing tax calculation line items
import Stripe from 'stripe';

// Parse command line arguments to get calculation ID
let calculationId = 'taxcalc_1R9gxVKaxbmGncEifpBKm6fs'; // default ID
process.argv.forEach(arg => {
  if (arg.startsWith('--id=')) {
    calculationId = arg.substring(5);
  }
});

// Test data
const apiKey = 'sk_test_51PWT2cKaxbmGncEinBnQ5lyb8Bri4Y3jJrwzceLwZJsfa3ckhu5nJtx8uUPgrv2sZ5gURfaqjs4y99ktyVgteD6N00BDso5koh';

/**
 * Retrieves line items for a tax calculation from Stripe
 * @param {string} apiKey - The Stripe API key
 * @param {string} calculationId - The ID of the tax calculation to retrieve line items for
 * @param {Object} options - Additional options like limit, starting_after, etc.
 * @returns {Object} The tax calculation line items
 */
async function listTaxCalculationLineItems(apiKey, calculationId, options = {}) {
  try {
    // Initialize Stripe with the provided API key
    const stripe = new Stripe(apiKey);
    
    console.log(`Attempting to retrieve line items for tax calculation ID: ${calculationId}`);
    
    // Make the API call to retrieve the tax calculation line items
    // Tax breakdown is automatically included
    const lineItems = await stripe.tax.calculations.listLineItems(calculationId, options);
    return lineItems;
  } catch (error) {
    console.error("Error retrieving tax calculation line items:", error);
    throw new Error(`Failed to retrieve tax calculation line items: ${error.message}`);
  }
}

// Run the test
(async () => {
  try {
    console.log('Starting tax calculation line items retrieval test...');
    
    // Test with a limit of 3 items
    const options = { limit: 3 };
    const lineItems = await listTaxCalculationLineItems(apiKey, calculationId, options);
    
    console.log('Tax calculation line items retrieved successfully:');
    console.log(JSON.stringify(lineItems, null, 2));
    
    // Check for expected properties
    if (lineItems.object === 'list') {
      console.log('\n✅ Test passed: Object type is correct');
    } else {
      console.log(`\n❌ Test failed: Object type is "${lineItems.object}" instead of "list"`);
    }
    
    if (Array.isArray(lineItems.data)) {
      console.log('✅ Test passed: Line items data is an array');
      
      if (lineItems.data.length > 0) {
        console.log(`✅ Test passed: Retrieved ${lineItems.data.length} line items`);
        
        // Check first line item
        const item = lineItems.data[0];
        if (item.object === 'tax.calculation_line_item') {
          console.log('✅ Test passed: Line item object type is correct');
        } else {
          console.log(`❌ Test failed: Line item object type is "${item.object}" instead of "tax.calculation_line_item"`);
        }
        
        // Check for essential data properties in a line item
        const requiredItemProps = ['amount', 'amount_tax', 'tax_breakdown'];
        const missingItemProps = requiredItemProps.filter(prop => !item.hasOwnProperty(prop));
        
        if (missingItemProps.length === 0) {
          console.log('✅ Test passed: All required line item properties are present');
        } else {
          console.log(`❌ Test failed: Missing required line item properties: ${missingItemProps.join(', ')}`);
        }
        
        // Verify that tax_breakdown is expanded
        if (Array.isArray(item.tax_breakdown) && item.tax_breakdown.length > 0) {
          console.log('✅ Test passed: Line item tax_breakdown is expanded');
          
          // Check for tax rate details in the breakdown
          const breakdown = item.tax_breakdown[0];
          if (breakdown.tax_rate_details) {
            console.log('✅ Test passed: Tax rate details are present in tax_breakdown');
          } else {
            console.log('❌ Test failed: Tax rate details missing in tax_breakdown');
          }
        } else {
          console.log('❌ Test failed: Line item tax_breakdown is not expanded properly');
        }
      } else {
        console.log('⚠️ Warning: No line items found, unable to test line item properties');
      }
    } else {
      console.log('❌ Test failed: Line items data is not an array');
    }
    
    // Test pagination info
    if ('has_more' in lineItems) {
      console.log('✅ Test passed: Pagination info is present');
    } else {
      console.log('❌ Test failed: Missing pagination info (has_more)');
    }
    
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Test failed with error:', error.message);
    process.exit(1);
  }
})();