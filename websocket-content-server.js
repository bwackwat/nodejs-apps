var model = require("./public/websocket-content-server/model.js");
var fs = require("fs");
var ws = require("ws").Server;
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

mongoose.connect("mongodb://localhost/content_server", function(err)
{
	if(err){throw err;}
	console.log("Connected to DB");
});
var userModel = new mongoose.Schema({
	username: {type: String, required: true},
	password: {type: String, required: true}
});
var User = mongoose.model("User", userModel);
var postModel = new mongoose.Schema({
	title: {type: String, required: true},
	createdOn: {type: Date, required: true},
	text: {type: String, required: true}
});
var Post = mongoose.model("Post", postModel);

var clientStates = new Object();
var nextClientId = 0;

var server = new ws({port: model.PORT});

function sendPacket(connection)
{
	var action = new Object();
	action[model.ACTION] = model.RESULT;
	action[model.RESULT_DATA] = "That user doesn't exist.";
	connection.send(JSON.stringify(action));
}

server.on("connection", function(conn)
{
	var action;
	var responseAction;

	var loggedInUser;

	conn.on("message", function(str)
	{
		action = JSON.parse(str);
		switch(action[model.ACTION])
		{
			case model.AUTHENTICATE:
				User.where({username: action[model.USERNAME]}).findOne(function(err, user)
				{
					if(err){throw err;}
					if(user == null)
					{
						responseAction = new Object();
						responseAction[model.ACTION] = model.RESULT;
						responseAction[model.RESULT_DATA] = "That user doesn't exist.";
						conn.send(JSON.stringify(responseAction));
						return;
					}
					bcrypt.compare(action[model.PASSWORD], user.password, function(err, res)
					{
						if(err){throw err;}
						if(res)
						{
							loggedInUser = user.username;
							responseAction = new Object();
							responseAction[model.ACTION] = model.UPDATE_VIEW;
							if(user.username == "bwackwat")
							{
								responseAction[model.VIEW_DATA] = fs.readFileSync("public/websocket-content-server/admin.html", "utf-8");
							}else{
								responseAction[model.VIEW_DATA] = fs.readFileSync("public/websocket-content-server/user.html", "utf-8");
							}
							conn.send(JSON.stringify(responseAction));
							return;
						}else
						{
							responseAction = new Object();
							responseAction[model.ACTION] = model.RESULT;
							responseAction[model.RESULT_DATA] = "Invalid password.";
							conn.send(JSON.stringify(responseAction));
							return;
						}
					});
				});
				break;
			case model.REQUEST_PLACE:
				responseAction = new Object();
				responseAction[model.ACTION] = model.UPDATE_VIEW;
				responseAction[model.VIEW_DATA] = fs.readFileSync("public/websocket-content-server/" + action[model.PLACE], "utf-8");
				conn.send(JSON.stringify(responseAction));
				break;
			case model.REGISTER:
				User.where({username: action[model.USERNAME]}).findOne(function(err, user)
				{
					if(err){throw err;}
					if(user != null)
					{
						responseAction = new Object();
						responseAction[model.ACTION] = model.RESULT;
						responseAction[model.RESULT_DATA] = "That user already exists.";
						conn.send(JSON.stringify(responseAction));
						return;
					}
					if(action[model.PASSWORD].length < 6)
					{
						responseAction = new Object();
						responseAction[model.ACTION] = model.RESULT;
						responseAction[model.RESULT_DATA] = "A password must have atleast 6 characters.";
						conn.send(JSON.stringify(responseAction));
						return;
					}
					bcrypt.genSalt(10, function(err, salt)
					{
						bcrypt.hash(action[model.PASSWORD], salt, function(err, hash)
						{
							var newuser = new User({
								username: action[model.USERNAME],
								password: hash
							});
							newuser.save(function(err, newuser)
							{
								if(err){throw err;}
								responseAction = new Object();
								responseAction[model.ACTION] = model.RESULT;
								responseAction[model.RESULT_DATA] = "Registration successful!";
								conn.send(JSON.stringify(responseAction));
								return;
							});
						});
					});
				});
				break;
			case model.NEW_POST:
				if(loggedInUser != "bwackwat")
				{
					responseAction = new Object();
					responseAction[model.ACTION] = model.RESULT;
					responseAction[model.RESULT_DATA] = "You aren't the admin!";
					conn.send(JSON.stringify(responseAction));
					return;
				}
				var now = new Date();
				var newposthtml = "<div id='title'>" + action[model.TITLE] + "</div><br>";
				newposthtml += "<div id='date'>" + now.toString() + "</div><br>";
				newposthtml += "<div id='text'>" + action[model.TEXT] + "</div>";
				var newpost = new Post({
					title: action[model.TITLE],
					createdOn: now,
					text: action[model.TEXT]
				});
				newpost.save(function(err, newpost)
				{
					if(err){throw err;}
					responseAction = new Object();
					responseAction[model.ACTION] = model.RESULT;
					responseAction[model.RESULT_DATA] = "Post successful!";
					conn.send(JSON.stringify(responseAction));
					//START COMPILE 10 BLOG POSTS ROUTINE
					var allposts = Post.find({}).sort({createdOn: -1}).exec(function(err, docs)
					{
						if(err){throw err;}
						console.log(docs);
					});
					//END
					return;
				});
				break;
			deafult:
				console.log("Encountered unknown action: " + action);
				break;
		}
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