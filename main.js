const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
exports.client = client;

var galacticaCode = require("./Galactica/main.js");
var mm3Code = require("./MMTHREE/main.js");


const prefixes = require("./Galactica/other.json").prefixes;

client.on("guildCreate", function (Guild) {
	prefixes.push({prefix: "-", serverID: Guild.id});
});
client.on("guildDelete", function (Guild) {
	for (var i = 0; i < prefixes.length; i++) {
		if (prefixes[i].serverID === Guild.id) {
			prefixes.splice(i, 1);
			break;
		}
	}
});
client.on("ready", function () {
	console.log("Galactica | Online");
	client.user.setGame("-"+ 'help | Guilds: ' + (client.guilds.size));
});
client.on("message",function (message) {
	if (message.author.bot) {
		return;
	}
	if(message.content[0] === "-"){
		galacticaCode.runFunction(message);
	}
	else if(message.content[0] === "."){
		mm3Code.runFunction(message);
	}
});
client.login(require("./config.json").token);//Secure Login
