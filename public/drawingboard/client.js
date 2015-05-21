var canvas = document.getElementById("world");
var context = canvas.getContext('2d');
var singleImage = context.createImageData(400, 200);

var ws = new WebSocket("ws://localhost:" + model.PORT + "/");
ws.onmessage = function receivedServerMessage(e)
{
	singleImage.data.set(JSON.parse(e.data));
};

window.onbeforeunload = function()
{
	ws.close();
};

var action;
var mouseDown = false;

var r = 0;
var g = 0;
var b = 0;
var a = 255;

canvas.onmousedown = function(e)
{
	mouseDown = true;
};

canvas.onmousemove = function(e)
{
	if(mouseDown)
	{
		action = new Object();
		action[model.ACTION] = model.DRAW_PIXEL;

		action[model.PIXEL] = new Object();
		action[model.PIXEL]['r'] = r;
		action[model.PIXEL]['g'] = g;
		action[model.PIXEL]['b'] = b;
		action[model.PIXEL]['a'] = a;
		action[model.PIXEL]['x'] = e.x;
		action[model.PIXEL]['y'] = e.y;

		ws.send(JSON.stringify(action));
	}
};

canvas.onmouseup = function(e)
{
	mouseDown = false;
};

function repaintCanvas()
{
	context.putImageData(singleImage, 0, 0);
}

setInterval(repaintCanvas, 30);