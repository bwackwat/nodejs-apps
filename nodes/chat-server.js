var model = require("../public/chat/model.js");
var utility = require("../modules/utility.js");
var util = require("util");
var wss = require("../modules/ws-server.js");

function broadcastMessage(action){
	server.clients.forEach(function(conn){
		conn.jsend(action);
	});
}

function receiveMessage(conn){
	broadcastMessage(conn.action);
}

var config = {
	name: "Chat Service",
	port: model.PORT
};

var server = wss.startServer(config);

server.addPipe(model.CHAT, receiveMessage);