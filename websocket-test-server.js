var model = require("./public/websocket-test/model.js");
var fs = require("fs");
var ws = require("ws").Server;

var state = new Object();
var nextPlayerId = 0;

var playerControls = new Object();

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

wss.on("connection", function(conn)
{
	var localId = nextPlayerId;
	nextPlayerId++;

	state[localId] = new Object();
	state[localId][model.ID] = localId;
	state[localId]['x'] = 100;
	state[localId]['y'] = 100;
	state[localId]['w'] = 20;
	state[localId]['h'] = 20;

	playerControls[localId] = new Object();
	playerControls[localId][model.ID] = localId;

	conn.on("message", function(str)
	{
		action = JSON.parse(str);
		switch(action[model.ACTION])
		{
			case model.KEY_DOWN:
				debugger;
				playerControls[localId][action[model.KEY]] = true;
				//console.log("user " + localId + " acted: key " + action[model.KEY] + " down");
				break;
			case model.KEY_UP:
				playerControls[localId][action[model.KEY]] = false;
				//console.log("user " + localId + " acted: key " + action[model.KEY] + " up");
				break;
			default:
				console.log("UNKNOWN ACTION: " + action[model.ACTION]);
				break;
		}
	});
	
	conn.on("error", function(error) 
	{
		//console.log("Player connection " + localId + " ended abruptly!");
		delete state[localId];
		delete playerControls[localId];
	});

	conn.on("close", function(code, reason) 
	{
		//console.log("Player " + localId + " decimated their connection.");
		delete state[localId];
		delete playerControls[localId];
	});
});

function broadcastState()
{
	debugger;
	for(var player in playerControls)
	{
		if(typeof playerControls[player][model.ID] === 'undefined' ||
			typeof state[playerControls[player][model.ID]] === 'undefined')
		{
			continue;
		}

		debugger;
		var localPlayerState = state[playerControls[player][model.ID]];

		if(playerControls[player][model.MOVE_LEFT])
		{
			localPlayerState['x'] -= 1;
		}

		if(playerControls[player][model.MOVE_RIGHT])
		{
			debugger;
			localPlayerState['x'] += 1;
		}

		if(playerControls[player][model.MOVE_UP])
		{
			localPlayerState['y'] -= 1;
		}else
		{
			if(localPlayerState['y'] < 460)
			{
				localPlayerState['y'] += 3;
			}
		}

		if(playerControls[player][model.MOVE_DOWN])
		{
			localPlayerState['h'] = 10;
		}else
		{
			localPlayerState['h'] = 20;
		}
	}

	wss.clients.forEach(function(conn)
	{
		if(conn.readyState == 1)
		{
			conn.send(JSON.stringify(state));
		}
	});
}

setInterval(broadcastState, 30);

//Woot.
console.log("Server started on " + model.PORT + ".");