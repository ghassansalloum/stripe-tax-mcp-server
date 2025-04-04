// Stripe Tax Settings MCP Server
// This server interacts with Stripe Tax API to retrieve and write tax settings and calculations

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Stripe from 'stripe';

/**
 * Retrieves tax settings from Stripe
 * @param {string} apiKey - The Stripe API key
 * @returns {Object} The tax settings object
 */
async function getTaxSettings(apiKey) {
  try {
    // Initialize Stripe with the provided API key
    const stripe = new Stripe(apiKey);
    
    // Make the API call to retrieve tax settings
    const settings = await stripe.tax.settings.retrieve();
    return settings;
  } catch (error) {
    console.error("Error retrieving tax settings:", error);
    throw new Error(`Failed to retrieve tax settings: ${error.message}`);
  }
}

/**
 * Updates tax settings in Stripe
 * @param {string} apiKey - The Stripe API key
 * @param {Object} settings - The tax settings to update
 * @returns {Object} The updated tax settings object
 */
async function updateTaxSettings(apiKey, settings) {
  try {
    // Initialize Stripe with the provided API key
    const stripe = new Stripe(apiKey);
    
    // Make the API call to update tax settings
    const updatedSettings = await stripe.tax.settings.update(settings);
    return updatedSettings;
  } catch (error) {
    console.error("Error updating tax settings:", error);
    throw new Error(`Failed to update tax settings: ${error.message}`);
  }
}

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
    
    // Make the API call to create the tax calculation
    const calculation = await stripe.tax.calculations.create(params);
    return calculation;
  } catch (error) {
    console.error("Error creating tax calculation:", error);
    throw new Error(`Failed to create tax calculation: ${error.message}`);
  }
}

/**
 * Retrieves a tax calculation from Stripe by ID
 * @param {string} apiKey - The Stripe API key
 * @param {string} calculationId - The ID of the tax calculation to retrieve
 * @returns {Object} The tax calculation object
 */
async function retrieveTaxCalculation(apiKey, calculationId) {
  try {
    // Initialize Stripe with the provided API key
    const stripe = new Stripe(apiKey);
    
    // Make the API call to retrieve the tax calculation
    const calculation = await stripe.tax.calculations.retrieve(calculationId);
    return calculation;
  } catch (error) {
    console.error("Error retrieving tax calculation:", error);
    throw new Error(`Failed to retrieve tax calculation: ${error.message}`);
  }
}

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
    
    // Make the API call to retrieve the tax calculation line items
    const lineItems = await stripe.tax.calculations.listLineItems(calculationId, options);
    return lineItems;
  } catch (error) {
    console.error("Error retrieving tax calculation line items:", error);
    throw new Error(`Failed to retrieve tax calculation line items: ${error.message}`);
  }
}

/**
 * Retrieves tax registrations from Stripe
 * @param {string} apiKey - The Stripe API key
 * @param {Object} options - Additional options like limit, starting_after, etc.
 * @returns {Object} The tax registrations
 */
async function listTaxRegistrations(apiKey, options = {}) {
  try {
    // Initialize Stripe with the provided API key
    const stripe = new Stripe(apiKey);
    
    // Make the API call to retrieve the tax registrations
    const registrations = await stripe.tax.registrations.list(options);
    return registrations;
  } catch (error) {
    console.error("Error retrieving tax registrations:", error);
    throw new Error(`Failed to retrieve tax registrations: ${error.message}`);
  }
}

// Create an MCP server
const server = new McpServer({
  name: "Stripe Tax API Manager",
  version: "1.0.0"
});

