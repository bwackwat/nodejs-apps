var model = require("./public/websocket-chat/model.js");
var fs = require("fs");
var ws = require("ws").Server;

var options = {	
	key: fs.readFileSync("/opt/ssl/ssl.key", "utf-8", function(err, data){if(err)throw err;}),
	cert: fs.readFileSync("/opt/ssl/ssl.crt", "utf-8", function(err, data){if(err)throw err;}),
	passphrase: fs.readFileSync("/opt/ssl/password.txt", "utf-8", function(err, data){if(err)throw err;})
};

function onConnection(req, res){
	res.writeHead(200);
	res.end("All glory to WebSockets!\n");
}

var app = require('https').createServer(options, onConnection).listen(model.PORT);

var wss = new ws({server: app});

wss.on("connection", function(conn){
	conn.on("message", function(str){
		broadcastMessage(str);
	});
});

function broadcastMessage(msg){
	wss.clients.forEach(function(conn){
		conn.send(msg);
	});
}

//Woot.
console.log("Server started on " + model.PORT + ".");