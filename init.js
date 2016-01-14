var childProcess = require("child_process");
var util = require("util");
var fs = require("fs");

function STEP(){
	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
}

process.env.PRODUCTION = "PRODUCTION";
process.env.DEVELOPMENT = "DEVELOPMENT";

console.log("Given: " + process.env.HOSTNAME + " and " + process.env.NODE_ENV);

STEP();

if(typeof process.env.HOSTNAME === "undefined"){
	process.env.HOSTNAME = "localhost";
}
if(typeof process.env.NODE_ENV === "undefined"){
	process.env.NODE_ENV = process.env.DEVELOPMENT;
}

console.log("Initializing apps on " + process.env.HOSTNAME + " in " + process.env.NODE_ENV + "!");


var PUBLIC = __dirname + "/public/";

STEP();

var mediadir = "/public/media/";
var mediafiles = [];
function crawlForMedia(dir){
	dir = dir || "";
	console.log("Crawling " + mediadir + dir);
	var files = fs.readdirSync(__dirname + mediadir + dir);
	files.forEach(function(file){
		if(fs.statSync(__dirname + mediadir + dir + file).isDirectory()){
			crawlForMedia(dir + file + "/");
		}else{
			mediafiles.push(dir + file);
		}
	});
}
crawlForMedia();

var mediahtml = "<html><head><title>Media</title></head>";
mediahtml += "<link rel='icon' type='image/x-icon' href='favicon.png'/>";
mediahtml += "<body><h1>Media</h1>";
for(var i = 0, len = mediafiles.length; i < len; i++){
	mediahtml += "<a href='" + mediafiles[i] + "'>" + mediafiles[i] + "</a><br>";
}
mediahtml += "</body></html>";
fs.writeFileSync(__dirname + mediadir + "index.html", mediahtml);

console.log(mediadir + "index.html, built.");

STEP();

var pagesdir = "/public/johnpaulhayesii/pages/";
var pagetemplatehtml = fs.readFileSync(__dirname + "/public/johnpaulhayesii/pagetemplate.html", "utf-8");
var files = fs.readdirSync(__dirname + pagesdir);
files.forEach(function(file){
	if(!fs.statSync(__dirname + pagesdir + file).isDirectory()){
		var pagehtml = fs.readFileSync(__dirname + pagesdir + file, "utf-8");
		var newpagehtml = pagetemplatehtml.replace("{{content}}", pagehtml); 	
		fs.writeFileSync(__dirname + "/public/johnpaulhayesii/" + file, newpagehtml);
	}
});

console.log(pagesdir + ", built.");

STEP();

var fikeIndexHtml = "<html><head><title>File Index</title>";
fikeIndexHtml += "<script src='index.js'></script>";
fikeIndexHtml += "<link rel='icon' type='image/x-icon' href='favicon.png'/>";
fikeIndexHtml += "</head><body>";
fikeIndexHtml += "<h1>File Index</h1>";
fikeIndexHtml += "<button onclick='openDetails();'>Open All</button>";
fikeIndexHtml += "<button onclick='closeDetails();'>Close All</button><hr>";

function indexFiles(dir, dirPath){
	if(typeof dirPath === "undefined"){
		dirPath = "/";
	}
	var files = fs.readdirSync(dir);
	for(var i = 0, len = files.length; i < len; i++){
		if(fs.lstatSync(dir + "/" + files[i]).isDirectory()){
			fikeIndexHtml += "<details><summary>" + files[i] + "</summary><div style='margin-left: 50px; border: 1px black solid;'>";
			indexFiles(dir + "/" + files[i], dirPath + files[i] + "/");
			fikeIndexHtml += "</div></details>";
		}else{
			fikeIndexHtml += "<a href='" + dirPath + files[i] + "'>" + files[i] + "</a><br>";
		}
	}
}

indexFiles(PUBLIC);

fikeIndexHtml += "</body></html>";

fs.writeFileSync(PUBLIC + "/file-index/index.html", fikeIndexHtml);

console.log("/file-index/index.html, built.");

STEP();

files = fs.readdirSync(__dirname + "/public/");
	
var indexhtml = "<html>";
indexhtml += "<head>";
indexhtml += "<title>bwackwat</title>";
indexhtml += "<link rel='icon' type='image/x-icon' href='favicon.png'/>";
indexhtml += "</head>";
indexhtml += "<body>";
indexhtml += "<h1>Greetings visitor!</h1>";
indexhtml += "<h2>You've stumbled upon a static index of apps.</h2>";
indexhtml += "<h2>Feel free to explore.</h3>";
files.forEach(function(file){
	if(fs.statSync(__dirname + "/public/" + file).isDirectory()){
		indexhtml += "<a href='" + file + "/'><h3>" + file + "</h3></a>";
	}
});
indexhtml += "<img src='media/blackrat.svg' height='200'/>";
indexhtml += "</body>";
indexhtml += "</html>";

fs.writeFileSync(__dirname + "/public/index.html", indexhtml);

console.log("/public/index.html, built.");

STEP();

files = fs.readdirSync(__dirname + "/nodes/");

var nodes = [];
files.forEach(function(file){
	if(!fs.statSync(__dirname + "/nodes/" + file).isDirectory()){
		process.stdout.write("Initializing " + file + "...");

		var node;
		if(process.env.NODE_ENV === process.env.PRODUCTION){
			node = childProcess.exec("nodejs " + __dirname + "/nodes/" + file);
		}else{
			node = childProcess.exec("node " + __dirname + "/nodes/" + file);
		}

		node.on("error", function(err){
			if(err){throw err;}
		});
		node.on("exit", function(code, signal){
			console.log(file  + " Exited with " + code + " | " + signal);
		});
		node.on("close", function(code, signal){
			console.log(file  + " Closed with " + code + " | " + signal);
		});
		node.on("disconnect", function(){
			console.log(file  + " Disconnected.");
		});
		node.on("message", function(message, sendHandle){
			console.log(file  + " message with " + message + " | " + sendHandle);
		});

		node.stdout.on("data", function(data){
			process.stdout.write(file + " stdout: " + data);
		});
		node.stderr.on("data", function(data){
			process.stdout.write(file + " stderr: " + data);
		});
		
		nodes.push(node);

		console.log(node.pid + "/Done!");
	}
});

STEP();