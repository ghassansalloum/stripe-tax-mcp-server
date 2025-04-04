// Test script for the Stripe Tax MCP Server
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test data
const apiKey = 'sk_test_51PWT2cKaxbmGncEinBnQ5lyb8Bri4Y3jJrwzceLwZJsfa3ckhu5nJtx8uUPgrv2sZ5gURfaqjs4y99ktyVgteD6N00BDso5koh';
const calculationId = 'taxcalc_1R9gxVKaxbmGncEifpBKm6fs';

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
 * Runs a test using the MCP client and server
 */
async function runTest() {
  let client = null;
  let serverProcess = null;
  
  try {
    console.log('Starting MCP server test...');
    
    // Create client connected to server
    ({ client, serverProcess } = await createClient());
    
    // Test retrieving tax calculation
    console.log('\n--- Testing retrieveTaxCalculation tool ---');
    const calculationResult = await client.callTool({
      name: "retrieveTaxCalculation",
      arguments: {
        apiKey: apiKey,
        calculationId: calculationId
      }
    });
    
    console.log('Tool result:');
    console.log(calculationResult);
    
    // Test listing tax calculation line items
    console.log('\n--- Testing listTaxCalculationLineItems tool ---');
    const lineItemsResult = await client.callTool({
      name: "listTaxCalculationLineItems",
      arguments: {
        apiKey: apiKey,
        calculationId: calculationId,
        limit: 2
      }
    });
    
    console.log('Tool result:');
    console.log(lineItemsResult);
    
    console.log('\n✅ All MCP server tests completed successfully!');
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