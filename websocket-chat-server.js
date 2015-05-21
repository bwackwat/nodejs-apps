var model = require("./public/websocket-chat/model.js");
var ws = require("ws").Server;
//var util = require("util");

var server = new ws({port: model.PORT});

server.on("connection", function(conn)
{
	//console.log("New connection: " + JSON.stringify(util.inspect(conn)));

	conn.on("message", function(str)
	{
		broadcastMessage(str);
	});
});

function broadcastMessage(msg)
{
	server.clients.forEach(function(conn)
	{
		conn.send(msg);
	});
}

//Woot.
console.log("Server started on " + model.PORT + ".");