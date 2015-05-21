var model = require("./public/websocket-chat/model.js");
var ws = require("nodejs-websocket");
//var util = require("util");

var state = new Object();
var nextPlayerId = 0;

var playerControls = new Object();

var server = ws.createServer(function(conn)
{
	//console.log("New connection: " + JSON.stringify(util.inspect(conn)));

	conn.on("text", function(str)
	{
		broadcastMessage(str);
		action = JSON.parse(str);
	});
});

server.listen(model.PORT);

function broadcastMessage(msg)
{
	server.connections.forEach(function(conn)
	{
		conn.sendText(msg);
	});
}

//Woot.
console.log("Server started on " + model.PORT + ".");