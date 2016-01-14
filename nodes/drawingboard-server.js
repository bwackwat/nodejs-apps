var model = require("../public/drawingboard/model.js");
var utility = require("../modules/utility.js");
var wss = require("../modules/ws-server.js");

var imageData = new Uint8ClampedArray(400 * 200 * 4);

function drawPixel(conn){
	var index = ((conn.action.pixel.y * 400) + conn.action.pixel.x) * 4;

	imageData[index + 0] = conn.action.pixel.r;
	imageData[index + 1] = conn.action.pixel.g;
	imageData[index + 2] = conn.action.pixel.b;
	imageData[index + 3] = conn.action.pixel.a;
}

var config = {
	name: "Drawingboard Service",
	port: model.PORT
};

var server = wss.startServer(config);

server.addPipe(model.DRAW_PIXEL, drawPixel);

function broadcastPixels(){
	server.clients.forEach(function(conn){
		//var b = new Buffer(String.fromCharCode.apply(null, imageData).toString(), 'binary');

		var newdata = new Buffer(imageData);
		conn.send(imageData, {binary: true});
	});
}

setInterval(broadcastPixels, 1000);