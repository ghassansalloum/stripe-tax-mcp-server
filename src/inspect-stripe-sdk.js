// Script to inspect the Stripe SDK structure
import Stripe from 'stripe';

// Initialize Stripe with a dummy key (won't make real API calls)
const stripe = new Stripe('sk_test_dummy');

// Helper function to explore API structure
function exploreApiStructure(obj, path = '') {
  const results = [];
  
  // Get all properties of the object
  const props = Object.getOwnPropertyNames(obj);
  
  for (const prop of props) {
    // Skip internal properties
    if (prop.startsWith('_')) continue;
    
    const fullPath = path ? `${path}.${prop}` : prop;
    const value = obj[prop];
    
    // Check if it's a method or a nested object
    if (typeof value === 'function') {
      results.push(`Method: ${fullPath}`);
    } else if (typeof value === 'object' && value !== null) {
      results.push(`Namespace: ${fullPath}`);
      // Recursively explore the nested object
      results.push(...exploreApiStructure(value, fullPath));
    }
  }
  
  return results;
}

// Specifically explore the tax namespace
console.log('\n--- Exploring Stripe Tax API Structure ---\n');

if (stripe.tax) {
  console.log('Available tax namespaces:');
  Object.keys(stripe.tax).forEach(key => {
    console.log(`- stripe.tax.${key}`);
  });
  
  // List all methods in the tax namespace
  console.log('\nDetailed structure:');
  const taxApiStructure = exploreApiStructure(stripe.tax, 'stripe.tax');
  taxApiStructure.forEach(item => console.log(item));
  
  // Check specifically for calculations methods
  if (stripe.tax.calculations) {
    console.log('\nTax Calculations Methods:');
    const methods = Object.getOwnPropertyNames(stripe.tax.calculations)
      .filter(name => !name.startsWith('_') && typeof stripe.tax.calculations[name] === 'function');
    
    if (methods.length > 0) {
      methods.forEach(method => console.log(`- stripe.tax.calculations.${method}`));
    } else {
      console.log('No methods found in stripe.tax.calculations');
    }
    
    // Check if it's a function itself (some Stripe resources are both callable and have methods)
    if (typeof stripe.tax.calculations === 'function') {
      console.log('\nNote: stripe.tax.calculations is itself a function');
    }
  } else {
    console.log('\nNo tax.calculations namespace found');
  }
} else {
  console.log('No tax namespace found in the Stripe SDK');
}

console.log('\n--- End of Stripe Tax API Structure ---');