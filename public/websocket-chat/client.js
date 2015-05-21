var chat = document.getElementById("chat");
var alias = document.getElementById("alias");
var message = document.getElementById("message");

function receivedServerMessage(e)
{
	var newmessage = JSON.parse(e.data);
	chat.value = newmessage[model.ALIAS] + ": " + newmessage[model.MESSAGE] + "\n" + chat.value;
}

var ws = new WebSocket("ws://" + model.HOST + ":" + model.PORT + "/");
ws.onmessage = receivedServerMessage;

window.onbeforeunload = function()
{
	ws.close();
};

function submitMessage()
{
	var sendmessage = new Object();
	sendmessage[model.ALIAS] = alias.value;
	sendmessage[model.MESSAGE] = message.value;

	ws.send(JSON.stringify(sendmessage));
}