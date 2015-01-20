var Engine = require('./twittersearch.js');
var config = require('./config.json');
var botPlugin = require(config.plugin_module);
var CronJob = require('cron').CronJob;

var botEngine = new Engine(config.API_KEY,config.API_SECRET,config.access_token,config.secret,config.searchToken);

function onTick(){
    // Runs every 5mn
    botEngine.find(botPlugin.processTwit);
    botEngine.getMentions(botPlugin.processMention);
};

var job = new CronJob({
  cronTime: config.cron_pattern,
  onTick: onTick,
  start: false,
});


botEngine.init(function(){
    onTick();
	job.start();
});