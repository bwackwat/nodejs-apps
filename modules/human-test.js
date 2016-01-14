var randomWords = require("random-words");
var util = require("util");

function randomWordQuestion(){
	var word = randomWords();
	return {q: "How many letters are in '" + word + "'?",
		a: [word.length]};
}

function randomMathQuestion(){
	var first = Math.floor(Math.random() * 100) - 50;
	var second = Math.floor(Math.random() * 100) - 50;
	if(Math.random() < 0.5){
		return {q: "What is the solution to: " + first + " + " + second + "?",
			a: [first + second]};
	}else{
		return {q: "What is the solution to: " + first + " - " + second + "?",
			a: [first - second]};
	}
}

var trivia = [
	{q: "What color is the sky?",
	a: ["blue"]},
	{q: "How many fingers on a human hand?",
	a: ["5", "five"]},
	{q: "How many toes on a human foot?",
	a: ["5", "five"]},
	{q: "How many seconds in a minute?",
	a: ["60", "sixty"]},
	{q: "How many mintues in an hour?",
	a: ["60", "sixty"]},
	{q: "How many hours in a day?",
	a: ["24", "twenty four"]},
	{q: "How many days in a year?",
	a: ["365", "three hundred and sixty five"]},
	{q: "How many months in a year?",
	a: ["12", "twelve"]},
	{q: "What does U.S. stand for?",
	a: ["united states"]},
	{q: "How many planets in the solar system?",
	a: ["9", "nine"]},
	{q: "How many edges does a square have?",
	a: ["4", "four"]},
	{q: "How many edges does a triangle have?",
	a: ["3", "three"]},
	{q: "How many edges does a pentagon have?",
	a: ["5", "five"]},
	{q: "How many edges does a hexagon have?",
	a: ["6", "six"]},
	{q: "What is the 3D shape of planet Earth?",
	a: ["sphere"]}
];

if(process.env.NODE_ENV === process.env.PRODUCTION){
	trivia.push(randomWordQuestion);
	trivia.push(randomMathQuestion);
}

exports.answerTo = function(question){
	for(var i = 0, len = trivia.length; i < len; i++){
		if(trivia[i].q === question){
			return trivia[i].a[0];
		}
	}
	return "human-test.js answerTo(" + util.inspect(question) + ") ERROR!";
};

exports.get = function(){
	var humanTest = trivia[Math.floor(Math.random() * trivia.length)];
	if(humanTest instanceof Function){
		humanTest = humanTest();
	}
	return humanTest;
};

exports.passed = function(answer, answers){
	var numAnswers = answers.length;
	for(var i = 0; i < numAnswers; i++){
		if(answer === answers[i]){
			return true;
		}
	}
	return false;
};