var chalk = require("chalk");
var http = require('http');
var path = require("path");
var fs = require("fs");

var baseDir = __dirname + "/../public/";
var filePaths = [];
function indexFiles(dir, dirPath){
	if(typeof dirPath === "undefined"){
		dirPath = "\\";
	}
	var files = fs.readdirSync(dir);
	for(var i = 0, len = files.length; i < len; i++){
		if(fs.lstatSync(dir + "\\" + files[i]).isDirectory()){
			indexFiles(dir + "\\" + files[i], dirPath + files[i] + "\\");
		}else{
			if(path.extname(files[i]) === ".html" ||
				path.extname(files[i]) === ".js" ||
				path.extname(files[i]) === ".css"){
				filePaths.push(dirPath + files[i]);
			}
		}
	}
}
indexFiles(baseDir);

var verbose = process.argv.indexOf("-v") > -1;
var totalStart = process.hrtime();
var hostIsSet = process.argv.indexOf("-h");

var options = {
	headers: {
		"Connection": "close"
	}
};
if(hostIsSet > -1){
	options.hostname = process.argv[hostIsSet + 1];
}else{
	options.hostname = "localhost";
}

console.log("Testing " + filePaths.length + " pages on host " + options.hostname + "...");

var i = 0;
var len = filePaths.length;
function testNextGet(){
	if(i < len){
		var url = filePaths[i];
		url = url.replace(/\\/g, "/");
		if(verbose){
			process.stdout.write(url + "...");
		}
		options.path = url;
		var start = process.hrtime();
		var req = http.get(options, function(res){
			var body = '';
			res.on('data', function(d){
				body += d; 
			});
			res.on('error', function(e){
				if(verbose){
					console.log(chalk.red("res error: " + e.message));
				}
			});
			res.on("end", function(e){
				if(verbose){
					var resultTime = process.hrtime(start);
					console.log((body.length / 1000) + "KB in " + ((resultTime[0] * 1000) + (resultTime[1] / 1000000)) + "ms!");	
				}
				i++;
				testNextGet();
			});
		});
		req.on('error', function(e){
			if(verbose){
				console.log(chalk.red("req error: " + e.message));
			}
			i++;
			testNextGet();
		});
	}else{
		var resultTime = process.hrtime(totalStart);
		console.log("Done in " + ((resultTime[0] * 1000) + (resultTime[1] / 1000000)) + "ms!");
	}
}

testNextGet();