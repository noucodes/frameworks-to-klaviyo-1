# Frameworks Webhook API

This integration provides webhook endpoints for Frameworks to send real-time events, enabling immediate triggering of Klaviyo flows.

## Webhook Endpoint

**URL:** `http://your-server:3000/webhooks/frameworks`  
**Method:** `POST`  
**Content-Type:** `application/json`

## Security

### Signature Validation
All webhook requests must include these headers:

- `X-Frameworks-Signature` - HMAC-SHA256 signature
- `X-Frameworks-Timestamp` - Unix timestamp (must be within 5 minutes)

### Signature Generation
Frameworks should generate the signature using:

```javascript
const crypto = require('crypto');
const secret = 'your_webhook_secret';
const timestamp = Math.floor(Date.now() / 1000);
const payload = JSON.stringify(requestBody);

const message = `${timestamp}.${payload}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(message)
  .digest('hex');
```

## Supported Events

### 1. Post-Purchase (Order Invoiced) Flow

Triggered when an order is invoiced in Frameworks.

**Event Type:** `order_invoiced`

**Payload:**
```json
{
  "event_type": "order_invoiced",
  "data": {
    "invoice_number": "INV-2024-001",
    "customer_code": "CUST001",
    "customer_email": "john.doe@company.com",
    "order_number": "ORD-2024-001",
    "order_value_ex_gst": 1000.00,
    "order_value_inc_gst": 1150.00,
    "branch": "Auckland",
    "sales_rep": "Sarah Smith",
    "order_type": "online",
    "status": "invoiced",
    "created_at": "2024-01-15T10:30:00Z",
    "due_date": "2024-02-15T00:00:00Z",
    "line_items": [
      {
        "sku": "PROD-001",
        "quantity": 2,
        "unit_price": 500.00,
        "total": 1000.00
      }
    ],
    "billing_address": {
      "address1": "123 Queen Street",
      "city": "Auckland",
      "postal_code": "1010",
      "country": "New Zealand"
    },
    "shipping_address": {
      "address1": "123 Queen Street",
      "city": "Auckland",
      "postal_code": "1010",
      "country": "New Zealand"
    }
  }
}
```

**Klaviyo Event Created:** `Frameworks Invoice Created`

### 2. Quote Created Flow

Triggered when a new quote is created in Frameworks.

**Event Type:** `quote_created`

**Payload:**
```json
{
  "event_type": "quote_created",
  "data": {
    "quote_number": "QUOTE-2024-001",
    "customer_code": "CUST001",
    "customer_email": "john.doe@company.com",
    "quote_value_ex_gst": 2000.00,
    "quote_value_inc_gst": 2300.00,
    "branch": "Auckland",
    "sales_rep": "Sarah Smith",
    "quote_type": "project",
    "status": "created",
    "created_at": "2024-01-15T10:30:00Z",
    "valid_until": "2024-02-15T23:59:59Z",
    "line_items": [
      {
        "sku": "PROD-002",
        "quantity": 1,
        "unit_price": 2000.00,
        "total": 2000.00
      }
    ],
    "billing_address": {
      "address1": "123 Queen Street",
      "city": "Auckland",
      "postal_code": "1010",
      "country": "New Zealand"
    }
  }
}
```

**Klaviyo Event Created:** `Quote Created`

## Scheduled Customer Comparison

For flows that don't have direct Frameworks triggers, the integration performs daily customer list comparisons:

### 3. Welcome Flow (New Customer)

**Detection Method:** Compare customer lists daily to identify new customers

**Klaviyo Event Created:** `Welcome Flow Started`

**Trigger Conditions:**
- Customer exists in current Frameworks data
- Customer did not exist in previous day's data
- Customer has valid email address

**Event Properties:**
```json
{
  "frameworks_customer_code": "CUST001",
  "welcome_email": "john.doe@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "Doe Construction Ltd",
  "branch": "Auckland",
  "sales_rep": "Sarah Smith",
  "account_status": "active",
  "registration_timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Email Changed Flow

**Detection Method:** Compare customer lists daily to detect email changes

**Klaviyo Event Created:** `Email Changed`

**Trigger Conditions:**
- Customer exists in both current and previous data
- Email address has changed
- Both old and new emails are valid

**Event Properties:**
```json
{
  "frameworks_customer_code": "CUST001",
  "previous_email": "old.email@company.com",
  "new_email": "new.email@company.com",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "Doe Construction Ltd",
  "change_timestamp": "2024-01-15T10:30:00Z"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "result": {
    "event_type": "order_invoiced",
    "invoice_number": "INV-2024-001",
    "klaviyo_profile_id": "profile_123456",
    "processed_at": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "error": "Internal server error",
  "message": "Failed to process webhook"
}
```

## HTTP Status Codes

- `200` - Webhook processed successfully
- `400` - Invalid payload or event type
- `401` - Invalid signature or timestamp
- `500` - Internal server error

## Error Handling

### Retry Logic
- Frameworks should implement exponential backoff for failed requests
- Recommended retry attempts: 3 (with delays: 1s, 5s, 15s)

### Common Errors

**401 Unauthorized**
- Check webhook secret configuration
- Verify signature generation algorithm
- Ensure timestamp is within 5 minutes

**400 Bad Request**
- Verify required fields are present
- Check event_type is supported
- Validate JSON format

**500 Internal Server Error**
- Temporary Klaviyo API issues
- Frameworks API connectivity problems
- Database errors

## Implementation Examples

### Node.js (Frameworks Side)

```javascript
const crypto = require('crypto');
const axios = require('axios');

async function sendWebhook(eventType, data) {
  const secret = process.env.FRAMEWORKS_WEBHOOK_SECRET;
  const webhookUrl = 'http://your-integration-server:3000/webhooks/frameworks';
  
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ event_type: eventType, data });
  
  const message = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  try {
    const response = await axios.post(webhookUrl, JSON.parse(payload), {
      headers: {
        'Content-Type': 'application/json',
        'X-Frameworks-Signature': signature,
        'X-Frameworks-Timestamp': timestamp.toString(),
      },
      timeout: 30000,
    });
    
    console.log('Webhook sent successfully:', response.data);
  } catch (error) {
    console.error('Webhook failed:', error.response?.data || error.message);
    throw error;
  }
}

// Example: Send order invoiced webhook
await sendWebhook('order_invoiced', {
  invoice_number: 'INV-2024-001',
  customer_code: 'CUST001',
  customer_email: 'john.doe@company.com',
  // ... other fields
});
```

### PHP (Frameworks Side)

```php
<?php
function sendWebhook($eventType, $data) {
    $secret = getenv('FRAMEWORKS_WEBHOOK_SECRET');
    $webhookUrl = 'http://your-integration-server:3000/webhooks/frameworks';
    
    $timestamp = time();
    $payload = json_encode([
        'event_type' => $eventType,
        'data' => $data
    ]);
    
    $message = $timestamp . '.' . $payload;
    $signature = hash_hmac('sha256', $message, $secret);
    
    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'X-Frameworks-Signature: ' . $signature,
        'X-Frameworks-Timestamp: ' . $timestamp,
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("Webhook failed: HTTP $httpCode");
    }
    
    return json_decode($response, true);
}

// Example usage
sendWebhook('order_invoiced', [
    'invoice_number' => 'INV-2024-001',
    'customer_code' => 'CUST001',
    // ... other fields
]);
```

## Testing

### Health Check
```bash
curl http://your-server:3000/health
```

### Test Webhook (with signature)
```bash
# This requires generating a proper signature
# Use the examples above to create test requests
```

## Monitoring

Monitor webhook processing in the integration logs:
- `logs/combined.log` - All webhook requests
- `logs/error.log` - Failed webhook requests

Key log messages to watch:
- "Processing webhook" - Successful webhook receipt
- "Webhook processed successfully" - Successful processing
- "Webhook processing failed" - Processing errors
- "Invalid webhook signature" - Security issues
