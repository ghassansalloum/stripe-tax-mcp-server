// Script to debug the Stripe API and check for available methods
import Stripe from 'stripe';

// Initialize Stripe with a dummy key
const stripe = new Stripe('sk_test_dummy');

console.log('Stripe SDK Version:', stripe.VERSION);

// Helper function to print all properties and methods
function printProperties(obj, prefix = '') {
  // Get all own properties
  const properties = Object.getOwnPropertyNames(obj);
  
  properties.forEach(prop => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    const type = typeof obj[prop];
    
    // Skip internal properties
    if (prop.startsWith('_')) return;
    
    const fullPath = prefix ? `${prefix}.${prop}` : prop;
    
    if (type === 'function') {
      console.log(`Method: ${fullPath}()`);
    } else if (type === 'object' && obj[prop] !== null) {
      console.log(`Object: ${fullPath}`);
    } else {
      console.log(`Property: ${fullPath} = ${obj[prop]}`);
    }
  });
}

// Check for tax API availability
if (!stripe.tax) {
  console.log('Tax API not available in this version of the Stripe SDK');
  process.exit(1);
}

console.log('\n--- Tax API Structure ---');
printProperties(stripe.tax, 'stripe.tax');

// Focus on tax calculations
if (stripe.tax.calculations) {
  console.log('\n--- Tax Calculations API ---');
  printProperties(stripe.tax.calculations, 'stripe.tax.calculations');
  
  // Print the class name to understand the inheritance
  console.log('\nTax Calculations Resource Type:', Object.getPrototypeOf(stripe.tax.calculations).constructor.name);
  
  // Check if specific methods exist
  const methods = ['create', 'retrieve', 'update', 'list', 'del', 'listLineItems'];
  console.log('\nChecking for specific methods:');
  methods.forEach(method => {
    console.log(`- ${method}: ${typeof stripe.tax.calculations[method] === 'function' ? 'Available' : 'Not available'}`);
  });
  
  // Check what methods are available on the prototype
  const proto = Object.getPrototypeOf(stripe.tax.calculations);
  console.log('\nMethods on prototype:');
  Object.getOwnPropertyNames(proto)
    .filter(name => typeof proto[name] === 'function' && !name.startsWith('_'))
    .forEach(name => {
      console.log(`- ${name}()`);
    });
}

// Check tax transactions (which should have retrieve)
if (stripe.tax.transactions) {
  console.log('\n--- Tax Transactions API ---');
  printProperties(stripe.tax.transactions, 'stripe.tax.transactions');
  
  // Print the class name
  console.log('\nTax Transactions Resource Type:', Object.getPrototypeOf(stripe.tax.transactions).constructor.name);
  
  // Check if specific methods exist
  const methods = ['create', 'retrieve', 'update', 'list', 'del'];
  console.log('\nChecking for specific methods:');
  methods.forEach(method => {
    console.log(`- ${method}: ${typeof stripe.tax.transactions[method] === 'function' ? 'Available' : 'Not available'}`);
  });
}