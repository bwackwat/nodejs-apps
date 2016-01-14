var humanTest = require("../modules/human-test.js");
var utility = require("../modules/utility.js");
var wss = require("../modules/ws-server.js");

var transport;
if(process.env.NODE_ENV === process.env.PRODUCTION){
	var mailer = require("nodemailer");
	var sgTransport = require("nodemailer-sendgrid-transport");
	transport = mailer.createTransport(sgTransport(utility.mailauth));
}

function sendNewHumanTest(conn){
	conn.humanTest = humanTest.get();
	conn.jsend({
		type: "humanTest",
		data: conn.humanTest.q
	});
}

function getMessage(conn){
	if(!humanTest.passed(conn.action.answer, conn.humanTest.a)){
		conn.jsend({
			type: 0,
			data: "Ha! You didn't pass the test."
		});
		sendNewHumanTest(conn);
		return;
	}
	if(process.env.NODE_ENV === process.env.PRODUCTION){
		var mailData = {
			from: conn.action.fromname + "<" + conn.action.fromemail + ">",
			to: "john.has.come@gmail.com",
			subject: conn.action.subject,
			text: conn.action.message,
			html: conn.action.message
		};
		transport.sendMail(mailData, function(err, info){
			if(err){throw err;}
		});
	}
	console.log(conn.action);
	conn.jsend({
		type: 0,
		success: true,
		data: "Thanks for contacting me! I hope I get back to you soon."
	});
	conn.close();
}

var config = {
	name: "Contact Service",
	port: 8005,
	pipes: {2: getMessage},
	init: function(conn){
		sendNewHumanTest(conn);
	}
};

wss.startServer(config);