const axios = require('axios');
const { config } = require('../config');

// Send Discord message
async function sendMessage(content) {
  try {
    // Create formatted message
    let message = `# **Frameworks to Klaviyo** \n\n`;
    
    if (content.success) {
      message += `⏰ **Trigger**: ${content.trigger}\n`;
      message += `✅ **Success**: ${content.message}\n`;
      message += `👤 **Profile ID**: ${content.profile_id}\n`;
      message += `📋 **Event Type**: ${content.event_type}\n`;
      message += `🏢 **Customer**: ${content.data?.customer_code || 'Unknown'}\n`;
    } else {
      message += `❌ **Error**: ${content.error}\n`;
      if (content.data) {
        message += `⏰ **Trigger**: ${content.trigger || 'Unknown'}\n`;
        message += `📋 **Event Type**: ${content.event_type || 'Unknown'}\n`;
        message += `🏢 **Customer**: ${content.data?.customer_code || 'Unknown'}\n`;
      } else {
        message += `⏰ **Trigger**: ${content.trigger || 'Unknown'}\n`;
        message += `📋 **Event Type**: Unknown\n`;
        message += `🏢 **Customer**: Unknown\n`;
      }
    }
    
    // Add beautified JSON data
    message += `\n📄 **Request Data**:\n\`\`\`json\n${JSON.stringify(content.data || content, null, 2)}\n\`\`\``;

    const payload = {
      content: message,
      username: "Integration Bot"
    };

    const response = await axios.post(config.discord.webhookUrl, payload);
    console.log("✅ Discord message sent!", response.status);
    return response.data;
  } catch (error) {
    console.error("❌ Error sending Discord message:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendMessage
};
