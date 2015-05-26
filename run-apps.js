var process = require('child_process');

function initializeApp(appName)
{
	console.log("Initializing " + appName + "...");

	var app = process.spawn("node", ["./" + appName + ".js"]);

	app.stdout.on("data", function(data)
	{
		console.log(appName + " app stdout: " + data);
	});

	app.stderr.on("data", function(data)
	{
		console.log(appName + " app stderr: " + data);
	});

	app.on("data", function(code)
	{
		console.log(appName + " app has exited: " + code);
	});
}

//List of apps

initializeApp("web-server");
initializeApp("websocket-test-server");
initializeApp("websocket-chat-server");
initializeApp("websocket-content-server");
initializeApp("drawingboard-server");