var static = require('node-static');
var util = require("util");

var PUBLIC = "./public";

var public = new static.Server(PUBLIC);

require('http').createServer(function(request, response)
{
	request.addListener('end', function()
	{
		public.serve(request, response, function(err, result)
		{
			if(err){
			//	throw err;
			}
		});
	}).resume();
}).listen(80);

console.log("Static web file server for " + PUBLIC + " is open on port 80.");
