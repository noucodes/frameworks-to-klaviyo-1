require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../../data');

const config = {
  // Klaviyo Configuration
  klaviyo: {
    apiKey: process.env.KLAVIYO_API_KEY,
    apiUrl: 'https://a.klaviyo.com/api',
    apiVersion: process.env.KLAVIYO_API_VERSION || '2023-10-15'
  },

  // Webhook Security
  webhook: {
    apiKey: process.env.WEBHOOK_API_KEY || 'your-webhook-api-key'
  },

  // Discord Configuration
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL
  },

  // Server Configuration
  server: {
    port: process.env.PORT || 3000
  },

  // File Paths
  paths: {
    data: dataPath
  }
};

// Validate required environment variables
function validateConfig() {
  const required = [
    'KLAVIYO_API_KEY',
    'WEBHOOK_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('💡 Please set these in your .env file');
    process.exit(1);
  }
}

module.exports = {
  config,
  validateConfig
};
