var Finder = require('./agefinder.js');
var agefinder = new Finder();


function createMessage(status, rep) {
	if(status.lang == "fr"){
		return '@'+status.user.screen_name + ' '+ rep.fn + ' a ' + rep.age + ' ans.'
	} else {
		return '@'+status.user.screen_name + ' '+ rep.fn + ' is ' + rep.age + ' years old.'
	}
};

module.exports = {

	/*
	* Called when a tweet with '(age?)' is found by the twitter search API.
	* @status is a twitter status (text, id_str, user.screen_name ....)
	* @twitterbot use it to reply to msg (you must add a mention to the author if you want the reply to work)
	*/
	processTwit : function (twitterbot,status) {
		var words = status.text.substring(0,status.text.lastIndexOf('(age?)')).split(/\s+/g);
		agefinder.find(words[words.length -1] +' '+words[words.length -2],function(rep){
			console.log(rep.fn + ' a ' + rep.age + 'ans');
			twitterbot.reply(status.id_str, createMessage(status,rep));
		}, function(n){
			console.log('je trouve pas l\'age de '+ n);
		});
	},

	/*
	* Called when somebody has mentioned you.
	* @status is a twitter status (text, id_str, user.screen_name ....)
	* @twitterbot use it to reply to msg (you must add a mention to the author if you want the reply to work)
	*/
	processMention : function (twitterbot,status) {
		var words = status.text.substring(0,status.text.lastIndexOf('@AgeCheckBird')).split(/\s+/g);
		agefinder.find(words[words.length -1] +' '+words[words.length -2],function(rep){
			console.log(rep.fn + ' a ' + rep.age + 'ans');
			twitterbot.reply(status.id_str, createMessage(status,rep));
		}, function(n){
			console.log('je trouve pas l\'age de '+ n);
		});
	}
}