# Stripe Tax and Invoices API MCP Server

A Model Context Protocol (MCP) server that interacts with the Stripe Tax and Invoices API to retrieve and modify tax settings, calculations, and invoice data.

## Installation


### Prerequisites

- Node.js (v16 or higher)
- npm (v6 or higher)
- A Stripe account with API access

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd stripe-tax-api-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

   (you may need to run `npm install @modelcontextprotocol/sdk` too)

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
4. Edit the `.env` file to add your Stripe API key:
   ```
   STRIPE_API_KEY=sk_test_your_test_key_here
   ```
   
   ⚠️ **Important**: The test API key included in the sample files has expired. You must provide your own valid API key from your Stripe account.

5. Start the server:
   ```bash
   npm start
   ```

## Configuration Options

The server can be configured using environment variables:

1. **Stripe API Key**:
   - Set your API key in the `.env` file as `STRIPE_API_KEY`
   - Alternatively, you can provide the API key when calling each tool
   - For production use, use a restricted API key with only tax-related permissions
   - In development, you can use a test API key from Stripe's dashboard



### Special installation steps for Claude Desktop
- Edit the claude_desktop_config.json file (Claude -> Settings -> Developer -> Edit Config)
- Paste this: 
``` json
"stripe-tax": {
      "command": "node",
      "args": [
        "/<PATH_TO_YOUR_CLONED>/stripe-tax-mcp-server"
      ],
      "env": {
        "STRIPE_API_KEY": "<YOUR_API_KEY>"
      }
    }
```

## Usage Examples

This MCP server provides tools for interacting with Stripe Tax API for settings, calculations, and product tax code associations.

### Tools

#### 1. getTaxSettings

Retrieves current tax settings from Stripe.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.

**Example**:
```json
{
  "name": "getTaxSettings",
  "arguments": {}
}
```

**Example with API key**:
```json
{
  "name": "getTaxSettings",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key"
  }
}
```

**Response**:
```json
{
  "default_tax_jurisdiction": "US",
  "head_office": {
    "address": {
      "country": "US",
      "line1": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94105"
    }
  },
  "tax_id": {
    "type": "us_ein",
    "value": "12-3456789"
  },
  "status": {
    "active": true
  }
}
```

#### 2. updateTaxSettings

Updates tax settings in Stripe.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.
- `settings`: An object containing tax settings to update
  - `default_tax_jurisdiction`: Default country for tax calculation
  - `head_office`: Company address information
  - `tax_id`: Tax identification information

**Example using environment variable API key**:
```json
{
  "name": "updateTaxSettings",
  "arguments": {
    "settings": {
      "default_tax_jurisdiction": "CA",
      "tax_id": {
        "type": "ca_bn",
        "value": "123456789"
      }
    }
  }
}
```

**Example with explicit API key**:
```json
{
  "name": "updateTaxSettings",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key",
    "settings": {
      "default_tax_jurisdiction": "CA",
      "tax_id": {
        "type": "ca_bn",
        "value": "123456789"
      }
    }
  }
}
```

#### 3. retrieveTaxCalculation

Retrieves a tax calculation from Stripe by its ID.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.
- `calculationId`: The ID of the tax calculation to retrieve

**Example using environment variable API key**:
```json
{
  "name": "retrieveTaxCalculation",
  "arguments": {
    "calculationId": "taxcalc_12345"
  }
}
```

**Example with explicit API key**:
```json
{
  "name": "retrieveTaxCalculation",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key",
    "calculationId": "taxcalc_12345"
  }
}
```

**Response**:
```json
{
  "id": "taxcalc_12345",
  "object": "tax.calculation",
  "amount_total": 1090,
  "currency": "usd",
  "customer_details": {
    "address": {
      "country": "US",
      "line1": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94105"
    },
    "address_source": "shipping",
    "tax_ids": []
  },
  "line_items_subtotal_amount": 1000,
  "shipping_cost_subtotal_amount": 0,
  "tax_amount_exclusive": 90,
  "tax_amount_inclusive": 0,
  "tax_breakdown": [
    {
      "amount": 60,
      "jurisdiction": "California",
      "sourcing": "destination",
      "tax_type": "sales_tax"
    },
    {
      "amount": 30,
      "jurisdiction": "San Francisco",
      "sourcing": "destination", 
      "tax_type": "local_tax"
    }
  ],
  "tax_date": "2023-01-15",
  "expires_at": 1673913600
}
```

