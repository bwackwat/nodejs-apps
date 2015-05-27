var model = require("./public/websocket-content-server/model.js");
var fs = require("fs");
var ws = require("ws").Server;
var mongojs = require("mongojs");
var bcrypt = require("bcrypt");

var db = mongojs("content_server", ["users", "posts"]);
var userCollection = db.collection("users");
var postCollection = db.collection("posts");

var server = new ws({port: model.PORT});

function authenticate(action, conn)
{
	userCollection.findOne({username: action.username}, function(err, user)
	{
		if(err){throw err;}
		if(user == null)
		{
			conn.send(JSON.stringify({type: model.RESULT,
				data: "That user doesn't exist."}));
			return;
		}else
		{
			bcrypt.compare(action.password, user.password, function(err, res)
			{
				if(err){throw err;}
				if(res)
				{
					loggedInUser = user.username;

					var viewData;
					if(user.username == "bwackwat")
					{
						viewData = fs.readFileSync("public/websocket-content-server/admin.html", "utf-8");
					}else
					{
						viewData = fs.readFileSync("public/websocket-content-server/user.html", "utf-8");
					}
					conn.send(JSON.stringify({type: model.UPDATE_VIEW,
						data: viewData}));
				}else
				{
					conn.send(JSON.stringify({type: model.RESULT,
						data: "Invalid password."}));
				}
			});
		}
	});
}

function register(action, conn){
	userCollection.findOne({username: action.username}, function(err, user)
	{
		if(err){throw err;}
		if(user != null)
		{
			conn.send(JSON.stringify({type: model.RESULT,
				data: "That user already exists."}));
			return;
		}
		if(action.password.length < 6)
		{
			conn.send(JSON.stringify({type: model.RESULT,
				data: "A password must have atleast 6 characters."}));
			return;
		}
		bcrypt.genSalt(10, function(err, salt)
		{
			bcrypt.hash(action.password, salt, function(err, hash)
			{
				userCollection.insert({
					username: action.username,
					password: hash
				}, function(err, newuser)
				{
					if(err){throw err;}
					conn.send(JSON.stringify({type: model.RESULT,
						data: "Registration successful!"}));
				});
			});
		});
	});
}

function goto(action, conn){
	conn.send(JSON.stringify({type: model.UPDATE_VIEW,
		data: fs.readFileSync("public/websocket-content-server/" + action.place, "utf-8")}));
}

function post(action, conn){
	if(loggedInUser != "bwackwat")
	{
		conn.send(JSON.stringify({type: model.RESULT,
			data: "You aren't the admin!"}));
		return;
	}
	var now = new Date();
	postCollection.insert({
		title: action.title,
		createdOn: now,
		text: action.text
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

server.on("connection", function(conn)
{
	var action;
	var type = new Object();

	var loggedInUser;

	conn.on("message", function(str)
	{

		try{
			action = JSON.parse(str);
			if(typeof action === "undefined"){
				throw "No action for message: " + str;
			}else if(typeof action["type"] === "undefined"){
				throw "No type value for action: " + action;
			}else if(typeof packetMapper[action["type"]] === "undefined"){
				throw "No mapper for packet type: " + action["type"];
			}else{
				packetMapper[action["type"]](action, conn);
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

		/*switch(action.type)
		{
			case model.AUTHENTICATE:
				userCollection.findOne({username: action.username}, function(err, user)
				{
					if(err){throw err;}
					if(user == null)
					{
						conn.send(JSON.stringify({type: model.RESULT,
							data: "That user doesn't exist."}));
						return;
					}else
					{
						bcrypt.compare(action.password, user.password, function(err, res)
						{
							if(err){throw err;}
							if(res)
							{
								loggedInUser = user.username;
	
								var viewData;
								if(user.username == "bwackwat")
								{
									viewData = fs.readFileSync("public/websocket-content-server/admin.html", "utf-8");
								}else
								{
									viewData = fs.readFileSync("public/websocket-content-server/user.html", "utf-8");
								}
								conn.send(JSON.stringify({type: model.UPDATE_VIEW,
									data: viewData}));
							}else
							{
								conn.send(JSON.stringify({type: model.RESULT,
									data: "Invalid password."}));
							}
						});
					}
				});
				break;
			case model.REGISTER:
				userCollection.findOne({username: action.username}, function(err, user)
				{
					if(err){throw err;}
					if(user != null)
					{
						conn.send(JSON.stringify({type: model.RESULT,
							data: "That user already exists."}));
						return;
					}
					if(action.password.length < 6)
					{
						conn.send(JSON.stringify({type: model.RESULT,
							data: "A password must have atleast 6 characters."}));
						return;
					}
					bcrypt.genSalt(10, function(err, salt)
					{
						bcrypt.hash(action.password, salt, function(err, hash)
						{
							userCollection.insert({
								username: action.username,
								password: hash
							}, function(err, newuser)
							{
								if(err){throw err;}
								conn.send(JSON.stringify({type: model.RESULT,
									data: "Registration successful!"}));
							});
						});
					});
				});
				break;
			case model.GOTO:
				conn.send(JSON.stringify({type: model.UPDATE_VIEW,
					data: fs.readFileSync("public/websocket-content-server/" + action.place, "utf-8")}));
				break;
			case model.POST:
				if(loggedInUser != "bwackwat")
				{
					conn.send(JSON.stringify({type: model.RESULT,
						data: "You aren't the admin!"}));
					return;
				}
				var now = new Date();
				postCollection.insert({
					title: action.title,
					createdOn: now,
					text: action.text
				}, function(err, newpost)
				{
					if(err){throw err;}
					conn.send(JSON.stringify({type: model.RESULT,
						data: "Post successful..."}));

					postCollection.find().sort({createdOn: -1}, function(err, posts)
					{
						if(err){throw err;}
						var postshtml = "<div id='posts'>";
						for(var i = 0, len = posts.length; i < len; i++)
						{
							postshtml += "<div id='post'>";
							postshtml += "<div id='posttitle'>" + posts[i].title + "</div>";
							postshtml += "<div id='postdate'>" + posts[i].createdOn.toString() + "</div><br>";
							postshtml += "<div id='posttext'>" + posts[i].text + "</div>";
							postshtml += "</div>";
							postshtml += "<hr>";
						}
						postshtml += "</div>";
						fs.writeFile("/opt/apps/public/grokkingequanimity/posts.html", postshtml, function(err)
						{
							if(err){throw err;}
							conn.send(JSON.stringify({type: model.RESULT,
								data: "Post successful... posts.html compiled!"}));
						});
					});
				});
				break;
			deafult:
				console.log("Encountered unknown action: " + action);
				break;
		}*/
	});	

	conn.on("error", function(err)
	{
		//Error
		throw err;
	});

	conn.on("close", function(code, reason)
	{
		//Close?
	});
});

//Woot.
console.log("Server started on " + model.PORT + ".");