const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { config } = require('../config');

// Send event to Klaviyo
async function sendEvent(event) {
  try {
    console.log('📤 Sending event to Klaviyo:', event.metric.name);
    
    const response = await axios.post(`${config.klaviyo.apiUrl}/events/`, {
      data: {
        type: 'event',
        attributes: event
      }
    }, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${config.klaviyo.apiKey}`,
        'Content-Type': 'application/json',
        'revision': config.klaviyo.apiVersion
      }
    });
    
    console.log('✅ Event sent to Klaviyo successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Klaviyo error:', error.response?.data || error.message);
    throw error;
  }
}

// Find or create Klaviyo profile
async function findOrCreateProfile(email, customerCode) {
  try {
    console.log(`🔍 Looking for profile: ${email} / ${customerCode}`);
    
    // Try to find by email first
    let response = await axios.get(`${config.klaviyo.apiUrl}/profiles/`, {
      params: { 'filter': `equals(email,"${email}")` },
      headers: {
        'Authorization': `Klaviyo-API-Key ${config.klaviyo.apiKey}`,
        'revision': config.klaviyo.apiVersion
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ Found existing profile by email');
      return response.data.data[0];
    }

    // Try to find by customer code
    response = await axios.get(`${config.klaviyo.apiUrl}/profiles/`, {
      params: { 'filter': `equals(external_id,"${customerCode}")` },
      headers: {
        'Authorization': `Klaviyo-API-Key ${config.klaviyo.apiKey}`,
        'revision': config.klaviyo.apiVersion
      }
    });

    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ Found existing profile by customer code');
      return response.data.data[0];
    }

    // Create new profile
    console.log('➕ Creating new profile...');
    response = await axios.post(`${config.klaviyo.apiUrl}/profiles/`, {
      data: {
        type: 'profile',
        attributes: {
          email: email,
          external_id: customerCode
        }
      }
    }, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${config.klaviyo.apiKey}`,
        'Content-Type': 'application/json',
        'revision': config.klaviyo.apiVersion
      }
    });

    console.log('✅ New profile created successfully');
    return response.data.data;
  } catch (error) {
    console.error('❌ Profile error:', error.response?.data || error.message);
    throw error;
  }
}

// Get Klaviyo lists
async function getLists() {
  try {
    const response = await axios.get(`${config.klaviyo.apiUrl}/lists/`, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${config.klaviyo.apiKey}`,
        'revision': config.klaviyo.apiVersion
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Lists error:', error.response?.data || error.message);
    throw error;
  }
}

// Add email to Klaviyo list
async function addEmailToList(email, listId) {
  try {
    console.log(`➕ Adding ${email} to list: ${listId}`);
    
    const response = await axios.post(`${config.klaviyo.apiUrl}/lists/${listId}/relationships/profiles/`, {
      data: [{
        type: 'profile',
        id: email,
        attributes: {
          email: email
        }
      }]
    }, {
      headers: {
        'Authorization': `Klaviyo-API-Key ${config.klaviyo.apiKey}`,
        'Content-Type': 'application/json',
        'revision': config.klaviyo.apiVersion
      }
    });
    
    console.log('✅ Email added to list successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Add to list error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendEvent,
  findOrCreateProfile,
  getLists,
  addEmailToList
};
