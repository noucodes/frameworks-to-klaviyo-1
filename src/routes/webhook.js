const WebhookEvent = require('../models/webhookEvent');
const klaviyoService = require('../services/klaviyoService');
const discordService = require('../services/discordService');
const dataService = require('../services/dataService');

// Handle webhook events
async function handleWebhook(req, res) {
  await dataService.saveWebhookData(req.body);
  const { event_type = '', data } = req.body;
  const { trigger } = req.params;
  
  try {
    if (!event_type || !data) {
      const error = { error: 'Missing event_type or data', data: req.body, trigger };
      await discordService.sendMessage(error);
      return res.status(400).json(error);
    }

    console.log(`Processing webhook ${trigger} for ${data.customer_code} (event type: ${event_type})`);

    // Create and validate webhook event
    // const webhookEvent = new WebhookEvent(event_type, data);
    // const validation = webhookEvent.validate();
    
    // if (!validation.isValid) {
    //   const error = { error: 'Validation failed', details: validation.errors, data: req.body, trigger };
    //   await discordService.sendMessage(error);
    //   return res.status(400).json(error);
    // }

    // console.log(`📥 Processing webhook ${trigger} for ${data.customer_code} (event type: ${event_type})`);

    // Save webhook data to file
    

    // Find or create Klaviyo profile
    // const profile = await klaviyoService.findOrCreateProfile(
    //   data.customer_email || data.email,
    //   data.customer_code
    // );

    // Transform to Klaviyo event format
    // const klaviyoEvent = {
    //   profile: { $id: data.id },
    //   metric: {},
    //   timestamp: new Date(data.created_at).getTime() / 1000,
    //   properties: {
    //     frameworks_customer_code: data.customer_code
    //   }
    // };
    
    // Send to Klaviyo
    // await klaviyoService.sendEvent(klaviyoEvent);

    // Mark as processed
    // webhookEvent.markProcessed();
    // await klaviyoService.sendEvent(klaviyoEvent);
    console.log(event_type)


    const response = { 
      success: true, 
      message: 'Webhook processed',
      profile_id: data.id,
      event_summary: {
        eventType: event_type,
        customerCode: data.customer_code,
        customerEmail: data.customer_email || data.email,
        timestamp: new Date(),
        processed: true
      },
      trigger: trigger
    };

    // Send success notification to Discord
    await discordService.sendMessage(response);

    res.json(response);

  } catch (error) {
    console.error('❌ Webhook processing error:', error.message);
    
    const errorResponse = { 
      error: 'Webhook processing failed', 
      details: error.message,
      data: req.body,
      trigger: trigger
    };
    
    await discordService.sendMessage(errorResponse);
    res.status(500).json(errorResponse);
  }
}

module.exports = {
  handleWebhook
};