// Add a tool to retrieve tax settings
server.tool("getTaxSettings",
  { apiKey: z.string().describe("Your Stripe API key") },
  async ({ apiKey }) => {
    try {
      const settings = await getTaxSettings(apiKey);
      return {
        content: [{ type: "text", text: JSON.stringify(settings, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Add a tool to update tax settings
server.tool("updateTaxSettings",
  { 
    apiKey: z.string().describe("Your Stripe API key"),
    settings: z.object({
      default_tax_jurisdiction: z.string().optional(),
      head_office: z.object({
        address: z.object({
          country: z.string(),
          line1: z.string(),
          city: z.string(),
          state: z.string().optional(),
          postal_code: z.string().optional()
        })
      }).optional(),
      tax_id: z.object({
        type: z.string(),
        value: z.string()
      }).optional()
    }).describe("Tax settings to update")
  },
  async ({ apiKey, settings }) => {
    try {
      const updatedSettings = await updateTaxSettings(apiKey, settings);
      return {
        content: [{ type: "text", text: JSON.stringify(updatedSettings, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Add a tool to retrieve a tax calculation
server.tool("retrieveTaxCalculation",
  {
    apiKey: z.string().describe("Your Stripe API key"),
    calculationId: z.string().describe("The ID of the tax calculation to retrieve")
  },
  async ({ apiKey, calculationId }) => {
    try {
      const calculation = await retrieveTaxCalculation(apiKey, calculationId);
      return {
        content: [{ type: "text", text: JSON.stringify(calculation, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Add a tool to create a tax calculation
server.tool("createTaxCalculation",
  {
    apiKey: z.string().describe("Your Stripe API key"),
    params: z.object({
      currency: z.string().describe("The currency for the calculation (e.g., 'usd')"),
      customer_details: z.object({
        address: z.object({
          country: z.string().describe("Customer's country code"),
          line1: z.string().optional().describe("Street address"),
          line2: z.string().optional().describe("Additional address details"),
          city: z.string().optional().describe("City"),
          state: z.string().optional().describe("State or province"),
          postal_code: z.string().optional().describe("Postal code")
        }),
        address_source: z.enum(['shipping', 'billing']).describe("Source of the address (required when providing address)"),
        tax_ids: z.array(z.object({
          type: z.string().describe("Tax ID type (e.g., 'eu_vat')"),
          value: z.string().describe("Tax ID value")
        })).optional().describe("Customer's tax IDs")
      }),
      line_items: z.array(z.object({
        amount: z.number().describe("Amount in currency's smallest unit"),
        reference: z.string().optional().describe("Your internal reference for this line item"),
        tax_code: z.string().optional().describe("The tax code for this line item"),
        tax_behavior: z.enum(['exclusive', 'inclusive']).optional().describe("How tax is applied to the line item")
      }))
    }).describe("Parameters for creating a tax calculation")
  },
  async ({ apiKey, params }) => {
    try {
      const calculation = await createTaxCalculation(apiKey, params);
      return {
        content: [{ type: "text", text: JSON.stringify(calculation, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Add a tool to list tax calculation line items
server.tool("listTaxCalculationLineItems",
  {
    apiKey: z.string().describe("Your Stripe API key"),
    calculationId: z.string().describe("The ID of the tax calculation to retrieve line items for"),
    limit: z.number().optional().describe("Maximum number of line items to return"),
    starting_after: z.string().optional().describe("Pagination cursor for continuing from a previous list"),
    ending_before: z.string().optional().describe("Pagination cursor for returning results before this ID")
  },
  async ({ apiKey, calculationId, limit, starting_after, ending_before }) => {
    try {
      const options = {};
      if (limit !== undefined) options.limit = limit;
      if (starting_after) options.starting_after = starting_after;
      if (ending_before) options.ending_before = ending_before;
      
      const lineItems = await listTaxCalculationLineItems(apiKey, calculationId, options);
      return {
        content: [{ type: "text", text: JSON.stringify(lineItems, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Add a tool to list tax registrations
server.tool("listTaxRegistrations",
  {
    apiKey: z.string().describe("Your Stripe API key"),
    limit: z.number().optional().describe("Maximum number of registrations to return"),
    starting_after: z.string().optional().describe("Pagination cursor for continuing from a previous list"),
    ending_before: z.string().optional().describe("Pagination cursor for returning results before this ID")
  },
  async ({ apiKey, limit, starting_after, ending_before }) => {
    try {
      const options = {};
      if (limit !== undefined) options.limit = limit;
      if (starting_after) options.starting_after = starting_after;
      if (ending_before) options.ending_before = ending_before;
      
      const registrations = await listTaxRegistrations(apiKey, options);
      return {
        content: [{ type: "text", text: JSON.stringify(registrations, null, 2) }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Add a resource that provides information about Stripe Tax
server.resource(
  "stripe-tax-info",
  "stripe-tax://info",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "Stripe Tax helps businesses calculate, collect, and report tax on their transactions. It supports tax calculations across multiple jurisdictions and provides features for tax exempt customers and tax reporting."
    }]
  })
);

// Add a resource with tax documentation references
server.resource(
  "stripe-tax-docs",
  "stripe-tax://documentation",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "Stripe Tax Documentation References:\n\n" +
        "- General overview: https://docs.stripe.com/tax/custom\n" +
        "- Tax Settings API: https://docs.stripe.com/api/tax/settings\n" +
        "- Tax Calculations API: https://docs.stripe.com/api/tax/calculations\n" +
        "- Tax Calculations Line Items API: https://docs.stripe.com/api/tax/calculation_line_items\n" +
        "- Tax Registrations API: https://docs.stripe.com/api/tax/registrations\n" +
        "- API Authentication: https://docs.stripe.com/authentication"
    }]
  })
);

// Add a prompt for tax settings retrieval
server.prompt(
  "get-tax-settings",
  { apiKey: z.string().describe("Your Stripe API key") },
  ({ apiKey }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Retrieve the current tax settings for my Stripe account using this API key: ${apiKey}`
      }
    }]
  })
);

// Add a prompt for tax settings update
server.prompt(
  "update-tax-settings",
  { 
    apiKey: z.string().describe("Your Stripe API key"),
    country: z.string().describe("Default tax jurisdiction country code"),
    taxIdType: z.string().describe("Tax ID type (e.g., us_ein, eu_vat)"),
    taxIdValue: z.string().describe("Tax ID value")
  },
  ({ apiKey, country, taxIdType, taxIdValue }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Update my Stripe tax settings with the following information:
Default tax jurisdiction: ${country}
Tax ID type: ${taxIdType}
Tax ID value: ${taxIdValue}
Use this API key: ${apiKey}`
      }
    }]
  })
);

// Add a prompt for tax calculation retrieval
server.prompt(
  "retrieve-tax-calculation",
  { 
    apiKey: z.string().describe("Your Stripe API key"),
    calculationId: z.string().describe("The ID of the tax calculation to retrieve")
  },
  ({ apiKey, calculationId }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Retrieve the tax calculation with ID '${calculationId}' using this API key: ${apiKey}`
      }
    }]
  })
);

// Add a prompt for tax calculation creation
server.prompt(
  "create-tax-calculation",
  { 
    apiKey: z.string().describe("Your Stripe API key"),
    currency: z.string().describe("The currency code (e.g., 'usd')"),
    country: z.string().describe("Customer's country code"),
    amount: z.number().describe("Amount in currency's smallest unit")
  },
  ({ apiKey, currency, country, amount }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `Create a tax calculation for a customer in ${country} with an amount of ${amount} ${currency} using this API key: ${apiKey}`
      }
    }]
  })
);

// Add a prompt for tax calculation line items retrieval
server.prompt(
  "list-tax-calculation-line-items",
  { 
    apiKey: z.string().describe("Your Stripe API key"),
    calculationId: z.string().describe("The ID of the tax calculation to retrieve line items for"),
    limit: z.number().optional().describe("Maximum number of line items to return")
  },
  ({ apiKey, calculationId, limit }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `List the line items for tax calculation with ID '${calculationId}'${limit ? ` (limit: ${limit})` : ''} using this API key: ${apiKey}`
      }
    }]
  })
);

// Add a prompt for tax registrations retrieval
server.prompt(
  "list-tax-registrations",
  { 
    apiKey: z.string().describe("Your Stripe API key"),
    limit: z.number().optional().describe("Maximum number of registrations to return")
  },
  ({ apiKey, limit }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `List all tax registrations for my Stripe account${limit ? ` (limit: ${limit})` : ''} using this API key: ${apiKey}`
      }
    }]
  })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Stripe Tax API MCP Server started successfully!");