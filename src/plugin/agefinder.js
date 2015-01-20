//AgeFinder constructor
var	AgeFinder = function() {
		this._init();
	};
var request = require('request'), moment = require('moment'), config = require('./agefinder.json');
var apiPath = 'https://www.googleapis.com/customsearch/v1?';

/* Exports AgeFinder */
module.exports = AgeFinder;

AgeFinder.prototype = {

	_init : function(){
		this.key = config.key;
		this.cx = config.cx;
		this.baseURI = apiPath;
		this.baseURI += 'key='+this.key;
		this.baseURI += '&cx='+this.cx;
		this.baseURI += '&alt=json';
	},

	/*
	* Find the age from the given name.
	*/
	find : function(name,successCB,errorCB){
		var uri = apiPath;
		request(this.baseURI+'&q='+name+' age', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var search = JSON.parse(response.body);
				if(search.items.length){
					for (var i = 0; i < search.items.length; i++) {
						var s = search.items[i];
						if(s.pagemap && s.pagemap.hcard){
							for (var j = 0; j < s.pagemap.hcard.length; j++) {
								var k = s.pagemap.hcard[j];
								if(k.bday){
									successCB({
										age : moment().diff(moment(k.bday,'YYYY-MM-DD'), 'years'),
										fn : k.fn,
										bday : k.bday
									});
									return;
								}
							};
						}
					};
				}
				errorCB(name);
			} else {
				errorCB(name,error);
			}
		})
	},

};