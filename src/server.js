const express = require('express');
const { config, validateConfig } = require('./config');
const { checkApiKey, requestLogger, errorHandler } = require('./middlewares/auth');
const routes = require('./routes');

// Validate configuration on startup
validateConfig();

const app = express();

// Apply middlewares
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use(checkApiKey);

// Register routes
app.post('/webhook/:trigger', async (req, res, next) => {
  await routes.webhook.handleWebhook(req, res);
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    available_routes: [
      'POST /webhook/:trigger',
      'GET /health'
    ]
  });
});

// Start server
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`🚀 Frameworks to Klaviyo Server Started`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`📥 Webhook: http://localhost:${PORT}/webhook/:trigger`);
  console.log(`🔑 API Key required in X-API-Key header`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});
