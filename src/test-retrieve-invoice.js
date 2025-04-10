// Test script for Stripe Invoice retrieval functionality
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use API key from environment or provide a test key
const apiKey = process.env.STRIPE_API_KEY || 'sk_test_51PWT2cKaxbmGncEinBnQ5lyb8Bri4Y3jJrwzceLwZJsfa3ckhu5nJtx8uUPgrv2sZ5gURfaqjs4y99ktyVgteD6N00BDso5koh';
// Replace with a valid invoice ID for your account
const invoiceId = 'in_SAMPLE'; // This is a sample - you should replace with a real invoice ID

/**
 * Creates a client connected to an MCP server process
 * @returns {Promise<{client: Client, serverProcess: ChildProcess}>}
 */
async function createClient() {
  return new Promise((resolve, reject) => {
    // Start server process
    const serverProcess = spawn('node', [path.join(__dirname, 'index.js')], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let serverStarted = false;
    
    serverProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log(`[Server] ${output}`);
      
      // Detect when server is ready
      if (output.includes('MCP Server started successfully')) {
        serverStarted = true;
        
        // Create client that connects to the server process
        const client = new Client(
          { name: "test-client", version: "1.0.0" },
          {
            capabilities: {
              tools: {}
            }
          }
        );
        
        // Connect client to server via stdio
        client.connectToProcess(serverProcess)
          .then(() => {
            console.log('Client connected to server successfully');
            resolve({ client, serverProcess });
          })
          .catch(error => {
            console.error('Failed to connect client to server:', error);
            serverProcess.kill();
            reject(error);
          });
      }
    });
    
    // Handle server errors
    serverProcess.on('error', (error) => {
      console.error('Server process error:', error);
      reject(error);
    });
    
    // Handle server exit
    serverProcess.on('exit', (code, signal) => {
      if (!serverStarted) {
        reject(new Error(`Server process exited with code ${code} before starting`));
      }
    });
    
    // Set a timeout in case the server never starts
    setTimeout(() => {
      if (!serverStarted) {
        serverProcess.kill();
        reject(new Error('Timed out waiting for server to start'));
      }
    }, 10000);
  });
}

/**
 * Runs a test of invoice retrieval and line items functionality
 */
async function runTest() {
  let client = null;
  let serverProcess = null;
  
  try {
    console.log('Starting invoice retrieval test...');
    
    // Create client connected to server
    ({ client, serverProcess } = await createClient());
    
    // Step 1: List invoices to get a valid ID
    console.log('\n--- First listing invoices to get a valid ID ---');
    const invoicesResult = await client.callTool({
      name: "listInvoices",
      arguments: {
        apiKey: apiKey,
        limit: 1
      }
    });
    
    // Extract first invoice ID from the result
    const listResponse = JSON.parse(invoicesResult.content[0].text);
    let testInvoiceId = invoiceId; // Start with the provided ID
    
    // If we got a valid invoice from the list response, use that ID instead
    if (listResponse && listResponse.data && listResponse.data.length > 0) {
      testInvoiceId = listResponse.data[0].id;
      console.log(`Using invoice ID from list: ${testInvoiceId}`);
    } else {
      console.log(`Using predefined invoice ID: ${testInvoiceId}`);
    }
    
    // Step 2: Test retrieving the specific invoice
    console.log('\n--- Testing retrieveInvoice tool ---');
    const invoiceResult = await client.callTool({
      name: "retrieveInvoice",
      arguments: {
        apiKey: apiKey,
        invoiceId: testInvoiceId
      }
    });
    
    console.log('Tool result:');
    console.log(invoiceResult);
    
    // Step 3: Test retrieving the invoice line items
    console.log('\n--- Testing retrieveInvoiceLineItems tool ---');
    const lineItemsResult = await client.callTool({
      name: "retrieveInvoiceLineItems",
      arguments: {
        apiKey: apiKey,
        invoiceId: testInvoiceId,
        limit: 2
      }
    });
    
    console.log('Tool result:');
    console.log(lineItemsResult);
    
    console.log('\n✅ Invoice retrieval test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  } finally {
    // Clean up
    if (serverProcess) {
      console.log('Shutting down server process...');
      serverProcess.kill();
    }
  }
}

// Run the test
runTest();