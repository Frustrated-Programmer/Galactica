/**for testing purposes**/
var skipWarpTime = true;
var skipCollectTime = true;

/**Set Up **/
var version = require("./other.json").version;
const fs = require("fs");
const Discord = require("discord.js");
const client = require("./../main").client;

/**VARIABLES**/
var accountData = require("./accounts.json").players;
var waitTimesInterval = false;


/**CONSTANTS**/
const prefixes = require("./other.json").prefixes;
const updateAccount = require("./account.js");
const embedColors = require("./items.js").colors;
const universalPrefix = "-";
const commands = require("./commands.js").commands;

/**FUNCTIONS**/
function isValidText(str) {
	if (typeof(str) !== 'string') {
		return false;
	}
	for (var i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) > 127) {
			return false;
		}
	}
	return true;
}
function findPlayerData(ID) {
	for (var i = 0; i < accountData.length; i++) {
		if (accountData[i].userID === ID) {
			return accountData[i];
		}
	}
	return null;
}
function saveJsonFile(file) {
	fs.writeFileSync(file, JSON.stringify(require(file), null, 4));//the (null, 4) "cleans" up the json file
}
function runCommand(command, message, args, playerData, prefix) {
	for (var i = 0; i < command.reqs.length; i++) {
		var typeReq = command.reqs[i].split(" ")[0];
		var reqArgs = command.reqs[i].split(" ");
		reqArgs.shift();
		var reqCheck = reqChecks[typeReq](reqArgs, message, args, playerData, prefix);
		if (!reqCheck.val) {
			if (reqCheck.msg) {
				sendBasicEmbed({
					content: reqCheck.msg,
					color  : embedColors.red,
					channel: message.channel
				});
				return;
			}
		}
	}

	command.effect(message, args, playerData, prefix);
	return;
}
function checkPerms(args) {
	/***ARGS return
	 * message: the message that got sent
	 * user: defines whether the user is "bot" or "user"
	 * perms: the permissions were checking
	 */
	var permsCheck = {
		channelPerms: false,//is channel overriding?
		serverPerms : false//is overall server role overriding
	};

	var user;//which user shall we check on
	//gets the member
	if (args.user === "bot") {
		user = args.message.guild.members.get(client.user.id);
	}
	else if (args.user === "user") {
		user = args.message.member;
	}
	else {
		console.log("args.user should be \"user\" or \"bot\"");
		return false;
	}

	//check for permissions
	if (args.message.channel.permissionsFor(user).has(args.perms)) {
		permsCheck.channelPerms = true;
	}//does it have channel perms
	if (args.message.member.hasPermission(args.perms, null, true, true)) {//args.message.guild.members.get(user.id).hasPermission(args.perms)
		permsCheck.serverPerms = true;
	}//does it have role perms
	if (permsCheck.serverPerms !== true) {//check first if you have role perms
		return false;
	}
	else if (permsCheck.channelPerms !== true) {//check if channel is overriding it
		return false;
	}
	return true;
}

/**CLIENTS**/
//client.on("message", function (message) {
exports.runFunction = function (message){
	if (message.author.bot) {
		return;
	}
	var command = message.content.toLowerCase().split(" ")[0];
	var args = message.content.toLowerCase().split(" ");
	var serverPrefix = universalPrefix;
	if (message.channel.type === "text") {
		for (var i = 0; i < prefixes.length; i++) {
			if (prefixes[i].serverID === message.guild.id) {
				serverPrefix = prefixes[i].prefix;
				break;
			}
		}
	}
	if (args[0][0] === universalPrefix || args[0] === "<@" + client.user.id + ">" || args[0].substring(0,serverPrefix.length) === serverPrefix) {
		if(args[0].substring(0,serverPrefix.length) === serverPrefix){
			command = args[0].substring(serverPrefix.length,message.content.length);
		}
		else if (args[0] === "<@" + client.user.id + ">") {
			command = message.content.toLowerCase().split(" ")[1];
			args.shift()
		}
		else {
			command = command.substring(1);
		}
		args.shift();
		for (var i = 0; i < commands.length; i++) {
			if (typeof commands[i] === "object") {
				for (var j = 0; j < commands[i].names.length; j++) {
					if (commands[i].names[j].toLowerCase() === command) {
						if (message.channel.type !== "dm") {
							//SEND_MESSAGES
							if (!checkPerms({user: "bot", perms: "SEND_MESSAGES", message: message})) {
								sendBasicEmbed({
									content: "I do not have `SEND_MESSAGES` permission",
									color  : embedColors.red,
									channel: message.author
								});
								return;
							}
							//EMBED_LINKS
							if (!checkPerms({user: "bot", perms: "EMBED_LINKS", message: message})) {
								sendBasicEmbed({
									content: "I do not have `EMBED_LINKS` permission",
									color  : embedColors.red,
									channel: message.author
								});
								return;
							}
						}
						if (isValidText(message.content)) {
							runCommand(commands[i], message, args, findPlayerData(message.author.id), serverPrefix);
							saveJsonFile("./accounts.json");
							saveJsonFile("./factions.json");
							saveJsonFile("./other.json");
							break;
						}
						else {
							sendBasicEmbed({
								content: "Please only characters `A-Z` and Numbers `0-9`",
								color  : embedColors.red,
								channel: message.author
							}).then(function () {
								return;
							})
						}
					}
				}
			}
		}
	}
};//);
//client.login(require("./config.json").token);//Secure Login
