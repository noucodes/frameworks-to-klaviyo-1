# Frameworks to Klaviyo - Webhook Listener

A simple webhook listener that receives events from Frameworks and forwards them to Klaviyo with API key security.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Install as Linux Service:**
   ```bash
   # Install service
   npm run service:install
   
   # Check status
   npm run service:status
   
   # View logs
   npm run service:logs
   
   # Restart
   npm run service:restart
   
   # Stop
   npm run service:stop
   
   # Uninstall service
   npm run service:uninstall
   ```

## Linux Service Commands

| Command | Description |
|----------|-------------|
| `npm run service:install` | Install as Linux service |
| `npm run service:uninstall` | Remove Linux service |
| `npm run service:start` | Start the service |
| `npm run service:stop` | Stop the service |
| `npm run service:restart` | Restart the service |
| `npm run service:status` | Check service status |
| `npm run service:logs` | View service logs |

## Environment Variables

```env
KLAVIYO_API_KEY=your_klaviyo_api_key_here
KLAVIYO_API_VERSION=2023-10-15
WEBHOOK_API_KEY=your-webhook-api-key-here
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
PORT=3000
```

## Service Details

- **Service Name**: `frameworks-webhook`
- **User**: `ubuntu` (change in service file if needed)
- **Working Directory**: `/home/ubuntu/frameworks-to-klaviyo`
- **Auto-restart**: Always on failure
- **Environment**: Production mode

## Security

The webhook endpoint requires an API key in `X-API-Key` header:

```bash
X-API-Key: your-webhook-api-key-here
```

## Webhook Endpoint

**POST** `/webhook`

### Required Headers:
- `Content-Type: application/json`
- `X-API-Key: your-webhook-api-key-here`

### Supported Events:

#### Order Invoiced
```json
{
  "event_type": "order_invoiced",
  "data": {
    "customer_code": "CUST001",
    "customer_email": "john@example.com",
    "invoice_number": "INV-001",
    "order_value_inc_gst": 1150.00,
    "branch": "Auckland",
    "order_type": "online",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Quote Created
```json
{
  "event_type": "quote_created",
  "data": {
    "customer_code": "CUST001",
    "customer_email": "john@example.com",
    "quote_number": "QUOTE-001",
    "quote_value_inc_gst": 2300.00,
    "branch": "Auckland",
    "quote_type": "project",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Welcome Flow
```json
{
  "event_type": "welcome_flow",
  "data": {
    "customer_code": "CUST001",
    "customer_email": "john@example.com",
    "customer_name": "John Doe",
    "branch": "Auckland",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Email Changed
```json
{
  "event_type": "email_changed",
  "data": {
    "customer_code": "CUST001",
    "previous_email": "old@example.com",
    "new_email": "new@example.com",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

## Endpoints

- **Webhook:** `POST /webhook` (requires API key)
- **Health Check:** `GET /health`

## Testing

```bash
# Health check
curl http://localhost:3000/health

# Test webhook with API key
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-webhook-api-key-here" \
  -d '{
    "event_type": "order_invoiced",
    "data": {
      "customer_code": "TEST001",
      "customer_email": "test@example.com",
      "invoice_number": "TEST-001",
      "order_value_inc_gst": 100.00,
      "branch": "Auckland",
      "order_type": "online",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }'
```

## Systemd Service Features

- **Auto-start** on boot
- **Auto-restart** on crashes
- **Log management** via journalctl
- **Process monitoring** with systemd
- **Environment variables** from .env file

## File Structure

```
FrameworksToKlaviyo/
├── data/                           # Webhook request logs
├── frameworks-webhook.service      # Systemd service file
├── install-service.sh               # Installation script
├── uninstall-service.sh             # Removal script
├── server.js                      # Main application
├── package.json                   # Dependencies and scripts
└── .env                          # Environment variables
```

## Manual Service Commands

```bash
# Start service
sudo systemctl start frameworks-webhook

# Stop service
sudo systemctl stop frameworks-webhook

# Restart service
sudo systemctl restart frameworks-webhook

# Check status
sudo systemctl status frameworks-webhook

# View logs
sudo journalctl -u frameworks-webhook -f

# Enable on boot
sudo systemctl enable frameworks-webhook

# Disable on boot
sudo systemctl disable frameworks-webhook
```

## Klaviyo Events Created

- `Frameworks Invoice Created` - When orders are invoiced
- `Quote Created` - When quotes are created
- `Welcome Flow Started` - When new customers are detected
- `Email Changed` - When customer emails are updated
