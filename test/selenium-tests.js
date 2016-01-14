var db = require("../modules/content-server-db.js");
var humanTest = require("../modules/human-test.js");
var webDriver = require("selenium-webdriver");
var assert = require("assert");
var util = require("util");

var by = webDriver.By;
var until = webDriver.until;
var driver = new webDriver.Builder().forBrowser("chrome").build();

var hostname = "https://";
var hostIsSet = process.argv.indexOf("-h");
if(hostIsSet > -1){
	hostname += process.argv[hostIsSet + 1] + "/";
}else{
	hostname += "localhost/";
}

db.users.remove({});
db.posts.remove({});

console.log("Selenium Tests Running...");

function wait(id) {
	return driver.wait(function () {
		return driver.isElementPresent(by.id(id));
	}, 1000);
}

function register(username, password) {
	driver.get(hostname + "content-server");

	wait("login.html");

	wait("register");
	driver.findElement(by.id("register")).click();

	wait("register.html");

	driver.findElement(by.id("username")).sendKeys(username);
	
	driver.findElement(by.id("password")).sendKeys(password);

	driver.wait(function () {
		return driver.findElement(by.id("testquestion")).getText().then(function(text){
			if(text !== ""){
				driver.findElement(by.id("testanswer")).sendKeys(humanTest.answerTo(text));
				return true;
			}
			return false;
		});
	}, 1000);

	driver.findElement(by.id("register")).click();

	wait("login.html").then(function(){
		db.users.findOne({username: username}, function(err, user){
			if(err){throw err;}
			assert(user !== null);
		});
	});
}

function login(username, password) {
	driver.get(hostname + "content-server");

	wait("login.html");

	driver.findElement(by.id("username")).sendKeys(username);
	driver.findElement(by.id("password")).sendKeys(password);
	driver.findElement(by.id("authenticate")).click();

	if (username === db.ADMIN) {
		wait("admin.html");
	} else {
		wait("user.html");
	}
}

function submitContactForm(){
	driver.get(hostname + "johnpaulhayesii");
	
	wait("content");
	
	driver.findElement(by.id("contactLink")).click();
	
	wait("content");
	
	driver.findElement(by.id("fromname")).sendKeys("testName");
	driver.findElement(by.id("fromemail")).sendKeys("testEmail");
	driver.findElement(by.id("subject")).sendKeys("testSubject");
	driver.findElement(by.id("message")).sendKeys("testMessage");

	driver.wait(function () {
		return driver.findElement(by.id("testquestion")).getText().then(function(text){
			if(text !== ""){
				driver.findElement(by.id("testanswer")).sendKeys(humanTest.answerTo(text));
				return true;
			}
			return false;
		});
	}, 2000);

	driver.findElement(by.id("submitPost")).click();
	
	driver.wait(function(){
		return driver.findElements(by.id("fromname")).then(function(elems){
			return elems.length === 0;
		});
	}, 1000);
}

register(db.ADMIN, "aq12ws");

login(db.ADMIN, "aq12ws");

driver.executeScript("location.reload();");

register("test", "abc123");

login("test", "abc123");

submitContactForm();

driver.quit().then(function(){
	console.log("Done!");
	process.exit();
});