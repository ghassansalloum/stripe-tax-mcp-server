// Script to check the installed Stripe SDK version
import Stripe from 'stripe';
import fs from 'fs/promises';

// Initialize Stripe with a dummy key
const stripe = new Stripe('sk_test_dummy');

console.log('Currently installed Stripe SDK version:', stripe.VERSION);
console.log('Compare with latest version mentioned in docs: 18.0.0');

// Check if we can see all the prototype methods on calculations
if (stripe.tax && stripe.tax.calculations) {
  console.log('\nAvailable tax.calculations methods:');
  const proto = Object.getPrototypeOf(stripe.tax.calculations);
  const methods = Object.getOwnPropertyNames(proto)
    .filter(name => typeof proto[name] === 'function' && !name.startsWith('_'));
  
  console.log(methods);
}

// Print a message about checking for the retrieve method
console.log(`\nThe retrieve method is ${typeof stripe.tax.calculations.retrieve === 'function' ? 'available' : 'NOT available'} in the current SDK version.`);

console.log('\nIf there is a Stripe SDK version 18.0.0 with a retrieve method, we need to update our SDK.');

// Read package.json to get the current Stripe version
async function readPackageJson() {
  try {
    const packageJsonContent = await fs.readFile('./package.json', 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    console.log('Current package.json dependency:');
    console.log(`"stripe": "${packageJson.dependencies.stripe}"`);
  } catch (err) {
    console.error('Error reading package.json:', err);
  }
  
  console.log('\nTo update to latest version, you would run:');
  console.log('npm install stripe@latest --save');
}

readPackageJson();