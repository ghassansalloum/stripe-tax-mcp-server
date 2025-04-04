// Test script for listing tax registrations
// Usage: node test-list-registrations.js SK_YOUR_API_KEY

import Stripe from 'stripe';

// Get the API key from command line arguments
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Error: Stripe API key is required.');
  console.error('Usage: node test-list-registrations.js SK_YOUR_API_KEY');
  process.exit(1);
}

async function testListRegistrations() {
  try {
    // Initialize Stripe with the provided API key
    const stripe = new Stripe(apiKey);
    
    console.log('Retrieving tax registrations...');
    
    // Make the API call to retrieve tax registrations
    const registrations = await stripe.tax.registrations.list();
    
    console.log('Tax registrations retrieved successfully:');
    console.log(JSON.stringify(registrations, null, 2));
    
    return registrations;
  } catch (error) {
    console.error('Error retrieving tax registrations:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('Authentication failed. Please check your API key.');
    }
    process.exit(1);
  }
}

// Run the test
testListRegistrations();