var content = document.getElementById("content");

var action;

function connected()
{
	goto("login.html");
}

function receivedPacket(e)
{
	action = JSON.parse(e.data);
	switch(action.type)
	{
		case model.UPDATE_VIEW:
			content.innerHTML = action.data;
			break;
		case model.RESULT:
			document.getElementById("result").innerHTML = action.data;
			break;
		default:
			alert("??: " + action);
			break;
	}
}

function connectionClosed()
{
	//Closed connection :O
}

var ws = new WebSocket("wss://" + window.location.hostname + ":" + model.PORT + "/");
ws.onopen = connected;
ws.onmessage = receivedPacket;
ws.onclose - connectionClosed;

function authenticate()
{
	ws.send(JSON.stringify({type: model.AUTHENTICATE,
		username: document.getElementById("username").value,
		password: document.getElementById("password").value}));
}

function register()
{
	ws.send(JSON.stringify({type: model.REGISTER,
		username: document.getElementById("username").value,
		password: document.getElementById("password").value}));
}

function goto(place)
{
	ws.send(JSON.stringify({type: model.GOTO,
		place: place}));
}

function submitPost()
{
	ws.send(JSON.stringify({type: model.POST,
		title: document.getElementById("title").value,
		text: document.getElementById("blog").value}));
}