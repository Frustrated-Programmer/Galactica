/**VARIABLES**/
var factions = require("./factions.json").factions;
var accountData = require("./accounts.json").players;
var listOfWaitTimes = require("./other.json").listOfWaitTimes;
var waitTimesInterval = false;
var map = createMap(4, 25, 25);

/**FUNCTIONS**/
function getBorders(location) {
	var bordering = [];
	if (location[1] > 0) {
		bordering.push(map[location[0]][location[1] - 1][location[2]].type);
	}
	if (location[1] < map[location[0]].length) {
		bordering.push(map[location[0]][location[1] + 1][location[2]].type);
	}
	if (location[2] > 0) {
		bordering.push(map[location[0]][location[1]][location[2] - 1].type);
	}
	if (location[2] < map[location[0]][location[1]].length) {
		bordering.push(map[location[0]][location[1]][location[2] + 1].type);
	}
	return bordering;
}
function checkWaitTimes() {
	for (var i = 0; i < listOfWaitTimes.length; i++) {
		if (listOfWaitTimes[i].expires < Date.now()) {
			switch (listOfWaitTimes[i].type) {
				case "warp":
					listOfWaitTimes[i].player.location = listOfWaitTimes[i].headTo;
					break;
			}
			listOfWaitTimes.splice(i, 1)
		}
	}
	if (!listOfWaitTimes.length) {
		clearInterval(waitTimesInterval);
		waitTimesInterval = false;
	}
}
function createMap(galaxys, xSize, ySize) {
	var planets = [
		{
			name  : "empty",
			chance: 0
		},
		{
			name  : "Ocean",
			chance: 1
		},
		{
			name  : "Mine",
			chance: 1
		},
		{
			name  : "Terrestrial",
			chance: 1
		},
		{
			name  : "Gas",
			chance: 1
		},
		{
			name  : "Rocky",
			chance: 1
		},
		{
			name  : "Colony",
			chance: 1
		}
	];
	var chance = 0;
	for (var p = 0; p < planets.length; p++) {
		chance += planets[p].chance;//puts together the entire "chance" of all planets
	}
	var map = [];
	for (var g = 0; g < galaxys; g++) {
		var galaxy = [];
		for (var y = 0; y < ySize; y++) {
			var yMap = [];
			for (var x = 0; x < xSize; x++) {
				var whichPlanet = Math.round(Math.random() * chance);//which planet but as a number
				var subtractChance = 0;//subtract the previous chances
				var planet = undefined;//which planet
				for (var p = 0; p < planets.length; p++) {
					if (whichPlanet = (p + 1) - subtractChance) {
						planet = p;
					}
					else {
						subtractChance += planets[p].chance;
					}
				}
				if (planet === undefined) {
					planet = 0;
				}
				yMap.push({
					type          : planets[planet].name,
					ownerOfStation: "none"
				});
			}
			galaxy.push(yMap);
		}
		map.push(galaxy);
	}

	return map;
}
function sendBasicEmbed(args) {
	var embed = new Discord.RichEmbed()
		.setColor(args.color)
		.setDescription(args.content);
	args.channel.send(embed);
}
function channelClear(channel, msgnum) {
	if (msgnum) {
		channel.bulkDelete(msgnum, true);
	}
	else {
		channel.bulkDelete(100, true).then(function () {
			if (channel.lastMessageID) {
				channelClear(channel);
			}
		});
	}
}
function getNumbers(text, parsed) {
	var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	var whichWordAreWeAt = 0;
	var wordsWithNumbers = [];
	var foundNumber = false;
	for (var i = 0; i < text.length; i++) {
		var currentTextIsNumber = false;
		for (var j = 0; j < numbers.length; j++) {
			if (text[i] === numbers[j]) {
				if (!wordsWithNumbers.length) {
					wordsWithNumbers[0] = "";
				}
				foundNumber = true;
				wordsWithNumbers[whichWordAreWeAt] += text[i];
				currentTextIsNumber = true;
			}
		}
		if (!currentTextIsNumber && foundNumber) {
			if (parsed) {
				wordsWithNumbers[whichWordAreWeAt] = parseInt(wordsWithNumbers[whichWordAreWeAt], 10);
			}
			whichWordAreWeAt++;
			foundNumber = false;
			wordsWithNumbers[whichWordAreWeAt] = "";
		}
	}
	return wordsWithNumbers;
}//insert in text get back an array of all the numbers in that text
function getTimeRemaining(time) {
	var times = [[86400000, 0, "day"], [3600000, 0, "hour"], [60000, 0, "minute"], [1000, 0, "second"], [1, 0, "millisecond"]];
	var timeLeftText = "";
	var fakeTime = time;
	for (var i = 0; i < times.length; i++) {
		if (fakeTime >= times[i][0]) {
			while (fakeTime >= times[i][0]) {
				fakeTime -= times[i][0];
				times[i][1]++;
			}
		}
		if (times[i][1] > 0) {
			timeLeftText += "`" + times[i][1] + "` ";
			timeLeftText += times[i][2];
			if (times[i][1] > 0) {
				timeLeftText += "s";
			}
			if (i === times.length) {
				timeLeftText += " and "
			}
			else {
				timeLeftText += ", "
			}
		}
	}
	return timeLeftText;
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
function spacing(text, text2, max) {
	var newText = text;
	var len = max - text.length - text2.length;
	for (var i = 0; i < len; i++) {
		newText += " ";
	}
	newText += text2;
	return newText;
}
function matchArray(arr1, arr2, text) {
	var match = true;
	text = text || false;
	if (text) {
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i].toLowerCase() !== arr2[i].toLowerCase()) {
				match = false;
			}
		}
	}
	else {
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) {
				match = false;
			}
		}
	}
	return match;
}
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


