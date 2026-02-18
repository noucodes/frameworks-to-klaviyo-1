const { config } = require('../config');

// API Key middleware
function checkApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    console.log('❌ Missing API key in headers');
    return res.status(401).json({ 
      error: 'Missing API key',
      message: 'X-API-Key header is required' 
    });
  }

  if (apiKey !== config.webhook.apiKey) {
    console.log('❌ Invalid API key provided:', apiKey);
    return res.status(401).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is incorrect' 
    });
  }

  next();
}

// Request logging middleware
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);
  
  next();
}

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);
  
  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
}

module.exports = {
  checkApiKey,
  requestLogger,
  errorHandler
};
