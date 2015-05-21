var model = require("./public/drawingboard/model.js");
var ws = require("ws").Server;

var imageData = new Uint8ClampedArray(400 * 200 * 4);

var server = new ws({port: model.PORT});

server.on("connection", function(conn)
{
	var index;
	conn.on("text", function(str)
	{
		action = JSON.parse(str);
		switch(action[model.ACTION])
		{
			case model.DRAW_PIXEL:
				index = (action[model.PIXEL]['x'] + action[model.PIXEL]['y'] * 400) * 4;

				imageData[index + 0] = action[model.PIXEL]['r'];
				imageData[index + 1] = action[model.PIXEL]['g'];
				imageData[index + 2] = action[model.PIXEL]['b'];
				imageData[index + 3] = action[model.PIXEL]['a'];
				break;
			default:
				console.log("UNKNOWN ACTION: " + action[model.ACTION]);
				break;
		}
	});
});

function broadcastPixels()
{
	server.clients.forEach(function(conn)
	{
		conn.send(JSON.stringify(imageData));
	});
}

setInterval(broadcastPixels, 1000);

//Woot.
console.log("Server started on " + model.PORT + ".");