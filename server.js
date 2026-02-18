require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

// Klaviyo config
const KLAVIYO_API_KEY = process.env.KLAVIYO_API_KEY;
const KLAVIYO_API_URL = 'https://a.klaviyo.com/api';
const WEBHOOK_API_KEY = process.env.WEBHOOK_API_KEY || 'your-webhook-api-key';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// Ensure data folder exists
const DATA_FOLDER = path.join(__dirname, 'data');
fs.mkdir(DATA_FOLDER, { recursive: true }).catch(console.error);

// Write webhook data to file
async function saveWebhookData(data) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `webhook-${timestamp}.json`;
    const filepath = path.join(DATA_FOLDER, filename);
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`Webhook data saved to: ${filename}`);
  } catch (error) {
    console.error('Failed to save webhook data:', error.message);
  }
}

// API Key middleware
function checkApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== WEBHOOK_API_KEY) {
    console.log('Invalid API key provided:', apiKey);
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
}

async function sendDiscordMessage(content) {
  try {
    
    // Create formatted message
    let message = `# **Frameworks to Klaviyo** \n\n`;
    
    if (content.success) {
      message += `✅ **Success**: ${content.message}\n`;
      message += `👤 **Profile ID**: ${content.profile_id}\n`;
      message += `📋 **Event Type**: ${content.data.event_type}\n`;
      message += `🏢 **Customer**: ${content.data.data.customer_code}\n`;
    } else {
      message += `❌ **Error**: ${content.error}\n`;
      if (content.data) {
        message += `📋 **Event Type**: ${content.data.event_type || 'Unknown'}\n`;
        message += `🏢 **Customer**: ${content.data.data?.customer_code || 'Unknown'}\n`;
      }
    }
    
    // Add beautified JSON data
    message += `\n📄 **Request Data**:\n\`\`\`json\n${JSON.stringify(content.data || content, null, 2)}\n\`\`\``;

    const payload = {
      content: message,
      username: "Integration Bot"
    };

    const response = await axios.post(DISCORD_WEBHOOK_URL, payload);
    console.log("Discord message sent!", response.status);
  } catch (error) {
    console.error("Error sending Discord message:", error.response?.data || error.message);
  }
}

// Send event to Klaviyo
async function sendToKlaviyo(event) {
  try {
    console.log('Sending to Klaviyo with API key:', KLAVIYO_API_KEY ? 'Present' : 'Missing');
    
    const response = await axios.post(`${KLAVIYO_API_URL}/events/`, {
      data: {
        type: 'event',
        attributes: event
      }
    }, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': process.env.KLAVIYO_API_VERSION || '2023-10-15'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Klaviyo error:', error.response?.data || error.message);
    throw error;
  }
}

// Find or create Klaviyo profile
async function findOrCreateProfile(email, customerCode) {
  try {
    // Try to find by email first
    let response = await axios.get(`${KLAVIYO_API_URL}/profiles/`, {
      params: { 'filter': `equals(email,"${email}")` },
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'revision': process.env.KLAVIYO_API_VERSION || '2023-10-15'
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }

    // Try to find by customer code
    response = await axios.get(`${KLAVIYO_API_URL}/profiles/`, {
      params: { 'filter': `equals(external_id,"${customerCode}")` },
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'revision': process.env.KLAVIYO_API_VERSION || '2023-10-15'
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }

    // Create new profile
    response = await axios.post(`${KLAVIYO_API_URL}/profiles/`, {
      data: {
        type: 'profile',
        attributes: {
          email: email,
          external_id: customerCode
        }
      }
    }, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': process.env.KLAVIYO_API_VERSION || '2023-10-15'
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Profile error:', error.response?.data || error.message);
    throw error;
  }
}

// Webhook listener endpoint with API key security
app.post('/webhook', checkApiKey, async (req, res) => {
  try {
    console.log('Webhook received');
    // Save webhook data to file
    await saveWebhookData(req.body);

    const { event_type, data } = req.body;
    
    if (!event_type || !data) {
      sendDiscordMessage({ error: 'Missing event_type or data', data: req.body });
      return res.status(400).json({ error: 'Missing event_type or data' });
    }

    console.log(`Processing webhook ${event_type} for ${data.customer_code}`);

    // Find/create profile
    // const profile = await findOrCreateProfile(
    //   data.customer_email || data.email,
    //   data.customer_code
    // );

    // let klaviyoEvent;

    switch (event_type) {
      case 'order_invoiced':
        klaviyoEvent = {
          profile: { $id: data.id},
          metric: { name: 'Frameworks Invoice Created' },
          timestamp: new Date(data.created_at).getTime() / 1000,
          properties: {
            frameworks_customer_code: data.customer_code,
            invoice_number: data.invoice_number,
            order_value_inc_gst: data.order_value_inc_gst,
            branch: data.branch,
            order_type: data.order_type
          }
        };
        break;

      case 'quote_created':
        klaviyoEvent = {
          profile: { $id: data.id },
          metric: { name: 'Quote Created' },
          timestamp: new Date(data.created_at).getTime() / 1000,
          properties: {
            frameworks_customer_code: data.customer_code,
            quote_number: data.quote_number,
            quote_value_inc_gst: data.quote_value_inc_gst,
            branch: data.branch,
            quote_type: data.quote_type
          }
        };
        break;

      case 'welcome_flow':
        klaviyoEvent = {
          profile: { $id: data.id },
          metric: { name: 'Welcome Flow Started' },
          timestamp: new Date(data.created_at).getTime() / 1000,
          properties: {
            frameworks_customer_code: data.customer_code,
            customer_name: data.customer_name,
            branch: data.branch
          }
        };
        break;

      case 'email_changed':
        klaviyoEvent = {
          profile: { $id: data.id },
          metric: { name: 'Email Changed' },
          timestamp: new Date(data.created_at).getTime() / 1000,
          properties: {
            frameworks_customer_code: data.customer_code,
            previous_email: data.previous_email,
            new_email: data.new_email
          }
        };
        break;

      default:
        return res.status(400).json({ error: 'Unknown event type' });
    }

    // await sendToKlaviyo(klaviyoEvent);

    res.json({ 
      success: true, 
      message: 'Webhook processed',
      profile_id: data.id 
    });
    sendDiscordMessage({ success: true, message: 'Webhook processed', profile_id: data.id, data: req.body });

  } catch (error) {
    console.error('Webhook error:', error.message);
    sendDiscordMessage({ error: error.message, data: req.body });
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook listener running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
  console.log('API Key required in X-API-Key header');
  console.log(`Webhook data saved to: ${DATA_FOLDER}`);
});
