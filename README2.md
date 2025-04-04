# Stripe Tax API MCP Server

A Model Context Protocol (MCP) server that interacts with the Stripe Tax API to retrieve and modify tax settings and calculations.

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

3. Start the server:
   ```bash
   npm start
   ```

## Configuration Options

The server requires no configuration files, but to use it effectively, you'll need:

1. **Stripe API Key**:
   - All operations require a valid Stripe API key
   - For production use, use a restricted API key with only tax-related permissions
   - In development, you can use a test API key from Stripe's dashboard

## Usage Examples

This MCP server provides tools for interacting with Stripe Tax API for settings and calculations.

### Tools

#### 1. getTaxSettings

Retrieves current tax settings from Stripe.

**Parameters**:
- `apiKey`: Your Stripe API key

**Example**:
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
- `apiKey`: Your Stripe API key
- `settings`: An object containing tax settings to update
  - `default_tax_jurisdiction`: Default country for tax calculation
  - `head_office`: Company address information
  - `tax_id`: Tax identification information

**Example**:
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
- `apiKey`: Your Stripe API key
- `calculationId`: The ID of the tax calculation to retrieve

**Example**:
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
- `apiKey`: Your Stripe API key
- `params`: Object containing parameters for the tax calculation:
  - `currency`: The currency for the calculation (e.g., 'usd')
  - `customer_details`: Customer information including address and optional tax IDs
  - `line_items`: Array of line items with amounts and optional tax codes

**Example**:
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
- `apiKey`: Your Stripe API key
- `calculationId`: The ID of the tax calculation to retrieve line items for
- `limit` (optional): Maximum number of line items to return
- `starting_after` (optional): Pagination cursor for continuing from a previous list
- `ending_before` (optional): Pagination cursor for returning results before this ID

**Example**:
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

### Resources

The server provides the following resources:

1. `stripe-tax://info`: General information about Stripe Tax
2. `stripe-tax://documentation`: References to Stripe Tax documentation

### Prompts

The server offers the following prompts:

1. `get-tax-settings`: A prompt for retrieving tax settings
2. `update-tax-settings`: A prompt for updating tax settings
3. `retrieve-tax-calculation`: A prompt for retrieving a tax calculation by ID
4. `create-tax-calculation`: A prompt for creating a new tax calculation
5. `list-tax-calculation-line-items`: A prompt for retrieving line items for a tax calculation by ID

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

### Connection Issues

**Problem**: Unable to connect to the MCP server.

**Solution**:
- Verify the server is running (check for console output)
- Check that your client correctly implements the MCP protocol
- Try using the MCP Inspector tool to debug the connection

## Security Considerations

- **Never** hardcode your Stripe API key in your code
- Use environment variables or a secure configuration system
- In production, use restricted API keys with only the permissions needed
- Consider implementing API key rotation for enhanced security