// Test script for Stripe Invoices functionality
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
const apiKey = process.env.STRIPE_API_KEY || 'sk_test_your_test_key_here';

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
 * Runs a test of invoice listing functionality
 */
async function runTest() {
  let client = null;
  let serverProcess = null;
  
  try {
    console.log('Starting invoice listing test...');
    
    // Create client connected to server
    ({ client, serverProcess } = await createClient());
    
    // Test listing invoices
    console.log('\n--- Testing listInvoices tool ---');
    const invoicesResult = await client.callTool({
      name: "listInvoices",
      arguments: {
        apiKey: apiKey,
        limit: 5
      }
    });
    
    console.log('Tool result:');
    console.log(invoicesResult);
    
    console.log('\n✅ Invoice listing test completed successfully!');
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