var model = require("../public/boxgame/model.js");
var utility = require("../modules/utility.js");
var wss = require("../modules/ws-server.js");

var state = {};
var nextPlayerId = 0;

var playerControls = {};

function keyDown(conn){
	playerControls[conn.localId][conn.action[model.KEY]] = true;
}

function keyUp(conn){
	playerControls[conn.localId][conn.action[model.KEY]] = false;
}

var config = {
	name: "Boxgame Server",
	port: model.PORT,
	init: function(conn){
		conn.localId = nextPlayerId;
		nextPlayerId++;

		state[conn.localId] = {};
		state[conn.localId][model.ID] = conn.localId;
		state[conn.localId].x = 100;
		state[conn.localId].y = 100;
		state[conn.localId].w = 20;
		state[conn.localId].h = 20;

		playerControls[conn.localId] = {};
		playerControls[conn.localId][model.ID] = conn.localId;
	},
	error: function(conn){
		delete state[conn.localId];
		delete playerControls[conn.localId];
	},
	close: function(conn){
		delete state[conn.localId];
		delete playerControls[conn.localId];
	}
};

var server = wss.startServer(config);

server.addPipe(model.KEY_DOWN, keyDown);
server.addPipe(model.KEY_UP, keyUp);

function broadcastState(){
	for(var player in playerControls){
		if(typeof playerControls[player][model.ID] === 'undefined' ||
			typeof state[playerControls[player][model.ID]] === 'undefined'){
			continue;
		}

		var localPlayerState = state[playerControls[player][model.ID]];

		if(playerControls[player][model.MOVE_LEFT]){
			localPlayerState.x -= 1;
		}

		if(playerControls[player][model.MOVE_RIGHT]){
			localPlayerState.x += 1;
		}

		if(playerControls[player][model.MOVE_UP]){
			localPlayerState.y -= 1;
		}else{
			if(localPlayerState.y < 460){
				localPlayerState.y += 3;
			}
		}

		if(playerControls[player][model.MOVE_DOWN]){
			localPlayerState.h = 10;
		}else{
			localPlayerState.h = 20;
		}
	}

	server.clients.forEach(function(conn){
		if(conn.readyState === 1){
			conn.jsend({
				type: model.STATE,
				data: state
			});
		}
	});
}

setInterval(broadcastState, 30);