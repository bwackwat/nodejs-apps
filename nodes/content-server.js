var model = require("../public/content-server/model.js");
var humanTest = require("../modules/human-test.js");
var db = require("../modules/content-server-db.js");
var utility = require("../modules/utility.js");
var wss = require("../modules/ws-server.js");
var bcrypt = require("bcryptjs");

function authenticate(conn){
	conn.authenticationAttempts++;
	db.users.findOne({username: conn.action.username}, function(err, user){
		if(err){throw err;}
		if(user === null){
			conn.jsend({
				type: model.RESULT,
				data: "That user doesn't exist."
			});
			return;
		}else{
			bcrypt.compare(conn.action.password, user.password, function(err, res){
				if(err){throw err;}
				if(res){
					conn.loggedInUser = user.username;
					if(user.username === db.ADMIN){
						utility.fs.readFile("private/websocket-content-server/admin.html", "utf-8", function(err, data){
							conn.jsend({
								type: model.UPDATE_VIEW,
								data: data
							});
						});
					}else{
						utility.fs.readFile("private/websocket-content-server/user.html", "utf-8", function(err, data){
							conn.jsend({
								type: model.UPDATE_VIEW,
								data: data
							});
						});
					}
				}else{
					conn.jsend({
						type: model.RESULT,
						data: "Invalid password."
					});
				}
			});
		}
	});
}

function register(conn){
	if(!humanTest.passed(conn.action.answer, conn.humanTest.a)){
		conn.humanTest = humanTest.get();
		conn.jsend([{
			type: 0,
			data: "Ha! You didn't pass the test."
		},{
			type: "humanTest",
			data: conn.humanTest.q
		}]);
		return;
	}
	db.users.findOne({username: conn.action.username}, function(err, user){
		if(err){throw err;}
		if(user !== null){
			conn.jsend({
				type: model.RESULT,
				data: "That user already exists."
			});
			return;
		}
		if(conn.action.password.length < 6){
			conn.jsend({
				type: model.RESULT,
				data: "A password must have atleast 6 characters."
			});
			return;
		}
		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(conn.action.password, salt, function(err, hash){
				db.users.insert({username: conn.action.username,
									password: hash
				}, function(err, newuser){
					if(err){throw err;}
					utility.fs.readFile("private/websocket-content-server/login.html", "utf-8", function(err, data){
						conn.jsend([{
							type: model.UPDATE_VIEW,
							data: data
						},{
							type: model.RESULT,
							data: "Registration successful!"
						}]);
					});
				});
			});
		});
	});
}

function goto(conn){
	if(conn.loggedInUser !== db.ADMIN &&
		db.ADMIN_SITES.indexOf(conn.action.place) > -1){
		conn.jsend({
			type: model.RESULT,
			data: "You aren't the admin!"
		});
		return;
	}
	var newViewHtml;
	if(conn.action.place === "editposts.html"){
		db.posts.find().sort({createdOn: -1}, function(err, posts){
			if(err){throw err;}

			newViewHtml = "<h2>Edit Posts</h2><h3 id='result'></h3>";
			for(var i = 0, len = posts.length; i < len; i++){
				newViewHtml += "<a href='#' onclick='edit(&quot;" + posts[i]._id + "&quot;);'>";
				newViewHtml += "<br>";
				newViewHtml += posts[i].title + " : " + posts[i].createdOn + "</a>";
			}
			newViewHtml += '<br><input type="button" value="Back" onclick="goto(&quot;admin.html&quot;);"/>';
	
			conn.jsend({
				type: model.UPDATE_VIEW,
				data: newViewHtml
			});
		});
	}else{
		utility.fs.readFile("private/websocket-content-server/" + conn.action.place, "utf-8", function(err, data){
			conn.jsend({
				type: model.UPDATE_VIEW,
				data: data
			});
		});
	}
	if(conn.action.place === "register.html"){
		conn.humanTest = humanTest.get();
		conn.jsend({
			type: "humanTest",
			data: conn.humanTest.q
		});
	}
}

function compilePostsHtml(conn){
	db.posts.find().sort({createdOn: -1}, function(err, posts){
		if(err){throw err;}

		var postshtml = "<div id='posts'>";
		for(var i = 0, len = posts.length; i < len; i++){
			postshtml += "<div id='post'>";
			postshtml += "<div id='posttitle'>" + posts[i].title + "</div>";
			postshtml += "<div id='postdate'>" + posts[i].createdOn.toString() + "</div><br>";
			postshtml += "<div id='posttext'>" + posts[i].text + "</div>";
			postshtml += "</div>";
			postshtml += "<hr>";
		}
		postshtml += "</div>";
		utility.fs.writeFile("public/grokkingequanimity/posts.html", postshtml, function(err){
			if(err){throw err;}
			conn.jsend({
				type: model.RESULT,
				data: "Success... posts.html compiled!"
			});
		});
	});
}

function post(conn){
	if(conn.loggedInUser !== db.ADMIN){
		conn.jsend({
				type: model.RESULT,
				data: "You aren't the admin!"
		});
		return;
	}
	db.posts.insert({
		title: conn.action.title,
		createdOn: new Date(),
		text: conn.action.text
	}, function(err, newpost){
		if(err){throw err;}
		conn.jsend({
				type: model.RESULT,
				data: "Post successful..."
		});
		compilePostsHtml(conn);
	});
}

function edit(conn){
	if(conn.loggedInUser !== db.ADMIN){
		conn.jsend({
			type: model.RESULT,
			data: "You aren't the admin!"
		});
		return;
	}
	db.posts.findOne({_id: db.ObjectId(conn.action.id)}, function(err, post){
		if(err){throw err;}
		utility.fs.readFile("private/websocket-content-server/editpost.html", "utf-8", function(err, data){
			conn.jsend([{
				type: model.UPDATE_VIEW,
				data: data
			},{
				type: model.POST,
				id: conn.action.id,
				title: post.title,
				text: post.text
			}]);
		});
	});
}

function save(conn){
	if(conn.loggedInUser !== db.ADMIN){
		conn.jsend({
			type: model.RESULT,
			data: "You aren't the admin!"
		});
		return;
	}
	db.posts.findAndModify({
		query: {_id: db.ObjectId(conn.action.id)},
		update: { $set: { title: conn.action.title,
			text: conn.action.text,
			lastUpdated: new Date(),
			}}
	}, function(err, newpost, lastErrorObject){
		if(err){throw err;}
		conn.jsend({
				type: model.RESULT,
				data: "Post successfully updated..."
		});
		compilePostsHtml(conn);
	});
}

var config = {
	name: "Content Management Service",
	port: model.PORT,
	init: function(conn){
		conn.authenticationAttempts = 0;
	}
};

var server = wss.startServer(config);

server.addPipe(model.AUTHENTICATE, authenticate);
server.addPipe(model.REGISTER, register);
server.addPipe(model.GOTO, goto);
server.addPipe(model.POST, post);
server.addPipe(model.EDIT_POST, edit);
server.addPipe(model.SAVE_POST, save);