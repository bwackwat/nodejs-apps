var fs = require('fs');

var PUBLIC = "/opt/apps/public/";

fs.readdir(PUBLIC, function(err, files)
{
	if(err){throw err;}
	var indexhtml = "<html>";
	indexhtml += "<head>";
	indexhtml += "<title>bwackwat</title>";
	indexhtml += "<link rel='shortcut icon' type='image/x-icon' href='favicon.ico'/>";
	indexhtml += "</head>";
	indexhtml += "<body>";
	indexhtml += "<h1>Greetings visitor!</h1>";
	indexhtml += "<h2>You've stumbled upon a static index of apps.</h2>";
	indexhtml += "<h2>Feel free to explore.</h3>";
	files.forEach(function(file)
	{
		if(fs.statSync(PUBLIC + file).isDirectory())
		{
			indexhtml += "<a href='http://www.bwackwat.com/" + file + "'><h3>" + file + "</h3></a>";	
		}
	});
	indexhtml += "<img src='images/blackrat.svg' height='200'/>";
	indexhtml += "</body>";
	indexhtml += "</html>";

	fs.writeFile("/opt/apps/public/index.html", indexhtml , function(err)
	{
		if(err){throw err;}
		console.log("INDEX, built.");
	});
});