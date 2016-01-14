var utility = require("../modules/utility.js");
var static = require('node-static');
var util = require("util");

var PUBLIC = "./public";

var public = new static.Server(PUBLIC, {serverInfo: "bwackwat"});

function onConnection(req, res){
	req.addListener("end", function(){
		public.serve(req, res, function(err, result){
			if(err && (err.status === 404)){
				public.serveFile("404.html", 404, {}, req, res);
			}else if(err){
				console.log(util.inspect(err));
//				throw err;
			}
		});
	}).resume();
}

require("https").createServer(utility.ssloptions, onConnection).listen(443);

require("http").createServer(function(req, res){
	res.writeHead(301, {"Location": "https://" + process.env.HOSTNAME + req.url});
	res.end();
}).listen(80);

console.log("Static web server for " + PUBLIC + " is open on " + process.env.HOSTNAME + ":80/443");