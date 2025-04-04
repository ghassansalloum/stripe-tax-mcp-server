// Script to list available methods in the Stripe SDK for Tax Calculations
import Stripe from 'stripe';

// Initialize Stripe with a dummy key
const stripe = new Stripe('sk_test_dummy');

console.log('Inspecting Stripe SDK version:', stripe.VERSION);

// Check the tax calculations namespace
if (stripe.tax && stripe.tax.calculations) {
  console.log('\n--- Tax Calculations Methods ---');
  
  // List all own properties of the tax calculations object
  const calcMethods = Object.getOwnPropertyNames(stripe.tax.calculations)
    .filter(name => typeof stripe.tax.calculations[name] === 'function' && !name.startsWith('_'))
    .sort();
  
  console.log('Methods:', calcMethods);
  
  // Check for create and listLineItems specifically
  console.log('\n--- Checking for specific methods ---');
  console.log('Has create method:', typeof stripe.tax.calculations.create === 'function');
  console.log('Has listLineItems method:', typeof stripe.tax.calculations.listLineItems === 'function');
  console.log('Has retrieve method:', typeof stripe.tax.calculations.retrieve === 'function');
  
  // Try to list all methods whether they exist or not
  console.log('\n--- Attempting to access methods directly ---');
  const methodsToCheck = ['create', 'retrieve', 'listLineItems', 'list', 'del', 'update'];
  
  methodsToCheck.forEach(method => {
    try {
      console.log(`${method}:`, stripe.tax.calculations[method] ? 'exists' : 'undefined');
    } catch (e) {
      console.log(`${method}: error -`, e.message);
    }
  });
} else {
  console.log('Tax calculations namespace not found in this version of the Stripe SDK');
}

// Also check the transactions resources which should have retrieve
if (stripe.tax && stripe.tax.transactions) {
  console.log('\n--- Tax Transactions Methods (for comparison) ---');
  
  const transMethods = Object.getOwnPropertyNames(stripe.tax.transactions)
    .filter(name => typeof stripe.tax.transactions[name] === 'function' && !name.startsWith('_'))
    .sort();
  
  console.log('Methods:', transMethods);
  console.log('Has retrieve method:', typeof stripe.tax.transactions.retrieve === 'function');
}

// Check if there are any methods added by a prototype
console.log('\n--- Checking inheritied methods ---');
const calcProto = Object.getPrototypeOf(stripe.tax.calculations);
const protoMethods = Object.getOwnPropertyNames(calcProto)
  .filter(name => typeof calcProto[name] === 'function' && !name.startsWith('_'))
  .sort();

console.log('Prototype methods:', protoMethods);

console.log('\n--- End of Tax API Inspection ---');