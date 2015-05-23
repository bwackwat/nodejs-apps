var content = document.getElementById("content");

var action;

function connectedToServer()
{
	goto("login.html");
}

function receivedServerMessage(e)
{
	action = JSON.parse(e.data);
	switch(action[model.ACTION])
	{
		case model.UPDATE_VIEW:
			content.innerHTML = action[model.VIEW_DATA];
			break;
		case model.RESULT:
			document.getElementById("result").innerHTML = action[model.RESULT_DATA];
			break;
		default:
			alert("??: " + action);
			break;
	}
}

function serverConnectionClosed()
{
	//Closed connection :O
}

var ws = new WebSocket("ws://" + window.location.hostname + ":" + model.PORT + "/");
ws.onopen = connectedToServer;
ws.onmessage = receivedServerMessage;
ws.onclose - serverConnectionClosed;

function authenticate()
{
	action = new Object();
	action[model.ACTION] = model.AUTHENTICATE;
	action[model.USERNAME] = document.getElementById("username").value;
	action[model.PASSWORD] = document.getElementById("password").value;
	ws.send(JSON.stringify(action));
}

function register()
{
	action = new Object();
	action[model.ACTION] = model.REGISTER;
	action[model.USERNAME] = document.getElementById("username").value;
	action[model.PASSWORD] = document.getElementById("password").value;
	ws.send(JSON.stringify(action));
}

function goto(place)
{
	action = new Object();
	action[model.ACTION] = model.REQUEST_PLACE;
	action[model.PLACE] = place;
	ws.send(JSON.stringify(action));
}

function submitPost()
{
	action = new Object();
	action[model.ACTION] = model.NEW_POST;
	action[model.TITLE] = document.getElementById("title").value;
	action[model.TEXT] = document.getElementById("blog").value;
	ws.send(JSON.stringify(action));
}