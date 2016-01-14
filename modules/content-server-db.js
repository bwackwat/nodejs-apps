var mongojs = require("mongojs");

var db = mongojs("content_server", ["users", "posts"]);

exports.ObjectId = mongojs.ObjectId;

exports.ADMIN = "bwackwat";
exports.ADMIN_SITES = [
	"newpost.html",
	"editpost.html",
	"admin.html"
];

exports.users = db.collection("users");
exports.posts = db.collection("posts");