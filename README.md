# Frameworks to Klaviyo - Webhook Listener

A modular webhook listener that receives events from Frameworks and forwards them to Klaviyo with API key security.

## 📁 Project Structure

```
FrameworksToKlaviyo/
├── config/                 # Configuration management
│   └── index.js         # Environment variables & settings
├── middlewares/           # Express middleware functions
│   └── auth.js          # API key & error handling
├── models/               # Data models & validation
│   └── webhookEvent.js  # Webhook event model
├── routes/               # API route handlers
│   ├── index.js         # Route exports
│   ├── webhook.js       # Webhook event handling
│   └── comparison.js    # List comparison logic
├── services/             # Business logic services
│   ├── index.js         # Service exports
│   ├── klaviyoService.js # Klaviyo API integration
│   ├── discordService.js  # Discord notifications
│   └── dataService.js   # File operations
├── data/                 # Webhook request logs
├── server.js             # Main application entry
├── package.json          # Dependencies & scripts
└── .env                  # Environment variables
```

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
   # Install webhook service
   npm run service:install
   
   # Install ngrok tunnel (optional)
   npm run ngrok:install
   
   # Check status
   npm run service:status
   npm run ngrok:status
   
   # View logs
   npm run service:logs
   
   # Restart
   npm run service:restart
   npm run ngrok:restart
   
   # Stop
   npm run service:stop
   npm run ngrok:stop
   
   # Uninstall service
   npm run service:uninstall
   npm run ngrok:uninstall
   ```

## 🛣 Routes

### **Route 1: Webhook Events** (`/webhook`)
- **Purpose:** Process real-time webhook events from Frameworks
- **Events:** `order_invoiced`, `quote_created`, `welcome_flow`, `email_changed`
- **Features:** 
  - ✅ Event validation
  - ✅ Profile creation/lookup
  - ✅ Klaviyo event sending
  - ✅ Discord notifications
  - ✅ Data logging

### **Route 2: List Comparison** (`/compare-lists`)
- **Purpose:** Trigger customer list comparison manually
- **Features:**
  - ✅ Manual trigger support
  - ✅ Comparison result logging
  - ✅ Discord notifications
  - 🔄 Ready for custom comparison logic

### **Route 3: Health Check** (`/health`)
- **Purpose:** Server health monitoring
- **Response:** Status, timestamp, version, environment

## 🔧 Configuration

### **Environment Variables:**
```env
KLAVIYO_API_KEY=your_klaviyo_api_key_here
KLAVIYO_API_VERSION=2023-10-15
WEBHOOK_API_KEY=your-webhook-api-key-here
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
PORT=3000
NODE_ENV=production
```

### **Config Validation:**
- ✅ Required environment variable checking
- ✅ Startup validation with clear error messages
- ✅ Graceful failure on missing config

## 🔒 Security

### **Authentication:**
- ✅ API key validation via `X-API-Key` header
- ✅ Request logging with IP and timestamp
- ✅ Error handling middleware
- ✅ 404 route handling

## 📊 Services

### **Klaviyo Service:**
- Profile management (find/create)
- Event sending
- List management
- Error handling

### **Discord Service:**
- Formatted message sending
- Success/error notifications
- JSON data beautification

### **Data Service:**
- Webhook data logging
- File management
- Cleanup operations

## 🧪 Models

### **Webhook Event Model:**
- Event validation
- Klaviyo event transformation
- Processing status tracking
- Summary generation

## 🧪 Testing

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

# Test list comparison
curl -X POST http://localhost:3000/compare-lists \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-webhook-api-key-here" \
  -d '{"trigger": "manual"}'
```

## 🚀 Service Commands

| Command | Description |
|----------|-------------|
| `npm run service:install` | Install webhook as Linux service |
| `npm run service:uninstall` | Remove Linux service |
| `npm run service:start` | Start webhook service |
| `npm run service:stop` | Stop webhook service |
| `npm run service:restart` | Restart webhook service |
| `npm run service:status` | Check webhook service status |
| `npm run service:logs` | View webhook service logs |
| `npm run ngrok:install` | Install ngrok tunnel service |
| `npm run ngrok:uninstall` | Remove ngrok tunnel service |
| `npm run ngrok:start` | Start ngrok tunnel |
| `npm run ngrok:stop` | Stop ngrok tunnel |
| `npm run ngrok:status` | Check ngrok status |
| `npm run ngrok:url` | Get ngrok tunnel URL |

## 📝 Modular Architecture Benefits

- **🔧 Separation of Concerns** - Each folder has specific responsibility
- **🧪 Reusable Components** - Services can be used across routes
- **📦 Scalable Structure** - Easy to add new features
- **🧪 Testable Units** - Each service can be tested independently
- **📖 Maintainable Code** - Clear organization makes updates easier
- **🔄 Config Management** - Centralized configuration with validation

## 🎯 Klaviyo Events Created

- `Frameworks Invoice Created` - When orders are invoiced
- `Quote Created` - When quotes are created
- `Welcome Flow Started` - When new customers are detected
- `Email Changed` - When customer emails are updated
