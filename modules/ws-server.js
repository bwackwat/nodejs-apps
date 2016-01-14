var utility = require("./utility.js");
var wsUtil = require("./ws-utility.js");
var util = require("util");
var ws = require("ws").Server;

function onConnection(req, res){
	res.writeHead(200);
	res.end("WebSocket initializing...\n");
}

exports.startServer = function(config){
	if(typeof config.pipes === "undefined"){
		config.pipes = {};
	}
	var app = require('https')
		.createServer(utility.ssloptions, onConnection)
		.listen(config.port);
		
	var wss = new ws({server: app});
	
	wss.on("connection", function(conn){
		
		conn.jsend = function(data){
			if(data === "undefined"){
				return;
			}
			if(data instanceof Array){
				if(data[0] === undefined){
					return;
				}
				conn.send(wsUtil.serialize(data.shift()),
					function (err){
						if(err){
							console.log("Wss send error: " + err + " using " + util.inspect(data));
							conn.close();
						}
						conn.jsend(data);
					});
			}else if(data instanceof Object){
				conn.send(wsUtil.serialize(data),
					function (err){
						if(err){
							console.log("Wss send error: " + err + " using " + util.inspect(data));
							conn.close();
						}
					});
			}else{
				console.log("ERROR: WEIRD DATA SEND REQUEST: " + data);
			}
		};
		
		if(typeof config.init !== "undefined"){
			config.init(conn);
		}
		
		conn.on("message", function(data){
			try{
				conn.action = wsUtil.deserialize(data);
				//console.log(util.inspect(conn.action));
				if(typeof conn.action === "undefined"){
					throw "No action for message: " + data;
				}else if(typeof conn.action.type === "undefined"){
					throw "No type value for action: " + conn.action;
				}else if(typeof config.pipes[conn.action.type] === "undefined"){
					throw "No mapper for packet type: " + conn.action.type;
				}else{
					config.pipes[conn.action.type](conn);
				}
			}catch(err){
				console.log("Wss recv error: " + err + " on " + data);
				console.trace();
				console.log(util.inspect(config.pipes));
				conn.jsend({
					type: 0,
					data: "Broken Message!"
				});
			}
		});	

		conn.on("error", function(err){
			if(typeof config.error !== "undefined"){
				config.error(conn);
			}
			console.log("conn: " + conn + " error: " + err);
			conn.close();
			if(err){throw err;}
		});

		conn.on("close", function(exit){
			if(typeof config.close !== "undefined"){
				config.close(conn);
			}
			//if(err){throw err;}
		});
	});
	
	wss.addPipe = function(type, pipe){
		config.pipes[type.toString()] = pipe;
	};
	
	console.log(config.name + " started on " + config.port + ".");
	
	return wss;
};