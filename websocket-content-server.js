var model = require("./public/websocket-content-server/model.js");
var fs = require("fs");
var ws = require("ws").Server;
var mongojs = require("mongojs");
var bcrypt = require("bcrypt");

var db = mongojs("content_server", ["users", "posts"]);
var userCollection = db.collection("users");
var postCollection = db.collection("posts");

var options = {	
	key: fs.readFileSync("/opt/ssl/ssl.key", "utf-8", function(err, data){if(err)throw err;}),
	cert: fs.readFileSync("/opt/ssl/ssl.crt", "utf-8", function(err, data){if(err)throw err;}),
	passphrase: fs.readFileSync("/opt/ssl/password.txt", "utf-8", function(err, data){if(err)throw err;})
};

function onConnection(req, res){
	res.writeHead(200);
	res.end("All glory to WebSockets!\n");
}

var app = require('https').createServer(options, onConnection).listen(model.PORT);

var wss = new ws({server: app});

function authenticate(conn){
	userCollection.findOne({username: conn.action.username}, function(err, user){
		if(err){throw err;}
		if(user == null){
			conn.send(JSON.stringify({type: model.RESULT,
				data: "That user doesn't exist."}));
			return;
		}else{
			bcrypt.compare(conn.action.password, user.password, function(err, res){
				if(err){throw err;}
				if(res){
					conn.loggedInUser = user.username;

					var viewData;
					if(user.username == "bwackwat"){
						viewData = fs.readFileSync("public/websocket-content-server/admin.html", "utf-8");
					}else{
						viewData = fs.readFileSync("public/websocket-content-server/user.html", "utf-8");
					}
					conn.send(JSON.stringify({type: model.UPDATE_VIEW,
						data: viewData}));
				}else{
					conn.send(JSON.stringify({type: model.RESULT,
						data: "Invalid password."}));
				}
			});
		}
	});
}

function register(conn){
	userCollection.findOne({username: conn.action.username}, function(err, user){
		if(err){throw err;}
		if(user != null){
			conn.send(JSON.stringify({type: model.RESULT,
				data: "That user already exists."}));
			return;
		}
		if(action.password.length < 6){
			conn.send(JSON.stringify({type: model.RESULT,
				data: "A password must have atleast 6 characters."}));
			return;
		}
		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(conn.action.password, salt, function(err, hash){
				userCollection.insert({
					username: conn.action.username,
					password: hash
				}, function(err, newuser){
					if(err){throw err;}
					conn.send(JSON.stringify({type: model.RESULT,
						data: "Registration successful!"}));
				});
			});
		});
	});
}

function goto(conn){
	conn.send(JSON.stringify({type: model.UPDATE_VIEW,
		data: fs.readFileSync("public/websocket-content-server/" + conn.action.place, "utf-8")}));
}

function post(conn){
	if(conn.loggedInUser != "bwackwat"){
		conn.send(JSON.stringify({type: model.RESULT,
			data: "You aren't the admin!"}));
		return;
	}
	var now = new Date();
	postCollection.insert({
		title: conn.action.title,
		createdOn: now,
		text: conn.action.text
	}, function(err, newpost){
		if(err){throw err;}

		conn.send(JSON.stringify({type: model.RESULT,
			data: "Post successful..."}));

		postCollection.find().sort({createdOn: -1}, function(err, posts){
			if(err){throw err;}

			var postshtml = "<div id='posts'>";
			for(var i = 0, len = posts.length; i < len; i++){
				postshtml += "<div id='post'>";
				postshtml += "<div id='posttitle'>" + posts[i].title + "</div>";
				postshtml += "<div id='	postdate'>" + posts[i].createdOn.toString() + "</div><br>";
				postshtml += "<div id='posttext'>" + posts[i].text + "</div>";
				postshtml += "</div>";
				postshtml += "<hr>";
			}
			postshtml += "</div>";
			fs.writeFile("/opt/apps/public/grokkingequanimity/posts.html", postshtml, function(err){
				if(err){throw err;}
				conn.send(JSON.stringify({type: model.RESULT,
					data: "Post successful... posts.html compiled!"}));
			});
		});
	});
}

var packetMapper = new Object();
packetMapper[model.AUTHENTICATE] = authenticate;
packetMapper[model.REGISTER] = register;
packetMapper[model.GOTO] = goto;
packetMapper[model.POST] = post;

wss.on("connection", function(conn){
	conn.on("message", function(str){
		try{
			conn.action = JSON.parse(str);
			if(typeof conn.action === "undefined"){
				throw "No action for message: " + str;
			}else if(typeof conn.action["type"] === "undefined"){
				throw "No type value for action: " + conn.action;
			}else if(typeof packetMapper[conn.action["type"]] === "undefined"){
				throw "No mapper for packet type: " + conn.action["type"];
			}else{
				packetMapper[conn.action["type"]](conn);
			}
		}catch(err){
			console.log("Error: " + err);
			conn.send(JSON.stringify({type: model.RESULT,
				data: "Broken Message!"},
				function ack(err){
					conn.close();
					throw err;
			}));
		}
	});	

	conn.on("error", function(err){
		console.log("This doesn't needa be.");
		throw err;
	});

	conn.on("close", function(err){
		console.log("User dropped connection: " + conn.loggedInUser);
	});
});

//Woot.
console.log("Content Management Server started on " + model.PORT + ".");