/**CONSTANTS**/
const Discord = require("discord.js");
const prefixes = require("./other.json").prefixes;
const updateAccount = require("./account.js");
const createFaction = require("./faction.js");
const planets = require("./items.js").planets;
const resources = require("./items.js").resources;
const stations = require("./items.js").stations;
const embedColors = require("./items.js").colors;
const universalPrefix = "-";
const researches = require("./items.js").researches;
const reqChecks = {

	"argNum"           : function (reqArgs, message, args, playerData, prefix) {
		return {
			val: args[reqArgs][0] !== parseInt(args[reqArgs][0], 10)
		};
	},
	"argOver"          : function (reqArgs, message, args, playerData, prefix) {
		if (reqChecks.argNum(reqArgs, message, args, playerData, prefix)) return {
			val: false
		};
		return {val: args[reqArgs[0]] > parseInt(reqArgs[1])};
	},
	"argUnder"         : function (reqArgs, message, args, playerData, prefix) {
		if (reqChecks.argNum(reqArgs, message, args, playerData, prefix)) return {
			val: false
		};
		return {val: args[reqArgs[0]] < parseInt(reqArgs[1])};
	},
	"argNot"           : function (reqArgs, message, args, playerData, prefix) {
		if (reqChecks.argNum(reqArgs, message, args, playerData, prefix)) return {
			val: false
		};
		return {
			val: args[reqArgs[0]] !== parseInt(reqArgs[1])
		};
	},
	"botPerms"         : function (reqArgs, message, args, playerData, prefix) {
		return {
			val: checkPerms({
				user   : "bot",
				perms  : reqArgs[0],
				message: message
			}),
			msg: "The bot currently doesn't have: `" + reqArgs[0] + "`"
		};
	},
	"userPerms"        : function (reqArgs, message, args, playerData, prefix) {
		return {
			val: checkPerms({
				user   : "user",
				perms  : reqArgs[0],
				message: message
			}),
			msg: "You currently don't have: `" + reqArgs[0] + "`"
		};
	},
	"owner"            : function (reqArgs, message, args, playerData, prefix) {
		if (message.author.id === "198590928166977537" || message.author.id === "244590122811523082") {
			return {val: true, msg: ""};
		}
		return {val: false, msg: "You must be an owner of the bot."}
	},
	"warping"          : function (reqArgs, message, args, playerData, prefix) {
		var x = "false";
		for (var i = 0; i < listOfWaitTimes.length; i++) {
			if (listOfWaitTimes[i].expires < Date.now()) {
				if (listOfWaitTimes[i].type === "warp" && listOfWaitTimes[i].player.id === message.author.id) {
					x = "true"
				}
			}
		}
		if (reqArgs[0] === x) {
			return {val: true, msg: ""}
		}
		else {
			if (reqArgs[0] === "true") {
				return {val: false, msg: "You have to be warping to use this command."}
			}
			return {val: false, msg: "You can't be warping to use this command."}
		}
	},
	"profile"          : function (reqArgs, message, args, playerData, prefix) {
		if (reqArgs[0] === "true") {
			return {val: playerData !== null, msg: "You need to create a profile. use `" + prefix + "join`"};
		}
		else {
			return {val: playerData === null, msg: "You already have a profile."};
		}
	},
	"faction"          : function (reqArgs, message, args, playerData, prefix) {
		if (reqArgs[0] === "true") {
			return {val: playerData.faction !== null, msg: "You need to be in a faction."};
		}
		else {
			return {val: playerData.faction === null, msg: "You can't be in a faction"};
		}
	},
	"factionMod"       : function (reqArgs, message, args, playerData, prefix) {
		var fac = factions[playerData.faction];
		if (message.author.id === fac.creator) {
			return {val: true, msg: ""};
		}
		for (var i = 0; i < fac.mods.length; i++) {
			if (message.author.id === fac.mods[i]) {
				return {val: true, msg: ""};
			}
		}
		return {val: false, msg: "You need to be a mod of your faction"}
	},
	"factionOwner"     : function (reqArgs, message, args, playerData, prefix) {
		var fac = factions[playerData.faction];
		if (message.author.id === fac.creator) {
			return {val: true, msg: ""};
		}
		return {val: false, msg: "You need to be a owner of your faction"}
	},
	"factionImage"     : function (reqArgs, message, args, playerData, prefix) {
		if (playerData) {
			if (playerData.faction) {
				if (factions[playerData.faction].canUseImage) {
					return {val: true, msg: ""}
				}
			}
		}
		return {val: false, msg: "You haven't unlocked this yet."}
	},
	"upgradableFaction": function (reqArgs, message, args, playerData, prefix) {
		var faction = factions[playerData.faction];
		if (faction.level + 1 !== factions.costs.length) {
			var missing = "";
			var stuff = factions.costs[faction.level].split(" ");
			if (faction[stuff[0]] < parseInt(stuff[1], 10)) {
				missing += (parseInt(stuff[1], 10) - faction[stuff[0]]) + " " + resources[stuff[0]] + " " + stuff[0];
			}
			if (missing.length > 0) {
				return {val: false, msg: "Your faction is missing\n```css\n" + missing + "```"}
			}
			return {val: true, msg: ""}
		}
		else {
			return {val: false, msg: "Your faction is at the maxed level."}
		}
	},
	"channel"          : function (reqArgs, message, args, playerData, prefix) {
		if (reqArgs[0] === "text") {
			return {val: message.channel.type === "text", msg: "You need to be in a text channel"};
		}
		else if (reqArgs[0] === "dm") {
			return {val: message.channel.type === "dm", msg: "You cannot be in a text channel"};
		}
		else {
			return {
				val: false, msg: "A bug occurred. please report this code `channelMustBeTextOrDm`"
			}
		}
	}
};
const commands = [

	"HELP",
	{
		names      : ["help"],
		description: "get a list of all the commands you can do",
		usage      : "help",
		values     : [],
		reqs       : [],
		effect     : function (message, args, playerData, prefix) {
			var txt = "```css\n";
			for (var i = 0; i < commands.length; i++) {
				if (typeof commands[i] === "object") {
					var sendIt = true;
					for (var q = 0; q < commands[i].reqs.length; q++) {
						var typeReq = commands[i].reqs[q].split(" ")[0];
						var reqArgs = commands[i].reqs[q].split(" ");
						reqArgs.shift();
						var reqCheck = reqChecks[typeReq](reqArgs, message, args, playerData, prefix);
						if (!reqCheck.val) {
							sendIt = false;
						}
					}
					if (sendIt) {
						txt += commands[i].names[0] + "\n";
					}
				}
			}
			var embed = new Discord.RichEmbed()
				.setColor(embedColors.blue)
				.setTitle("HELP")
				.setDescription("For more info\n" + prefix + "command [NAME]")
				.addField("COMMANDS", txt + "```")
				.addField("JOIN US", "[INVITE-BOT](https://discordapp.com/oauth2/authorize?client_id=354670433154498560&scope=bot&permissions=67234830)\n[JOIN-OUR-DISCORD](https://discord.gg/U67PyRG)");
			message.channel.send(embed);
		}
	},
	{
		names      : ["commands", "command", "coms", "com"],
		description: "get a list of all the commands",
		usage      : "commands [VALUE]",
		values     : ["List", "{COMMAND_NAME}"],
		reqs       : [],
		effect     : function (message, args, playerData, prefix) {
			if (args[0] == "" || args[0] == null) {
				args[0] = "list";
			}
			switch (args[0]) {
				case "list":
					var commandsList = "```markdown\n";
					for (var i = 0; i < commands.length; i++) {
						if (typeof commands[i] === "object") {
							commandsList += commands[i].names[0] + "\n"
						}
						else {
							commandsList += "#" + commands[i] + "\n";
						}
					}
					commandsList += "```";
					var embed = new Discord.RichEmbed()
						.setColor(embedColors.blue)
						.setTitle("COMMAND'S LIST")
						.setDescription(commandsList)
						.setFooter(prefix + "command [NAME]");
					message.channel.send(embed);
					break;
				default:
					var commandIs = null;
					for (var i = 0; i < commands.length; i++) {
						if (typeof commands[i] === "object") {
							for (var j = 0; j < commands[i].names.length; j++) {
								if (args[0] === commands[i].names[j].toLowerCase()) {
									commandIs = i;
									break;
								}
							}

						}
						if (commandIs != null) {
							break;
						}
					}

					if (commandIs == null) {
						sendBasicEmbed({
							content: "Invalid Usage\nTry using `" + prefix + "commands list`",
							color  : embedColors.red,
							channel: message.channel
						})
					}
					else {
						var aliases = "";
						var command = commands[commandIs];
						for (var i = 0; i < command.names.length; i++) {
							aliases += "`" + command.names[i] + "` ";
						}
						var embed = new Discord.RichEmbed()
							.setColor(embedColors.blue)
							.setTitle("INFO ABOUT \"**`" + prefix + command.names[0] + "`**\"")
							.setDescription(command.description)
							.addField("Aliases", aliases)
							.addField("Usage", "`" + prefix + command.usage + "`", true);
						if (command.values.length) {
							var vals = "";
							for (var i = 0; i < command.values.length; i++) {
								vals += "`" + command.values[i] + "` ";
								if (i + 1 !== command.values.length) {
									vals += "|| "
								}
							}
							embed.addField("`[VALUE]` can be used as:", vals, true);
						}
						message.channel.send(embed);
					}
					break;
			}
		}
	},
	{
		names      : ["version"],
		description: "get the server' current version",
		usage      : "version",
		values     : [],
		reqs       : [],
		effect     : function (message, args, playerData, prefix) {
			sendBasicEmbed({
				content: "Galactica's current version is `" + version + "`",
				color  : embedColors.purple,
				channel: message.channel
			})
		}
	},
	{
		names      : ["ping"],
		description: "ping the server and find how long is the response time",
		usage      : "ping",
		values     : [],
		reqs       : [],
		effect     : function (message, args, playerData, prefix) {
			var storedTimeForPingCommand = Date.now();
			var embed = new Discord.RichEmbed()
				.setColor(embedColors.purple)
				.setDescription("Response Time: `Loading...`");
			message.channel.send(embed).then(function () {
				embed.setDescription("Response time: `" + (Date.now() - storedTimeForPingCommand) + "` ms");

				var msgID = message.channel.lastMessageID
				var msg = message.channel.fetchMessage(msgID).then(function (m) {
					m.edit(embed);
				});
			})
		}
	},
	{
		names      : ["join"],
		description: "join the game",
		usage      : "join",
		values     : [],
		reqs       : ["profile false"],
		effect     : function (message, args, playerData, prefix) {
			var newPlayerData = new updateAccount();
			newPlayerData.userID = message.author.id;
			accountData.push(newPlayerData);
			sendBasicEmbed({
				color  : embedColors.green,
				content: "Account Created",
				channel: message.channel
			});
		}
	},

	"GAMEPLAY",
	{
		names      : ["collect"],
		description: "collect resources from your stations",
		usage      : "collect",
		values     : [],
		reqs       : ["profile true"],
		effect     : function (message, args, playerData, prefix) {
			var canContinue = true;
			if (playerData.stations.length === 0) {
				sendBasicEmbed({
					content: "You currently don't have any stations",
					channel: message.channel,
					color  : embedColors.red
				});
				canContinue = false;
			}
			if (playerData.lastCollection + (60000 * 5) > Date.now() && !skipCollectTime) {
				sendBasicEmbed({
					content: "You can only collect once every 5 minutes\nYou currently need to wait:\n" + getTimeRemaining((playerData.lastCollection + (60000 * 5)) - Date.now()),
					channel: message.channel,
					color  : embedColors.red
				});
				canContinue = false;
			}
			if (canContinue) {
				var amount = Math.round((Date.now() - playerData.lastCollection) / (60000 * 5));//multiplied amount 5 minutes is normal(1) and 10 is doubled(2) (ETC)
				if(skipCollectTime){
					amount = 10;
				}
				playerData.lastCollection = Date.now();
				var gainedResources = {};//amount of resources gained
				var bonusResourcesPlanet = {};//amount of bonus resources gained from planets
				var bonusResourcesResearch = {};//amount of bonus resources gained from research
				for(var i=0;i<resources.names.length;i++){
					gainedResources[resources.names[i]] = 0;
					bonusResourcesPlanet[resources.names[i]] = 0;
					bonusResourcesResearch[resources.names[i]] = 0;
				}
				for (var i = 0; i < playerData.stations.length; i++) {
					var station = stations[playerData.stations[i].type];

					var planetBonus = 0;
					var borders = getBorders(playerData.stations[i].location);
					for (var bor = 0; bor < borders.length; bor++) {
						var planet = planets[borders[bor]];
						for (var bons = 0; bons < planet.bonuses.length; bons++) {
							if(planet.bonuses[bons][0].toLowerCase() === station.name.toLowerCase()){
								planetBonus = parseInt(planet.bonuses[bons][1], 10);
								break;
							}
						}
						if(planetBonus!==0){
							break;
						}
					}
					for (var j = 0; j < station.gives[playerData.stations[i].level].length; j++) {
						var stuff = station.gives[playerData.stations[i].level][j].split(" ");
						gainedResources[stuff[0]] += parseInt(stuff[1], 10) * amount;
						playerData[stuff[0]] += parseInt(stuff[1], 10) * amount;
						bonusResourcesPlanet[stuff[0]] += Math.round(parseInt(stuff[1], 10) * (planetBonus / 100) * amount);
						playerData[stuff[0]] += Math.round(parseInt(stuff[1], 10) * (planetBonus / 100) * amount);

						if (stuff[0] === "steel" || stuff[0] === "titanium" || stuff[0] === "carbon" || stuff[0] === "neutronium") {
							bonusResourcesResearch[stuff[0]] += Math.round(parseInt(stuff[1], 10) * (playerData["Inductive Isolation Methods"] / 100) * amount);
							playerData[stuff[0]] += Math.round(parseInt(stuff[1], 10) * (playerData["Inductive Isolation Methods"] / 100) * amount);
						}
					}
				}
				/**LongestSpace makes sure all the resources TEXT is evenly spaced even with double digits**/
				var longestSpace = [0,0,0];
				for (var i = 0; i < resources.names.length; i++) {
					if (gainedResources[resources.names[i]] != null) {
						if (("" + gainedResources[resources.names[i]]).length > longestSpace[0]) {
							longestSpace[0] = (""+	gainedResources[resources.names[i]]).length;
						}
					}
					if (bonusResourcesPlanet[resources.names[i]] != null) {
						if (("" + bonusResourcesPlanet[resources.names[i]]).length > longestSpace[1]) {
							longestSpace[1] = ("" + bonusResourcesPlanet[resources.names[i]]).length;
						}
					}

					if (bonusResourcesResearch[resources.names[i]] != null) {
						if (("" + bonusResourcesResearch[resources.names[i]]).length > longestSpace[2]) {
							longestSpace[2] = ("" + bonusResourcesResearch[resources.names[i]]).length;
						}
					}
				}

				/**Create the gained resources text**/
				var normalResourcesText = "";
				var bonusResourceTextFromResearch = "";
				var bonusResourceTextFromPlanets = "";
				for (var i = 0; i < resources.names.length; i++) {
					if (gainedResources[resources.names[i]] != null) {
						var space = "";
						for (var j = 0; j < longestSpace[0] - ("" + gainedResources[resources.names[i]]).length; j++) {
							space += " "
						}
						if (gainedResources[resources.names[i]] > 0) {
							normalResourcesText += gainedResources[resources.names[i]] + space + " | " + resources[resources.names[i]] + " " + resources.names[i] + "\n";
						}
					}
					if (bonusResourcesPlanet[resources.names[i]] != null) {
						var space = "";
						for (var j = 0; j < longestSpace[1] - ("" + bonusResourcesPlanet[resources.names[i]]).length; j++) {
							space += " "
						}
						if (bonusResourcesPlanet[resources.names[i]] > 0) {
							bonusResourceTextFromPlanets += bonusResourcesPlanet[resources.names[i].toLowerCase()] + space + " | " + resources[resources.names[i]] + " " + resources.names[i] + "\n";
						}
					}

					if (bonusResourcesResearch[resources.names[i]] != null) {
						var space = "";
						for (var j = 0; j < longestSpace[2] - ("" + bonusResourcesResearch[resources.names[i]]).length; j++) {
							space += " "
						}
						if (bonusResourcesResearch[resources.names[i]] > 0) {
							bonusResourceTextFromResearch += bonusResourcesResearch[resources.names[i]] + space + " | " + resources[resources.names[i]] + " " + resources.names[i] + "\n";
						}
					}
				}

				//send the embed
				var embed = new Discord.RichEmbed()
					.setColor(embedColors.pink)
					.setTitle("Current Collection")
					.setDescription("You have waited " + (amount * 5) + " minutes so your collection is multiplied by `" + amount + "`")
					.addField("Normal Resources", normalResourcesText);
				if (bonusResourceTextFromPlanets.length) {
					embed.addField("Bonus Resources from planets", bonusResourceTextFromPlanets);
				}
				if (bonusResourceTextFromResearch.length) {
					embed.addField("Bonus Resources from researches", bonusResourceTextFromResearch);
				}
				message.channel.send(embed);
			}
		}
	},
	{
		names      : ["stats"],
		description: "Get your stats",
		usage      : "stats",
		values     : [],
		reqs       : ["profile true"],
		effect     : function (message, args, playerData, prefix) {
			var embed = new Discord.RichEmbed()
				.setTitle(message.member.displayName + "'s stats")
				.setFooter(playerData.userID)
				.setColor(embedColors.blue);
			var location = "";
			if (typeof playerData.location === "object") {
				location = "Galaxy `" + (playerData.location[0] + 1) + "` Area: `" + playerData.location[1] + "x" + playerData.location[2] + "`"
			}
			else {
				location = playerData.location;
			}
			if (playerData.faction !== null) {
				embed.addField("INFO:", "Faction:" + factions[playerData.faction].name + "\nPower: 000\nLocation:\n" + location);
			}
			else {
				embed.addField("INFO:", "Power: 000\nLocation:\n" + location);
			}

			var playerResources = "```css\n";
			var spaceLength = 1;
			for (var i = 0; i < resources.names.length; i++) {
				var len = "" + playerData[resources.names[i]];
				if (len.length > spaceLength) {
					spaceLength = len.length;
				}
			}
			for (var i = 0; i < resources.names.length; i++) {
				var space = "";
				var len = "" + playerData[resources.names[i]];
				for (var j = 0; j < spaceLength - len.length; j++) {
					space += " ";
				}
				playerResources += playerData[resources.names[i]] + space + "| " + resources[resources.names[i]] + " " + resources.names[i];
				playerResources += "\n";
			}
			playerResources += "```";
			embed.addField("Resources", playerResources);
			message.channel.send(embed);
		}
	},
	{
		names      : ["warp", "go"],
		description: "warp to somewhere",
		usage      : "warp [VALUE]",
		values     : ["{GALAXY}", "{X} {Y}", "{GALAXY} {X} {Y}"],
		reqs       : ["profile true", "warping false"],
		effect     : function (message, args, playerData, prefix) {
			if (typeof playerData.location === "object") {
				var numbers = getNumbers(message.content);
				var warpType, goToPos = playerData.location;
				switch (numbers.length) {
					default:
						warpType = "Invalid";
						break;
					case 1:
						warpType = "galaxy";
						goToPos[0] = numbers[0];
						break;
					case 2:
						warpType = "positionBase";
						goToPos[1] = numbers[0];
						goToPos[2] = numbers[1];
						break;
					case 3:
						warpType = "galaxyAndPosition";
						goToPos = numbers;
						break;
				}
				if (warpType === "Invalid") {
					sendBasicEmbed({content: "Invalid usage", color: embedColors.red, channel: message.channel})
				}
				else {
					var timeUntilFinishedWarping = 0;
					if (goToPos[1] + 1 > playerData.location[1]) {
						timeUntilFinishedWarping += goToPos[1] + 1 - playerData.location[1];
					}
					else {
						timeUntilFinishedWarping += playerData.location[1] - goToPos[1] + 1;
					}
					if (goToPos[2] + 1 > playerData.location[2]) {
						timeUntilFinishedWarping += goToPos[2] + 1 - playerData.location[2];
					}
					else {
						timeUntilFinishedWarping += playerData.location[2] - goToPos[2] + 1;
					}
					if (warpType === "galaxy") {
						timeUntilFinishedWarping = 0;
					}
					if (warpType !== "positionBase") {
						timeUntilFinishedWarping += 60 * 5;//5 mins if its a galaxy warp
					}
					timeUntilFinishedWarping = timeUntilFinishedWarping * 1000;//convert it into actual Date.now()
					if (skipWarpTime) {
						timeUntilFinishedWarping = 0;
					}
					listOfWaitTimes.push({
						player : playerData,
						expires: Date.now() + timeUntilFinishedWarping,
						headTo : goToPos,
						type   : "warp"
					});
					if (!waitTimesInterval) {
						waitTimesInterval = setInterval(checkWaitTimes, 1000);//once every second
					}
					playerData.location = "Warping to Galaxy: `" + (goToPos[0] + 1) + "` Area: `" + goToPos[1] + "x" + goToPos[2] + "`";
					sendBasicEmbed({
						content: "Warping will take approximately: " + getTimeRemaining(timeUntilFinishedWarping),
						color  : embedColors.blue,
						channel: message.channel
					})
				}
			}
			else {
				var timeLeft = null;
				for (var i = 0; i < listOfWaitTimes.length; i++) {
					if (playerData.id === listOfWaitTimes[i].player.id) {
						timeLeft = listOfWaitTimes[i].expires - Date.now();
						break;
					}
				}
				sendBasicEmbed({
					content: "You are currently warping.\nYour warp will finish in approximately " + getTimeRemaining(timeLeft),
					channel: message.channel,
					color  : embedColors.yellow
				})

			}
		}
	},
	{
		names      : ["lookAround", "look"],
		description: "See where you are currently at",
		usage      : "lookAround",
		values     : [],
		reqs       : ["profile true", "warping false"],
		effect     : function (message, args, playerData, prefix) {
			var pos = playerData.location;
			var loc = map[pos[0]][pos[1]][pos[2]];
			var station = "Unoccupied";
			var items = "**Boost to stations:**\n```\n";
			if (loc.type === "empty") {
				items = "";
			}
			else {
				for (var i = 0; i < planets["" + loc.type].bonuses.length; i++) {
					items += planets[loc.type].bonuses[i][0];
				}
				items += "```";
			}
			if (loc.ownerOfStation !== "none") {
				items = "attack `" + loc.ownerOfStation.name + "`'s staion via `" + prefix + "UnImplemented`";
				station = "occupied by `" + loc.ownerOfStation.name + "`";
			}
			var embed = new Discord.RichEmbed()
				.setColor(embedColors.blue)
				.setTitle("Location:")
				.setDescription("Galaxy: `" + pos[0] + "` Area: `" + pos[1] + "x" + pos[2] + "`")
				.addField("**Current Area is:** " + loc.type, "*__" + station + "__*\n" + items);
			message.channel.send(embed);
		}
	},
	{
		names      : ["scan", "detect"],
		description: "scan the area around you",
		usage      : "scan",
		values     : [],
		reqs       : ["profile true", "warping false"],
		effect     : function (message, args, playerData, prefix) {
			//TODO fix this
		}
	},
	{
		names      : ["research", "r"],
		description: "research something",
		usage      : "research [VALUE]",
		values     : ["List", "Info {RESEARCH_NAME}", "{RESEARCH_NAME}"],
		reqs       : ["profile true"],
		effect     : function (message, args, playerData, prefix) {
			var embed = new Discord.RichEmbed()
				.setColor(embedColors.yellow);
			var numbs = getNumbers(args, false);
			var number = null;
			if (numbs.length) {
				number = parseInt(numbs[0], 10);
				if (number >= researches.names.length) {
					embed.setColor(embedColors.red);
					embed.setDescription("Invalid ID number");

				}
			}
			else {
				for (var i = 0; i < researches.names.length; i++) {
					var name = researches.names[i].split(" ");
					var found = matchArray(newArgs, name);
					var newArgs = [];
					for (var q = 0; q < args.length; q++) {
						newArgs.push(args[q]);
					}
					if (newArgs[0] === "info") {
						newArgs.splice(0, 1);
					}
					if (found) {
						number = i;
						break;
					}
				}
				if (number === null && newArgs.length && args[0] !== "list") {
					embed.setColor(embedColors.red);
					embed.setDescription("Invalid research name");
				}
				if (!newArgs.length) {
					embed.setColor(embedColors.red);
					embed.setDescription("Invalid Usage\nNeed to include a research ID or NAME");
				}
			}
			switch (args[0]) {
				case "info":
					if (number !== null) {
						var item = researches[researches.names[number]];
						var level = playerData[researches.names[number]];
						embed.setTitle("RESEARCH INFO");
						embed.setDescription("You have `" + playerData["research"] + "` 💡 research\n" + researches.names[number] + "'s level is `" + (level + 1) + "`");
						embed.addField(researches.names[number], item.does[level] + "\nCosts: " + item.costs[level] + " 💡 research\nTime: " + getTimeRemaining(item.timesToResearch[level]))
						embed.setFooter(prefix + "research " + researches.names[number]);
					}
					break;
				case "list":
					embed.setColor(embedColors.yellow);
					embed.setTitle("ID---Name--------------------------Cost");
					var txt = "```css\n";
					for (var i = 0; i < researches.names.length; i++) {
						var item = researches[researches.names[i]];
						var level = playerData[researches.names[i]];
						txt += spacing("[" + i + "] " + researches.names[i], item.costs[level] + "\n", 40);
					}
					txt += "```";
					embed.setDescription(txt);
					embed.setFooter(prefix + "research info [NAME]/[ID]");
					break;
				default:
					if (number !== null) {
						var item = researches[researches.names[number]];
						var level = playerData[researches.names[number]];
						if (playerData["research"] >= item.costs[level]) {
							//research ITEM
						}
						else {
							sendBasicEmbed({
								content: "Not enough 💡 research.",
								color  : embedColors.red,
								channel: message.channel
							})
						}
					}
					break;
			}

			message.channel.send(embed)
		}
	},

	"STATIONS",
	{
		names      : ["stations", "station", "s"],
		description: "get info on stations",
		usage      : "station [VALUE]",
		values     : ["List", "Info {STATION_NAME}"],
		reqs       : [],
		effect     : function (message, args, playerData, prefix) {
			var embed = new Discord.RichEmbed()
				.setColor(embedColors.pink);
			if (args[0] == "" || args[0] == null) {
				args[0] = "list";
			}
			switch (args[0]) {
				case "list":
					embed.setTitle("ID------Name");
					var txt = "```css\n";
					for (var i = 0; i < stations.names.length; i++) {
						txt += "[" + (i + 1) + "] " + stations.names[i] + "\n";
					}
					embed.setDescription(txt + "```")
						.setFooter(prefix + "station info [NAME]/[ID]");
					break;
				case "info":
					var numbs = getNumbers(args, false);
					var number = null;
					if (numbs.length) {
						number = parseInt(numbs[0], 10);
						number--;
						if (number >= researches.names.length) {
							embed.setColor(embedColors.red);
							embed.setDescription("Invalid ID number");

						}
					}
					else {
						for (var i = 0; i < stations.names.length; i++) {
							var name = stations.names[i].split(" ");
							var newArgs = [];
							for (var q = 0; q < args.length; q++) {
								newArgs.push(args[q]);
							}
							if (newArgs[0] === "info") {
								newArgs.splice(0, 1);
							}
							var found = matchArray(newArgs, name, true);
							if (found) {
								number = i;
								break;
							}
						}
						if (number === null && newArgs.length && args[0] !== "list") {
							embed.setColor(embedColors.red);
							embed.setDescription("Invalid research name");
						}
						if (!newArgs.length) {
							embed.setColor(embedColors.red);
							embed.setDescription("Invalid Usage\nNeed to include a research ID or NAME");
						}
					}
					if (number === null) {
						embed.setColor(embedColors.red);
						embed.setDescription("Invalid Usage\nTry using `" + prefix + "station list`");
					}
					else {
						var item = stations[stations.names[number]];
						embed.setDescription("Info about:")
							.setTitle(stations.names[number])
							.setDescription(item.description + "\n-------------------------------------------------");
						var levels = "```css\n";
						for (var i = 0; i < item.gives.length; i++) {
							levels += "Level " + (i + 1) + " Gives: ";
							for (var j = 0; j < item.gives[i].length; j++) {
								var givesStuff = item.gives[i][j].split(" ");
								levels += givesStuff[1] + " ";
								if ((givesStuff[1] < 10 && givesStuff[1] > 0) || (givesStuff[1] < 0 && givesStuff[1] > -10)) {
									levels += " ";
								}
								levels += resources[[givesStuff[0]]] + " ";
							}
							levels += "|| Costs: ";
							for (var j = 0; j < item.costs[i].length; j++) {
								var costsStuff = item.costs[i][j].split(" ");
								levels += costsStuff[1] + " ";
								if (costsStuff[1] < 10) {
									levels += " ";
								}
								levels += resources[[costsStuff[0]]] + " ";
							}
							levels += "\n"
						}
						embed.addField("LEVELS", levels + "```");
					}
					break;
				default:
					embed.setDescription("Invalid Usage\nTry using `" + prefix + "station list`")
						.setColor(embedColors.red);
					break;
			}
			message.channel.send(embed);
		}
	},
	{
		names      : ["build"],
		description: "builds a station where you currently are at",
		usage      : "build [VALUE]",
		values     : ["{STATION_NAME}"],
		reqs       : ["profile true", "warping false"],
		effect     : function (message, args, playerData, prefix) {
			const freeStation = playerData.stations.length === 0;

			var unlocked = true;
			var selectedStation = false;
			for (var i = 0; i < stations.names.length; i++) {
				var name = stations.names[i].split(" ");
				var match = matchArray(args, name, true);
				if (match === true) {
					selectedStation = i;
					break;
				}
			}

			if (selectedStation === false) {
				sendBasicEmbed({
					content: "Invalid Usage\nTry using `" + prefix + "stations list`\nto get the correct spelling",
					color  : embedColors.red,
					channel: message.channel
				});
			}
			else {
				if (unlocked) {
					var station = stations[stations.names[selectedStation]];
					var hasEnough = true;
					var missingItems = [];
					for (var i = 0; i < station.costs[0].length; i++) {
						var costsStuff = station.costs[0][i].split(" ");
						if (playerData[costsStuff[0]] < costsStuff[1]) {
							hasEnough = false;
							missingItems.push([(costsStuff[1] - playerData[costsStuff[0]]), resources[costsStuff[0]]])
						}
					}

					if (hasEnough || freeStation) {
						playerData.stations.push({
							location: playerData.location,
							type    : stations.names[selectedStation],
							level   : 0
						});
						var lostResources = "";
						for (var i = 0; i < station.costs[0].length; i++) {
							if (freeStation) {
								break;
							}
							var costStuff = station.costs[0][i].split(" ");
							playerData[costStuff[0]] -= costStuff[1];
							lostResources += costStuff[0] + " " + resources[costStuff[0]] + " " + costStuff[1] + "\n";
						}
						var embed = new Discord.RichEmbed()
							.setDescription("Successfully bought " + stations.names[selectedStation] + "\n")
							.setColor(embedColors.pink);
						if (!freeStation) {
							embed.addField("Lost Resources", lostResources);
						}
						else {
							embed.addField("FIRST STATION", "As this is your first station\nIts completely free!");
							playerData.lastCollection = Date.now();
						}
						message.channel.send(embed);
					}
					else {
						var missingResources = "";
						for (var i = 0; i < missingItems.length; i++) {
							missingResources += missingItems[i][0] + " " + missingItems[i][1] + "\n"
						}
						var embed = new Discord.RichEmbed()
							.setColor(embedColors.red)
							.setTitle("Missing Resources")
							.setDescription(missingResources);
						message.channel.send(embed);
					}
				}
				else {
					sendBasicEmbed({
						content: "You havent unlocked this station yet.\nYou can unlock this by researching *Gravatic Purification*.",
						color  : embedColors.red,
						channel: message.channel
					});
				}
			}
		}
	},
	{
		names      : ["myStations"],
		description: "gives you the locations and level of all your stations",
		usage      : "myStations",
		values     : [],
		reqs       : ["profile true"],
		effect     : function (message, args, playerData, prefix) {
			var stations = playerData.stations;
			var txt = "```css\n";
			for (var i = 0; i < stations.length; i++) {
				txt += spacing("[" + (stations[i].level + 1) + "] " + stations[i].type, "Galaxy: " + (stations[i].location[0] + 1) + "  X: " + stations[i].location[1] + " Y: " + stations[i].location[2], 50);
				txt += "\n";
			}
			txt += "```";
			if (!stations.length) {
				txt = "You currently don't have any stations";
			}
			var embed = new Discord.RichEmbed()
				.setColor(embedColors.pink)
				.setTitle("LEVEL----NAME-----------------------LOCATION")
				.setDescription(txt);
			message.channel.send(embed);
		}
	},
	{
		names      : ["upgradeStation", "upStation", ""],
		description: "upgrade the station where you currently are at.",
		usage      : "upgradeStation",
		values     : [],
		reqs       : ["profile true", "warping false"],
		effect     : function (message, args, playerData, prefix) {
			var whichStation = null;
			var stationToUpgrade;
			for (var i = 0; i < playerData.stations.length; i++) {
				stationToUpgrade = playerData.stations[i];
				if (matchArray(stationToUpgrade.location, playerData.location, false)) {
					whichStation = i;
					break;
				}
			}
			var hasEnough = true;
			var missingItems = [];

			if (whichStation == null) {
				sendBasicEmbed({
					content: "Something went wrong.\n**Either:**\n1. You do not own the station here\n2. A station doesn't exist here",
					color  : embedColors.red,
					channel: message.channel
				})
			}
			else {
				var level = stationToUpgrade.level + 1;
				var station = stations[playerData.stations[whichStation].type];

				if (station.costs.length >= level) {
					if (station.extra.upgradeTo) {
						level = 0;
						station = stations[stations[playerData.stations[whichStation].type].extra.upgradeTo];
					}
					else {
						sendBasicEmbed({
							content: "You've maxed this upgrade",
							color  : embedColors.pink,
							channel: message.channel
						});
						return;
					}
				}
				for (var i = 0; i < station.costs[level].length; i++) {
					var costsStuff = station.costs[level][i].split(" ");
					if (playerData[costsStuff[0]] < costsStuff[1]) {
						hasEnough = false;
						missingItems.push([(costsStuff[1] - playerData[costsStuff[0]]), resources[costsStuff[0]]]);
					}
				}
				if (hasEnough) {
					stationToUpgrade.level++;
					var lostResources = "";
					for (var i = 0; i < station.costs[level].length; i++) {
						var costStuff = station.costs[level][i].split(" ");
						playerData[costStuff[0]] -= costStuff[1];
						lostResources += costStuff[0] + " " + resources[costStuff[0]] + " " + costStuff[1] + "\n";
					}
					var embed = new Discord.RichEmbed()
						.setDescription("Successfully upgraded " + stationToUpgrade.type + "\n")
						.setColor(embedColors.pink)
						.addField("Lost Resources", lostResources);
					message.channel.send(embed);
					playerData.stations[whichStation].type = station.name;
					playerData.stations[whichStation].level = 0;
				}
				else {
					var missingResources = "";
					for (var i = 0; i < missingItems.length; i++) {
						missingResources += missingItems[i][0] + " " + missingItems[i][1] + "\n"
					}
					var embed = new Discord.RichEmbed()
						.setColor(embedColors.red)
						.setTitle("Missing Resources")
						.setDescription(missingResources);
					message.channel.send(embed);
				}
			}
		}
	},

	"FACTIONS",
	{
		names      : ["factionCreate", "fCreate", "createFaction"],
		description: "create your faction",
		usage      : "factioncreate [VALUE] ",
		values     : ["{NAME}"],
		reqs       : ["profile true", "faction false"],
		effect     : function (message, args, playerData, prefix) {

			var embed = new Discord.RichEmbed()
				.setColor(embedColors.darkblue);
			if (playerData["credits"] >= 500) {
				if (args[0] != null) {
					var txt = "";
					for (var i = 0; i < args.length; i++) {
						txt += args[i];
						if (i + 1 !== args.length) {
							txt += " ";
						}
					}
					if (txt.length < 30) {
						var canCreate = true;
						for (var i = 0; i < factions.length; i++) {
							if (factions[i] === txt) {
								canCreate = false;
								break;
							}
						}
						if (canCreate) {
							embed.setTitle(txt);
							embed.setDescription("You have successfully created the faction `" + txt + "`\n-500 " + resources["credits"] + " credits");
							playerData.faction = txt.toLowerCase();
							factions.names.push({lowerCaseName: txt.toLowerCase(), regularName: txt});
							var newFactionData = new createFaction();
							newFactionData.creator = message.author.id;
							newFactionData.name = txt;
							factions[txt.toLowerCase()] = newFactionData;
							playerData["credits"] -= 500;
						}
						else {
							embed.setColor(embedColors.red);
							embed.setDescription("The name `" + txt + "` has already been taken");
						}
					}
					else {
						embed.setColor(embedColors.red);
						embed.setDescription("That name is too long.\nKeep your faction name under 30 characters")
					}
				}
				else {
					embed.setDescription("You have to name your faction");
					embed.setColor(embedColors.red);
				}
			}
			else {
				embed.setColor(embedColors.red);
				embed.setDescription("You are missing\n" + (500 - playerData["credits"]) + " " + resources["credits"] + " credits");
			}
			message.channel.send(embed);
		}
	},
	{
		names      : ["factionJoin", "fJoin", "joinFaction"],
		description: "join faction",
		usage      : "factioncreate [VALUE] ",
		values     : ["{FACTION_NAME}"],
		reqs       : ["profile true", "faction false"],
		effect     : function (message, args, playerData, prefix) {
			var txt = "";
			for (var i = 0; i < args.length; i++) {
				txt += args[i];
				if (i + 1 !== args.length) {
					txt += " ";
				}
			}
			var faction = null;
			for (var i = 0; i < factions.names; i++) {
				if (factions.names[i].lowerCaseName === txt.toLowerCase()) {
					faction = factions[factions.names[i].lowerCaseName];
					break;
				}
			}
			if (faction) {
				if (faction.members.length < faction.maxMembers) {
					faction.members.push(message.author.id);
					playerData.faction = faction.name.toLowerCase();
					sendBasicEmbed({
						content: "You joined " + faction.name + "!",
						channel: message.channel,
						color  : faction.color
					})
				}
				else {
					sendBasicEmbed({
						content: "That faction is full!",
						channel: message.channel,
						color  : embedColors.red
					})
				}
			}
			else {
				sendBasicEmbed({
					content: "Unknown Faction\nEither```css\n1. That faction doesn't exist\n2. You misspelled the faction's name",
					channel: message.channel,
					color  : embedColors.red
				})
			}
		}
	},
	{
		names      : ["factionDonate", "fDonate"],
		description: "donate resources to your faction",
		usage      : "factionDonate [VALUE]",
		values     : ["{RESOURCES_NAME} {AMOUNT}"],
		reqs       : ["profile true", "faction true"],
		effect     : function (message, args, playerData, prefix) {
			var validResource = false;
			for (var i = 0; i < resources.names.length; i++) {
				if (args[0] === resources.names[i].toLowerCase()) {
					validResource = true;
					break;
				}
			}
			if (validResource) {
				var numbers = getNumbers(args[1], false);
				if (numbers.length) {
					factions[playerData.faction][args[0]] += parseInt(numbers[0], 10);
					playerData[args[0]] -= parseInt(numbers[0], 10);
					sendBasicEmbed({
						content: "Thank you for donating `" + numbers[0] + "` " + args[0] + " to your faction.",
						color  : embedColors.darkblue,
						channel: message.channel
					});
				}
				else {
					sendBasicEmbed({
						content: "You need to include how much you want to donate.",
						color  : embedColors.red,
						channel: message.channel
					});
				}
			}
			else {
				sendBasicEmbed({
					content: "That is not a valid resource.",
					color  : embedColors.red,
					channel: message.channel
				});
			}

		}
	},
	{
		names      : ["factionStats", "fStats"],
		description: "Gives you the list of everything the faction has",
		usage      : "factionStats",
		values     : [],
		reqs       : ["profile true", "faction true"],
		effect     : function (message, args, playerData, prefix) {

			var faction = factions[playerData.faction];
			var embed = new Discord.RichEmbed()
				.setTitle(playerData.faction + "'s stats")
				.setFooter(playerData.userID)
				.setColor(faction.color);
			var factionsResources = "css\n";

			var spaceLength = 1;
			for (var i = 0; i < resources.names.length; i++) {
				var len = "" + faction[resources.names[i]];
				if (len.length > spaceLength) {
					spaceLength = len.length;
				}
			}
			for (var i = 0; i < resources.names.length; i++) {
				var space = "";
				var len = "" + faction[resources.names[i]];
				for (var j = 0; j < spaceLength - len.length; j++) {
					space += " ";
				}
				factionsResources += faction[resources.names[i]] + space + "| " + resources[resources.names[i]] + " " + resources.names[i];
				factionsResources += "\n";
			}
			factionsResources += "```";

			embed.addField("Info", "Level:" + faction.level + "\nImage: " + faction.canUseDescription + "\nDescription: " + faction.canUseDescription + "Color: " + faction.color + "\nEmoji: " + faction.emoji, true);
			embed.addField("Resources", factionsResources, true);
			message.channel.send(embed);
		}
	},
	{
		names      : ["factionUpgrade", "fUpgrade", "upgradeFaction", "uFaction", "upgradeF"],
		description: "Upgrade your faction",
		usage      : "factionUpgrade",
		values     : [],
		reqs       : ["profile true", "faction true", "factionMod", "upgradableFaction"],
		effect     : function (message, args, playerData, prefix) {
			var faction = factions[playerData.faction];
			var stuff = factions.costs[faction.level].split(" ");
			faction.level++;
			var embed = new Discord.RichEmbed()
				.setColor(faction.color)
				.setTitle("Upgrade to Level **" + (faction.level + 1) + "**");
			var gains = "Members: +5\nMods: +1\n";
			switch (faction.level) {
				case 1:
					gains += "Faction Description.";
					embed.setFooter("You can now set your faction's description");
					faction.canUseDescription = true;
					break;
				case 2:
					gains += "Neater Ad";
					embed.setFooter("Your faction's Ad is now neater");
					faction.niceAdLevel = 1;
					break;
				case 3:
					gains += "Embeded Message\nCustom faction's color";
					embed.setFooter("Your faction's Ad is now in an embed message and you can change the color for the embed");
					faction.niceAdLevel = 2;
					faction.canUseColor = true;
					break;
				case 4:
					gains += "Faction Image";
					embed.setFooter("You can now upload an image to your faction's ad");
					faction.canUseImage = true;
					break;
			}
			embed.addField("Unlocked:", gains + "\n\n-" + (stuff[1] + " " + resources[stuff[0]] + " " + stuff[0]));
			faction.maxMembers += 5;
			faction.maxMods++;
			message.channel.send(embed);
		}
	},
	{
		names      : ["factionDescription", "fDescription"],
		description: "change your faction's description",
		usage      : "factionDescription [VALUE]",
		values     : ["{TEXT}"],
		reqs       : ["profile true", "faction true", "factionMod"],
		effect     : function (message, args, playerData, prefix) {
			var txt = "";
			for (var i = 0; i < args.length; i++) {
				txt += args[i];
				if (i + 1 !== args.length) {
					txt += " ";
				}
			}
			if (txt.length < 500) {
				factions[playerData.faction].description = txt;
				sendBasicEmbed({
					content: "Your faction's description has been updated.",
					color  : factions[playerData.faction].color,
					channel: message.channel
				})
			}
			else {
				sendBasicEmbed({
					content: "Your factions Description cannot exceed 500 characters",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["factionImage", "fimage"],
		description: "Set's you faction's image to the image you uploaded.",
		usage      : "factionImage",
		values     : [],
		reqs       : ["profile true", "faction true", "factionMod", "factionImage"],
		effect     : function (message, args, playerData, prefix) {
			if (message.attachments.first()) {
				var image = message.attachments.first();
				var fileType = "";
				for (var i = image.url.length - 3; i < image.url.length; i++) {
					fileType += image.url[i].toLowerCase();
				}
				if (fileType === "png" || fileType === "jpg" || fileType === "tif") {
					factions[playerData.faction].image = image.url;
					var embed = new Discord.RichEmbed()
						.setThumbnail(image.url)
						.setTitle("Setting `" + factions[playerData.faction].name + "`'s image")
						.setColor(factions[playerData.faction].color)
						.setDescription("Your faction's image has been updated.");
					message.channel.send(embed);
				}
				else {
					sendBasicEmbed({
						content: "Only `.png`, `.jpg` and `.tif` files are allowed",
						channel: message.channel,
						color  : embedColors.red
					})
				}
			}
			else {
				sendBasicEmbed({
					content: "You need to upload an image.",
					channel: message.channel,
					color  : embedColors.red
				})
			}
			message.delete();
		}
	},
	{
		names      : ["promote"],
		description: "promote somebody",
		usage      : "promote [VALUE]",
		values     : ["{@NAME}", "{USER_ID}"],
		reqs       : ["profile true", "faction false", "factionOwner"],
		effect     : function (message, args, playerData, prefix) {
			var ID = "";
			if (args[0][0] === "<") {
				for (var i = 3; i < args[0].length - 1; i++) {
					ID += args[0][i];
				}
			}
			else {
				ID = args[0];
			}
			var faction = factions[playerData.faction];
			var member = null;
			var mod = false;
			for (var i = 0; i < faction.members.length; i++) {
				if (ID === faction.members[i]) {
					member = i;
					break;
				}
			}
			for (var i = 0; i < faction.mods.length; i++) {
				if (ID === faction.mods[i]) {
					member = i;
					mod = true;
					break;
				}
			}
			if (member === null) {
				sendBasicEmbed({
					content: "Something went wrong. Either\n```css\n1. Invalid ID\n2. That member isn't in your faction```",
					channel: message.channel,
					color  : embedColors.red
				})
			}
			else {
				if (mod) {
					if (faction.aboutToBecomeOwner.length) {
						sendBasicEmbed({
							content: "<@!" + ID + "> is now owner of " + faction.name + "\n<@!" + message.author.id + "> is now a mod",
							channel: message.channel,
							color  : faction.color
						});
						faction.mods.splice(member, 1);
						faction.mods.push(message.author.id);
						faction.creator = ID;
					}
					else {
						sendBasicEmbed({
							content: "Are you sure you want <@!" + ID + "> to be the owner of this faction?\nif you do please send ```fix\n" + prefix + "promote <@!" + ID + ">```",
							channel: message.channel,
							color  : embedColors.red
						})
					}
				}
				else {
					sendBasicEmbed({
						content: "You promoted <@!" + ID + "> to `Mod`",
						channel: message.channel,
						color  : faction.color
					});
					faction.mods.push(ID);
				}
			}
		}
	},
	{
		names      : ["demote"],
		description: "demote somebody",
		usage      : "demote [VALUE]",
		values     : ["{@NAME}", "{USER_ID}"],
		reqs       : ["profile true", "faction false", "factionOwner"],
		effect     : function (message, args, playerData, prefix) {
			var ID = "";
			if (args[0][0] === "<") {
				for (var i = 3; i < args[0].length - 1; i++) {
					ID += args[0][i];
				}
			}
			else {
				ID = args[0];
			}
			var faction = factions[playerData.faction];
			var member = null;
			for (var i = 0; i < faction.mods.length; i++) {
				if (ID === faction.mods[i]) {
					member = i;
					mod = true;
					break;
				}
			}
			if (member === null) {
				sendBasicEmbed({
					content: "Something went wrong. Either\n```css\n1. Invalid ID\n2. That member isn't in your faction\n3. The user can't be demoted```",
					channel: message.channel,
					color  : embedColors.red
				})
			}
			else {
				if (mod) {
					sendBasicEmbed({
						content: "You demoted <@!" + ID + "> to `Member`",
						channel: message.channel,
						color  : faction.color
					});
					faction.mods.splice(member, 1);
					faction.members.push(ID);
				}
			}
		}
	},
	{
		names      : ["kick"],
		description: "kick somebody out of your faction",
		usage      : "kick [VALUE]",
		values     : ["{@NAME}", "{USER_ID}"],
		reqs       : ["profile true", "faction false", "factionMod"],
		effect     : function (message, args, playerData, prefix) {
			var ID = "";
			if (args[0][0] === "<") {
				for (var i = 3; i < args[0].length - 1; i++) {
					ID += args[0][i];
				}
			}
			else {
				ID = args[0];
			}
			var faction = factions[playerData.faction];
			var member = null;
			var mod = false;
			for (var i = 0; i < faction.members.length; i++) {
				if (ID === faction.members[i]) {
					member = i;
					break;
				}
			}
			for (var i = 0; i < faction.mods.length; i++) {
				if (ID === faction.mods[i]) {
					member = i;
					mod = true;
					break;
				}
			}
			if (ID === message.author.id) {
				sendBasicEmbed({
					content: "You can't kick yourself.\nIf you want to leave send\n`" + prefix + "factionLeave`",
					channel: message.channel,
					color  : embedColors.red
				})
			}
			else {
				if (ID === faction.creator) {
					sendBasicEmbed({
						content: "You can't kick the owner of the faction.",
						channel: message.channel,
						color  : embedColors.red
					})
				}
				else {
					if (member === null) {
						sendBasicEmbed({
							content: "Something went wrong. Either\n```css\n1. Invalid ID\n2. That member isn't in your faction```",
							channel: message.channel,
							color  : embedColors.red
						})
					}
					else {
						if (mod) {
							if (message.author.id === faction.creator) {
								sendBasicEmbed({
									content: "Kicked <@!" + ID + "> from the faction.",
									channel: message.channel,
									color  : faction.color
								});
								faction.mods.splice(member, 1);
							}
							else {
								sendBasicEmbed({
									content: "Only <@!" + faction.creator + "> can kick Mods.",
									channel: message.channel,
									color  : embedColors.red
								})
							}
						}
						else {
							sendBasicEmbed({
								content: "Kicked <@!" + ID + "> from the faction.",
								channel: message.channel,
								color  : faction.color
							});
							faction.members.splice(member, 1);
						}
					}
				}
			}
		}
	},
	{
		names      : ["factionDisband", "fDisband", "disbandFaction"],
		description: "disband your faction",
		usage      : "factionDisband",
		values     : [],
		reqs       : ["profile true", "faction", "factionOwner"],
		effect     : function (message, args, playerData, prefix) {
			var embed = new Discord.RichEmbed()
				.setColor(embedColors.red)
				.setDescription("Disbanding your faction is irreversible.\nIf you *really* want to disband your faction please do\n`" + prefix + "factionDisband " + factions[playerData.faction].name + "`");
			var txt = "";
			for (var i = 0; i < args.length; i++) {
				txt += args[0].toLowerCase();
			}
			if (!txt.length) {
				embed.setTitle("WARNING");
			}
			else {
				embed.setDescription("Faction was disbanded");
				factions.splice(playerData.faction, 1);
			}
			message.channel.send(embed)
		}
	},
	{
		names      : ["factionLeave", "fLeave", "leaveFaction"],
		description: "leave your current faction",
		usage      : "factionLeave",
		values     : [],
		reqs       : ["profile true", "faction"],
		effect     : function (message, args, playerData, prefix) {
			var txt = "";
			for (var i = 0; i < args.length; i++) {
				txt += args[0].toLowerCase();
				if (i + 1 !== args.length) {
					txt += " ";
				}
			}
			if (factions[playerData.faction].creator !== message.author.id) {
				if (txt === playerData.faction.toLowerCase()) {
					var faction = factions[playerData.faction];
					sendBasicEmbed({
						content: "You have left your faction.",
						color  : embedColors.red,
						channel: message.channel
					});
					for (var i = 0; i < faction.members.length; i++) {
						if (faction.members[i] === message.author.id) {
							faction.members.splice(i, 1);
							break;
						}
					}
					for (var i = 0; i < faction.mods.length; i++) {
						if (faction.mods[i] === message.author.id) {
							faction.mods.splice(i, 1);
							break;
						}
					}
					playerData.faction = null;
				}
				else {
					sendBasicEmbed({
						content: "Leaving your faction is irreversible\nIf you *really* want to leave your faction please send\n`" + prefix + "factionLeave " + faction.name + "`",
						color  : embedColors.red,
						channel: message.channel
					})
				}
			}
			else {
				sendBasicEmbed({
					content: "You are the owner of this faction\nYou cannot leave! But you can do\n```css\n" + prefix + "factionDisband        Delete your faction\n" + prefix + "promote     promote somebody to a mod/owner```",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},

	"MOD",
	{
		names      : ["changePrefix", "prefixChange"],
		description: "change your server's prefix",
		usage      : "changePrefix [VALUE]",
		values     : ["{NEW_PREFIX}"],
		reqs       : ["channel text", "userPerms ADMINISTRATOR"],
		effect     : function (message, args, playerData, prefix) {
			if (args[0]) {
				if (args[0].length > 3) {
					sendBasicEmbed({
						content: "Prefix must be 3 or less characters long.",
						color  : embedColors.red,
						channel: message.channel
					})
				}
				else {
					for (var i = 0; i < prefixes.length; i++) {
						if (prefixes[i].serverID === message.guild.id) {
							prefixes[i].prefix = args[0];
							break;
						}
					}
					sendBasicEmbed({
						content: "Changed server's prefix to `" + args[0] + "`.",
						color  : embedColors.purple,
						channel: message.channel
					})
				}
			}
			else {
				sendBasicEmbed({
					content: "Prefix cannot be removed",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["clear", "purge", "prune"],
		description: "Clear a channel",
		usage      : "clear [VALUE]",
		values     : ["All", "{NUMBER}"],
		reqs       : ["channel text", "userPerms MANAGE_MESSAGES"],
		effect     : function (message, args, playerData, prefix) {
			var theNumbersInput = getNumbers(message.content, true);
			if (args[0] === "all") {
				channelClear(message.channel);
			}
			else if (theNumbersInput[0] < 100) {
				message.delete().then(function () {
					channelClear(message.channel, theNumbersInput[0]);
				})
			}
			else {
				sendBasicEmbed({
					content: "Invalid usage!\nYou need to have the amount of messages to clear.",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["exit"],
		description: "Turns off the bot",
		usage      : "exit",
		values     : [],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			process.exit();
		}
	},
	{
		names      : ["changeVersion", "versionChange", "changeV", "vChange"],
		description: "change the version",
		usage      : "version {VALUE}",
		values     : ["{VERSION}"],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			if (args[0]) {
				var other = require("./other.json");
				other.version = args[0];
				version = other.version;
				sendBasicEmbed({
					content: "Version is now `" + version + "`",
					color  : embedColors.purple,
					channel: message.channel
				});
			}
			else {
				sendBasicEmbed({
					content: "Version cannot be blank",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["give"],
		description: "gives items to the player or yourself",
		usage      : "give [VALUE]",
		values     : ["{ITEM} {AMOUNT}", "{PLAYER} {ITEM} {AMOUNT}"],
		reqs       : ["profile true", "owner"],
		effect     : function (message, args, playerData, prefix) {
			if (args.length === 2) {
				playerData[args[0]] += parseInt(args[1], 10);
				sendBasicEmbed({
					content: "You gave yourself " + args[1] + " " + resources[args[0]] + " " + args[0],
					channel: message.channel,
					color  : embedColors.purple
				})
			}
			else {
				var id = "";
				for (var i = 3; i < args[0].length - 1; i++) {
					id += args[0][i];
				}
				var data = findPlayerData(id);
				data[args[1]] += parseInt(args[2], 10);
				sendBasicEmbed({
					content: "You gave " + args[0] + " " + args[2] + " " + resources[args[1]] + " " + args[1],
					channel: message.channel,
					color  : embedColors.purple
				})
			}

		}
	},
	{
		names      : ["test"],
		description: "test",
		usage      : "test",
		values     : [],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			var planets = {};
			var txt = "";
			var m = map[playerData.location[0]];
			for (var i = 0; i < m.length; i++) {
				for (var j = 0; j < m.length; j++) {
					if (playerData.location[2] - 5 < j && playerData.location[2] + 5 > j && playerData.location[1] - 5 < i && playerData.location[1] + 5 > i) {
						console.log(m[i][j]);
						if (m[i][j].type !== "empty") {
							txt += "⚪";
						}
						else {
							txt += "◾";
						}
					}
					else {
						txt += "◾";
					}
				}
				txt += "\n"
			}
			sendBasicEmbed({
				content: "```\n" + txt + "```",
				color  : embedColors.purple,
				channel: message.channel
			})
		}
	}
];
exports.commands = commands;
exports.reqChecks=reqChecks;