#### 4. createTaxCalculation

Creates a new tax calculation in Stripe.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.
- `params`: Object containing parameters for the tax calculation:
  - `currency`: The currency for the calculation (e.g., 'usd')
  - `customer_details`: Customer information including address and optional tax IDs
  - `line_items`: Array of line items with amounts and optional tax codes

**Example using environment variable API key**:
```json
{
  "name": "createTaxCalculation",
  "arguments": {
    "params": {
      "currency": "usd",
      "customer_details": {
        "address": {
          "country": "US",
          "line1": "123 Main St",
          "city": "San Francisco",
          "state": "CA",
          "postal_code": "94105"
        },
        "address_source": "shipping",
        "tax_ids": [
          {
            "type": "us_ein",
            "value": "12-3456789"
          }
        ]
      },
      "line_items": [
        {
          "amount": 1000,
          "reference": "product_123",
          "tax_code": "txcd_30060006",
          "tax_behavior": "exclusive"
        }
      ]
    }
  }
}
```

**Example with explicit API key**:
```json
{
  "name": "createTaxCalculation",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key",
    "params": {
      "currency": "usd",
      "customer_details": {
        "address": {
          "country": "US",
          "line1": "123 Main St",
          "city": "San Francisco",
          "state": "CA",
          "postal_code": "94105"
        },
        "address_source": "shipping",
        "tax_ids": [
          {
            "type": "us_ein",
            "value": "12-3456789"
          }
        ]
      },
      "line_items": [
        {
          "amount": 1000,
          "reference": "product_123",
          "tax_code": "txcd_30060006",
          "tax_behavior": "exclusive"
        }
      ]
    }
  }
}
```

**Response**:
```json
{
  "id": "taxcalc_12345",
  "object": "tax.calculation",
  "amount_total": 1090,
  "currency": "usd",
  "customer_details": {
    "address": {
      "country": "US",
      "line1": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94105"
    },
    "tax_ids": [
      {
        "type": "us_ein",
        "value": "12-3456789"
      }
    ]
  },
  "line_items_subtotal_amount": 1000,
  "shipping_cost_subtotal_amount": 0,
  "tax_amount_exclusive": 90,
  "tax_amount_inclusive": 0,
  "tax_breakdown": [
    {
      "amount": 60,
      "jurisdiction": "California",
      "sourcing": "destination",
      "tax_type": "sales_tax"
    },
    {
      "amount": 30,
      "jurisdiction": "San Francisco",
      "sourcing": "destination", 
      "tax_type": "local_tax"
    }
  ],
  "tax_date": "2023-01-15",
  "expires_at": 1673913600
}
```

#### 5. listTaxCalculationLineItems

Retrieves line items for a tax calculation from Stripe by its ID.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.
- `calculationId`: The ID of the tax calculation to retrieve line items for
- `limit` (optional): Maximum number of line items to return
- `starting_after` (optional): Pagination cursor for continuing from a previous list
- `ending_before` (optional): Pagination cursor for returning results before this ID

**Example using environment variable API key**:
```json
{
  "name": "listTaxCalculationLineItems",
  "arguments": {
    "calculationId": "taxcalc_12345",
    "limit": 3
  }
}
```

**Example with explicit API key**:
```json
{
  "name": "listTaxCalculationLineItems",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key",
    "calculationId": "taxcalc_12345",
    "limit": 3
  }
}
```

**Response**:
```json
{
  "object": "list",
  "url": "/v1/tax/calculations/taxcalc_12345/line_items",
  "has_more": false,
  "data": [
    {
      "id": "li_1NpJD42eZvKYlo2CxyzABC",
      "object": "tax.calculation_line_item",
      "amount": 1000,
      "amount_tax": 100,
      "livemode": false,
      "product": "prod_12345",
      "quantity": 1,
      "reference": "product_123",
      "tax_behavior": "exclusive",
      "tax_breakdown": [
        {
          "amount": 70,
          "jurisdiction": "California",
          "sourcing": "destination",
          "tax_rate_details": {
            "percentage_decimal": "0.07",
            "tax_type": "sales_tax"
          },
          "taxability_reason": "standard",
          "taxable_amount": 1000
        },
        {
          "amount": 30,
          "jurisdiction": "San Francisco",
          "sourcing": "destination",
          "tax_rate_details": {
            "percentage_decimal": "0.03",
            "tax_type": "local_tax"
          },
          "taxability_reason": "standard",
          "taxable_amount": 1000
        }
      ],
      "tax_code": "txcd_30060006",
      "taxable_amount": 1000
    }
  ]
}
```

