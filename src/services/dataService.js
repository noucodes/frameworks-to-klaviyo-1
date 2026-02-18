const fs = require('fs').promises;
const path = require('path');
const { config } = require('../config');

// Ensure data folder exists
async function ensureDataFolder() {
  try {
    await fs.mkdir(config.paths.data, { recursive: true });
  } catch (error) {
    console.error('❌ Failed to create data folder:', error.message);
  }
}

// Write webhook data to file
async function saveWebhookData(data) {
  try {
    await ensureDataFolder();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `webhook-${timestamp}.json`;
    const filepath = path.join(config.paths.data, filename);
    
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    console.log(`💾 Webhook data saved to: ${filename}`);
    return filepath;
  } catch (error) {
    console.error('❌ Failed to save webhook data:', error.message);
    throw error;
  }
}

// Get all webhook data files
async function getWebhookFiles() {
  try {
    await ensureDataFolder();
    
    const files = await fs.readdir(config.paths.data);
    const webhookFiles = files
      .filter(file => file.startsWith('webhook-') && file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first
    
    return webhookFiles;
  } catch (error) {
    console.error('❌ Failed to read webhook files:', error.message);
    throw error;
  }
}

// Read webhook data file
async function readWebhookFile(filename) {
  try {
    const filepath = path.join(config.paths.data, filename);
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Failed to read webhook file:', error.message);
    throw error;
  }
}

// Clean old webhook files (keep last 50)
async function cleanupOldFiles() {
  try {
    const files = await getWebhookFiles();
    
    if (files.length > 50) {
      const filesToDelete = files.slice(50);
      
      for (const file of filesToDelete) {
        const filepath = path.join(config.paths.data, file);
        await fs.unlink(filepath);
        console.log(`🗑️ Deleted old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to cleanup old files:', error.message);
  }
}

module.exports = {
  ensureDataFolder,
  saveWebhookData,
  getWebhookFiles,
  readWebhookFile,
  cleanupOldFiles
};
