const klaviyoService = require('./klaviyoService');
const discordService = require('./discordService');
const dataService = require('./dataService');

module.exports = {
  klaviyo: klaviyoService,
  discord: discordService,
  data: dataService
};