#### 6. updateProductTaxCode

Updates a product in Stripe to associate a tax code with it.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.
- `productId`: The ID of the product to update
- `taxCode`: The tax code to associate with the product (e.g., 'txcd_30060006')

**Example using environment variable API key**:
```json
{
  "name": "updateProductTaxCode",
  "arguments": {
    "productId": "prod_123456",
    "taxCode": "txcd_30060006"
  }
}
```

**Example with explicit API key**:
```json
{
  "name": "updateProductTaxCode",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key",
    "productId": "prod_123456",
    "taxCode": "txcd_30060006"
  }
}
```

**Response**:
```json
{
  "id": "prod_123456",
  "object": "product",
  "active": true,
  "created": 1681234567,
  "description": "Premium Widget",
  "images": [],
  "tax_code": "txcd_30060006",
  "name": "Widget Pro",
  "updated": 1681234789
}
```

#### 7. getProductTaxCode

Retrieves a product from Stripe and its associated tax code.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.
- `productId`: The ID of the product to retrieve

**Example using environment variable API key**:
```json
{
  "name": "getProductTaxCode",
  "arguments": {
    "productId": "prod_123456"
  }
}
```

**Example with explicit API key**:
```json
{
  "name": "getProductTaxCode",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key",
    "productId": "prod_123456"
  }
}
```

**Response**:
```json
{
  "product": {
    "id": "prod_123456",
    "object": "product",
    "active": true,
    "created": 1681234567,
    "description": "Premium Widget",
    "images": [],
    "tax_code": "txcd_30060006",
    "name": "Widget Pro",
    "updated": 1681234789
  },
  "tax_code": "txcd_30060006",
  "has_tax_code": true
}
```

#### 8. listInvoices

Retrieves a list of invoices from Stripe.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.
- `limit` (optional): Maximum number of invoices to return
- `customer` (optional): Customer ID to filter by
- `status` (optional): Invoice status to filter by ('draft', 'open', 'paid', 'uncollectible', 'void')
- `starting_after` (optional): Pagination cursor for continuing from a previous list
- `ending_before` (optional): Pagination cursor for returning results before this ID

**Example using environment variable API key**:
```json
{
  "name": "listInvoices",
  "arguments": {
    "limit": 5,
    "customer": "cus_123456"
  }
}
```

**Example with explicit API key**:
```json
{
  "name": "listInvoices",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key",
    "limit": 5,
    "status": "paid"
  }
}
```

**Response**:
```json
{
  "object": "list",
  "url": "/v1/invoices",
  "has_more": true,
  "data": [
    {
      "id": "in_1234567890",
      "object": "invoice",
      "account_country": "US",
      "account_name": "Your Company",
      "amount_due": 10000,
      "amount_paid": 10000,
      "amount_remaining": 0,
      "customer": "cus_123456",
      "currency": "usd",
      "status": "paid",
      "total": 10000,
      "subtotal": 9500,
      "tax": 500
    },
    {
      "id": "in_0987654321",
      "object": "invoice",
      "account_country": "US",
      "account_name": "Your Company",
      "amount_due": 5000,
      "amount_paid": 5000,
      "amount_remaining": 0,
      "customer": "cus_123456",
      "currency": "usd",
      "status": "paid",
      "total": 5000,
      "subtotal": 4750,
      "tax": 250
    }
  ]
}
```

#### 9. retrieveInvoice

Retrieves a specific invoice from Stripe by ID.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.
- `invoiceId`: The ID of the invoice to retrieve

**Example using environment variable API key**:
```json
{
  "name": "retrieveInvoice",
  "arguments": {
    "invoiceId": "in_1234567890"
  }
}
```

**Example with explicit API key**:
```json
{
  "name": "retrieveInvoice",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key",
    "invoiceId": "in_1234567890"
  }
}
```

**Response**:
```json
{
  "id": "in_1234567890",
  "object": "invoice",
  "account_country": "US",
  "account_name": "Your Company",
  "amount_due": 10000,
  "amount_paid": 10000,
  "amount_remaining": 0,
  "customer": "cus_123456",
  "currency": "usd",
  "status": "paid",
  "total": 10000,
  "subtotal": 9500,
  "tax": 500,
  "lines": {
    "object": "list",
    "data": [
      {
        "id": "il_1234567890",
        "object": "line_item",
        "amount": 9500,
        "currency": "usd",
        "description": "Premium Plan",
        "quantity": 1,
        "tax_amounts": [
          {
            "amount": 500,
            "inclusive": false,
            "tax_rate": "txr_1234567890"
          }
        ]
      }
    ],
    "has_more": false,
    "url": "/v1/invoices/in_1234567890/lines"
  }
}
```

