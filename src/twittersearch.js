var fs = require('fs');
var OAuth = require('oauth');
var request = require('request');

/* Constructor */
var	TwitterSniffer = function(apiKey,apiSecret,access_token,secret,searchToken) {
		this.apiKey = apiKey;
		this.apiSecret = apiSecret;
		this.u_access_token = access_token;
		this.u_secret = secret;
		this.searchToken = searchToken;
		this._init();
};
/* Exports AgeFinder */
module.exports = TwitterSniffer;

TwitterSniffer.prototype = {

	_init : function(){
		var OAuth2 = OAuth.OAuth2, that = this;    
    	this.oauth2 = new OAuth2(this.apiKey,this.apiSecret, 'https://api.twitter.com/', null,'oauth2/token', null);
		this.access_token = '';
		this.refresh_token = '';
		this.lastID = '';
		this.mentions_lastID = '';

		this.oauth = new OAuth.OAuth('https://api.twitter.com/oauth/request_token',
      	'https://api.twitter.com/oauth/access_token',
      	this.apiKey,
      	this.apiSecret,
      	'1.0A',
      	null,
      	'HMAC-SHA1');


		//read conf if exists
		fs.readFile('./data/save.txt', function read(err, data) {
	        if (err) {
	            console.log("Can't read File");
	            fs.mkdir('data');
	        } else if(data && data.toString().indexOf(',') != -1){
	        	var ds = data.toString().split(',');
	        	if(ds.length ==2) {
	        		that.lastID = ds[0];
	        		that.mentions_lastID = ds[1];
	        	}
	        }
		});
	},

	init : function(done) {
		var that = this;
		this.oauth2.getOAuthAccessToken('',{'grant_type':'client_credentials'},
			function (e, access_token, refresh_token, results){
				that.access_token = access_token;
				that.refresh_token = refresh_token;
				console.log('bearer: ',access_token);
				done();
			}
		);
	},

	find : function(callback) {
		var that = this;
		var options = {
    		url: 'https://api.twitter.com/1.1/search/tweets.json?q=',
		    headers: {
		        'Authorization': 'Bearer ' + that.access_token
		    }
		};

		options.url += encodeURI('('+this.searchToken+'?)');
		options.url += '&result_type=mixed&rpp=40';

		if(this.lastID){
			options.url += '&since_id='+this.lastID;
		}
		console.log('..... ' + options.url);
		request.get(options, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var results = JSON.parse(response.body);
					console.log(' ==== Nb Results ' + results.statuses.length );
					if(results.statuses) {
						for (var i = 0; i < results.statuses.length; i++) {
							var status = results.statuses[i];
							if(i==0)
								that.lastID = status.id_str;
							if(status.text.indexOf('('+ that.searchToken+'?)') != -1){
								try {
									callback(that,status);
								} catch (ex) {
									console.log(ex);
								}
							} else {
								// console.log('False positive ' + status.id);
							}
						};
					}
			   		that._save();
				} else {
					console.log('find ERROR: ' + JSON.stringify(error));
				}
			});

		
	},


	getMentions : function(callback) {
		var that = this;
		var uri = 'https://api.twitter.com/1.1/statuses/mentions_timeline.json';
		if(this.mentions_lastID){
			uri += '?since_id='+this.mentions_lastID;
		}
		console.log('..... ' + uri);
		this.oauth.get(
			uri,
			that.u_access_token, //test user token
			that.u_secret, //test user secret            
			function (error, data, body){
				if (!error) {
					var results = JSON.parse(data);
					console.log(' ==== Nb Results ' + results.length );
					if(results) {
						for (var i = 0; i < results.length; i++) {
							try {
								callback(that,results[i]);
							} catch (ex) {
								console.log(ex);
							}
							if(i==0)
								that.mentions_lastID = results[i].id_str;
						};
					}
				} else {
					console.log('getMentions ERROR: ' + JSON.stringify(error));
				}

			   that._save();
		});  	
	},

	_save : function(){
		 //save the last Ids 
		fs.writeFile("./data/save.txt", this.lastID +","+ this.mentions_lastID, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		        console.log("The file was saved!");
		    }
		}); 
	},

	reply : function(id, msg){
		console.log('reply id is ' + id);
		this.oauth.post("https://api.twitter.com/1.1/statuses/update.json",
  			this.u_access_token,
			this.u_secret,
 			 {"status":msg , "in_reply_to_status_id" : id},
			function(error, data) {
				if(error) console.log(error)
				// else console.log(data)
			}
		);
	}

}