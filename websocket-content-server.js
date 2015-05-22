var fs = require("fs");
var ws = require("ws").Server;
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");

mongoose.connect("mongodb://localhost/content_server", function(err)
{
	if(err){throw err;}
	console.log("Connected to DB");
});
var userModel = new Schema({
	username: {type: String, required: true},
	password: {type: String, required: true}
});
var User = mongoose.model("User", userModel);

var clientStates = new Object();
var nextClientId = 0;

var server = new ws({port: model.PORT});

server.on("connection", function(conn)
{
	var localId = nextClientId;
	nextClientId++;

	clientStates[localId] = new Object();

	var action;

	conn.on("message", function(str)
	{
		action = JSON.parse(str);
		switch(action[model.ACTION])
		{
			case model.AUTHENTICATE:
				User.where({username: action[model.USERNAME]}).findOne(function(err, user)
				{
					if(err){throw err;}
					bcrypt.compare(action[model.PASSWORD], user.password, function(err, res)
					{
						if(err){throw err;}
						if(res)
						{
							console.log(user.username + " has successfully logged in !");
						}
					});
				});
				break;
			deafult:
				//What is this action?
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