var state = new Object();

function connectedToServer()
{
	//Connected
}

function receivedServerMessage(e)
{
	//Update state information
	state = JSON.parse(e.data);
	console.log("Received state info from " + Object.keys(state).length + " player(s)!");
}

function serverConnectionClosed()
{
	//Closed connection :O
}

var ws = new WebSocket("ws://" + model.HOST + ":" + model.PORT + "/");
ws.onopen = connectedToServer;
ws.onmessage = receivedServerMessage;
ws.onclose - serverConnectionClosed;

window.onbeforeunload = function()
{
	ws.close();
};

var action;
var keysDown = new Object();

function keydown(e)
{
	if((e.keyCode == model.MOVE_LEFT ||
		e.keyCode == model.MOVE_UP ||
		e.keyCode == model.MOVE_RIGHT ||
		e.keyCode == model.MOVE_DOWN) &&
		(typeof keysDown[e.keyCode] === 'undefined' ||
			keysDown[e.keyCode] == false))
	{
		action = new Object();
		action[model.ACTION] = model.KEY_DOWN;
		action[model.KEY] = e.keyCode;
		keysDown[e.keyCode] = true;
		ws.send(JSON.stringify(action));
	}
}

function keyup(e)
{
	if(e.keyCode == model.MOVE_LEFT ||
		e.keyCode == model.MOVE_UP ||
		e.keyCode == model.MOVE_RIGHT ||
		e.keyCode == model.MOVE_DOWN)
	{
		action = new Object();
		action[model.ACTION] = model.KEY_UP;
		action[model.KEY] = e.keyCode;
		keysDown[e.keyCode] = false;
		ws.send(JSON.stringify(action));
	}
}

document.addEventListener("keydown", keydown);
document.addEventListener("keyup", keyup);

var canvas = document.getElementById("world");
var context = canvas.getContext('2d');

function repaintCanvas()
{
	context.clearRect(0, 0, canvas.width, canvas.height);

	context.fillStyle = "black";
	for(player in state)
	{
		context.fillRect(state[player]['x'],
			state[player]['y'],
			state[player]['w'],
			state[player]['h']);
	}
}

setInterval(repaintCanvas, 30);