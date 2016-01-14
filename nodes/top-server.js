var childProcess = require("child_process");
var wss = require("../modules/ws-server.js");

var config = {
	name: "Top Service",
	port: 8006
};

var server = wss.startServer(config);

function broadcastTop(){
	var top = childProcess.spawn("top", ["-b", "-n", "1"]);

	var output = "<pre>";
	top.stdout.on("data", function(data){
		output += data.toString();
	});
	top.on("exit", function(){
		output += "</pre>";
		server.clients.forEach(function(conn){
			conn.send(output);
		});
	});
}

setInterval(broadcastTop, 2000);