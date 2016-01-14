exports.fs = require("fs");

if (process.env.NODE_ENV == "PRODUCTION") {
	exports.ssloptions = {
		key: exports.fs.readFileSync("../ssl/ssl.key", "utf-8", function (err, data) { if (err) throw err; }),
		cert: exports.fs.readFileSync("../ssl/ssl.crt", "utf-8", function (err, data) { if (err) throw err; }),
		passphrase: exports.fs.readFileSync("../ssl/password.txt", "utf-8", function (err, data) { if (err) throw err; })
	};
} else {
	exports.ssloptions = {
		key: exports.fs.readFileSync("ssl-dev/ssl.key", "utf-8", function (err, data) { if (err) throw err; }),
		cert: exports.fs.readFileSync("ssl-dev/ssl.crt", "utf-8", function (err, data) { if (err) throw err; }),
		passphrase: exports.fs.readFileSync("ssl-dev/password.txt", "utf-8", function (err, data) { if (err) throw err; })
	};
}

exports.mailauth = {
	auth: {
		api_user: "bwackwat",
		api_key: exports.fs.readFileSync("../mailpass.txt", "utf-8", function (err, data) { if (err) throw err; })
	}
};