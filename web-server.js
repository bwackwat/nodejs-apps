var static = require('node-static');
var util = require("util");
var fs = require("fs");

var HOST = "www.bwackwat.com";
var PUBLIC = "./public";

var public = new static.Server(PUBLIC);

var options = {	
	key: fs.readFileSync("/opt/ssl/ssl.key", "utf-8", function(err, data){if(err)throw err;}),
	cert: fs.readFileSync("/opt/ssl/ssl.crt", "utf-8", function(err, data){if(err)throw err;}),
	passphrase: fs.readFileSync("/opt/ssl/password.txt", "utf-8", function(err, data){if(err)throw err;})
};

function onConnection(req, res){
	req.addListener("end", function(){
		public.serve(req, res, function(err, result){
			if(err){
				console.log(util.inspect(err));
//				throw err;
			}
		});
	}).resume();
}

require("https").createServer(options, onConnection).listen(443);

require("http").createServer(function(req, res){
	res.writeHead(301, {"Location": "https://" + HOST + req.url});
	res.end();
}).listen(80);

console.log("Static web server for " + PUBLIC + " is open on port 80/443.");