#### 10. retrieveInvoiceLineItems

Retrieves line items for an invoice from Stripe.

**Parameters**:
- `apiKey` (optional): Your Stripe API key. If not provided, the API key from the environment variable will be used.
- `invoiceId`: The ID of the invoice to retrieve line items for
- `limit` (optional): Maximum number of line items to return
- `starting_after` (optional): Pagination cursor for continuing from a previous list
- `ending_before` (optional): Pagination cursor for returning results before this ID

**Example using environment variable API key**:
```json
{
  "name": "retrieveInvoiceLineItems",
  "arguments": {
    "invoiceId": "in_1234567890",
    "limit": 10
  }
}
```

**Example with explicit API key**:
```json
{
  "name": "retrieveInvoiceLineItems",
  "arguments": {
    "apiKey": "sk_test_your_stripe_key",
    "invoiceId": "in_1234567890",
    "limit": 10
  }
}
```

**Response**:
```json
{
  "object": "list",
  "url": "/v1/invoices/in_1234567890/lines",
  "has_more": false,
  "data": [
    {
      "id": "il_1234567890",
      "object": "line_item",
      "amount": 9500,
      "currency": "usd",
      "description": "Premium Plan",
      "quantity": 1,
      "tax_amounts": [
        {
          "amount": 500,
          "inclusive": false,
          "tax_rate": "txr_1234567890"
        }
      ]
    }
  ]
}
```

### Resources

The server provides the following resources:

1. `stripe-tax://info`: General information about Stripe Tax
2. `stripe-tax://documentation`: References to Stripe Tax documentation and Stripe Invoices documentation

### Prompts

The server offers the following prompts:

1. `get-tax-settings`: A prompt for retrieving tax settings
2. `update-tax-settings`: A prompt for updating tax settings
3. `retrieve-tax-calculation`: A prompt for retrieving a tax calculation by ID
4. `create-tax-calculation`: A prompt for creating a new tax calculation
5. `list-tax-calculation-line-items`: A prompt for retrieving line items for a tax calculation by ID
6. `update-product-tax-code`: A prompt for updating a product with a tax code
7. `get-product-tax-code`: A prompt for retrieving a product's tax code
8. `list-invoices`: A prompt for listing invoices with optional filters
9. `retrieve-invoice`: A prompt for retrieving a specific invoice by ID
10. `retrieve-invoice-line-items`: A prompt for retrieving line items for a specific invoice

## Common Troubleshooting

### API Authentication Issues

**Problem**: Getting "Authentication failed" errors when using the tools.

**Solution**:
- Make sure your API key is valid and properly formatted
- Check if the API key has the required permissions
- For restricted keys, ensure they have access to tax endpoints

### Rate Limiting

**Problem**: API requests are being rejected with rate limit errors.

**Solution**:
- Implement exponential backoff for retry logic
- Reduce the frequency of API calls
- Consider upgrading your Stripe account if you need higher limits

### Data Validation Errors

**Problem**: The server rejects your tax settings update.

**Solution**:
- Ensure all required fields are provided with the correct format
- Check country codes are valid ISO codes (e.g., "US", "CA", "GB")
- Verify tax ID types match the expected format for the given jurisdiction

### API Key Issues

**Problem**: "No API key provided" error message.

**Solution**:
- Make sure you've created an `.env` file with your `STRIPE_API_KEY` set
- Or provide the API key directly when calling the methods
- Verify the API key has permissions for Stripe Tax operations

### Connection Issues

**Problem**: Unable to connect to the MCP server.

**Solution**:
- Verify the server is running (check for console output)
- Check that your client correctly implements the MCP protocol
- Try using the MCP Inspector tool to debug the connection
- Ensure the path in your `claude_desktop_config.json` is correct

## Security Considerations

- **Never** hardcode your Stripe API key in your code
- Use environment variables via the `.env` file for storing your API key
- In production, use restricted API keys with only the permissions needed
- Consider implementing API key rotation for enhanced security
- Add `.env` to your `.gitignore` file to prevent accidentally committing your API keys