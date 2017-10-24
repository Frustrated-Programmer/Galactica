/**for testing purposes**/
let skipWarpTime = false;
let skipCollectTime = false;

/**Set Up **/
let version = require("./other.json").version;
let Jimp = require("jimp");
const universalPrefix = "-";
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

/**VARIABLES**/
let attacks = require("./other.json").attacks;
let attackTimeInterval = false;
let accountData = require("./accounts.json").players;
let waitTimesInterval = false;
let factions = require("./factions.json").factions;
let listOfWaitTimes = require("./other.json").listOfWaitTimes;
let map = require("./other.json").map;
console.log(require("./other.json"));

/**FUNCTIONS**/
function checkNearbyArea(want) {
	/**want = playerData**/
}
function attackPlayerFunction() {
	/**
	 @attacks is an array full of
	 {
	 attackersMid       : message.id,
	 defendersMid       : message.id,
	 attacker           : author.id,
	 defender           : author.id,
	 attackerChoice     : null || {}
	 defenderChoice     : null || {}
	 round              : 0,
	 timeStarted        : Date.now(),
	 timeSinceLastAttack: 0
	 }
	 */

	let emojis = ["🛡", "📡", "☄", "🏃"];
	for (let i = 0; i < attacks.length; i++) {
		let attack = attacks[i];
		let x = 0;


		if (attack.attackerChoice != null) {
			x += 2
		}
		if (attack.defenderChoice != null) {
			x++;
		}

		if (attack.timeSinceLastAttack + 20000 <= Date.now() || x === 3) {
			console.log(attack.timeSinceLastAttack + 20000 + "<=" + Date.now() + "||" + x);
			attack.timeSinceLastAttack = Date.now();
			/****
			 * 1 = shield
			 * 2 = lasers
			 * 3 = torpedoes
			 * 4 = escape
			 */
			let aChoice = 0;
			switch (attack.attackerChoice) {
				case "🛡":
					aChoice = 1;
					break;
				case "📡":
					aChoice = 2;
					break;
				case "☄":
					aChoice = 3;
					break;
				case "🏃":
					aChoice = 4;
					break;
			}
			let dChoice = 0;
			switch (attack.defenderChoice) {
				case "🛡":
					dChoice = 1;
					break;
				case "📡":
					dChoice = 2;
					break;
				case "☄":
					dChoice = 3;
					break;
				case "🏃":
					dChoice = 4;
					break;
			}

			if ((aChoice === 4 || aChoice === 0) && (dChoice === 4 || dChoice === 0)) {
				let embed = new Discord.RichEmbed()
					.setColor(embedColors.darkRed)
					.setDescription("You and your opponent both chose to end the battle.\nBattle ended.");
				client.users.get(attack.attacker).send({embed});
				client.users.get(attack.defender).send({embed});
				accountData[attack.attacker].attacking = false;
				accountData[attack.defender].attacking = false;
				attacks.splice(i, 1);
				saveJsonFile("./other.json");
				return;
			}
			else {
				let damage = Math.round(Math.random() * 8) + 2;
				let defLaserPer = (accountData[attack.defender]["Compressed Laser Generators"] * 5) / 100;
				let attLaserPer = (accountData[attack.attacker]["Compressed Laser Generators"] * 5) / 100;
				let aChoiceTxt = "";
				let dChoiceTxt = "";

				let winner = null;

				switch (aChoice) {
					case 0:
						winner = "defender";
					case 1:
						switch (dChoice) {
							case 0:
								winner = "attacker";
								break;
							case 1:
								winner = "tie";
								break;
							case 2:
								winner = "attacker";
								break;
							case 3:
								winner = "defender";
								break;
						}
						break;
					case 2:
						switch (dChoice) {
							case 0:
								winner = "attacker";
								break;
							case 1:
								winner = "defender";
								break;
							case 2:
								winner = "tie";
								break;
							case 3:
								winner = "attacker";
								break;
						}
						break;
					case 3:
						switch (dChoice) {
							case 0:
								winner = "attacker";
								break;
							case 1:
								winner = "attacker";
								break;
							case 2:
								winner = "defender";
								break;
							case 3:
								winner = "tie";
								break;
						}
						break;
				}
				switch (dChoice) {
					case 0:
						dChoiceTxt = "do nothing.";
						break;
					case 1:
						dChoiceTxt = "use the `🛡 Shield`";
						break;
					case 2:
						dChoiceTxt = "shoot the `📡 Lasers`";
						break;
					case 3:
						dChoiceTxt = "fire some `☄ Photon Torpedoes`";
						break;
				}
				switch (aChoice) {
					case 0:
						aChoiceTxt = "do nothing.";
						break;
					case 1:
						aChoiceTxt = "use the `🛡 Shield`";
						break;
					case 2:
						aChoiceTxt = "shoot the `📡 Lasers`";
						break;
					case 3:
						aChoiceTxt = "fire some `☄ Photon Torpedoes`";
						break;
				}
				let embed1 = new Discord.RichEmbed()
					.setTitle("The war between " + accountData[attack.attacker].username + " and " + accountData[attack.defender].username)
					.addField("Choices", "You chose to " + aChoiceTxt + "\nYour opponent chose to " + dChoiceTxt)
					.setFooter("Next round in \"5\" seconds");
				let embed2 = new Discord.RichEmbed()
					.setTitle("The war between " + accountData[attack.attacker].username + " and " + accountData[attack.defender].username)
					.addField("Choices", "You chose to " + dChoiceTxt + "\nYour opponent chose to " + aChoiceTxt)
					.setFooter("Next round in \"5\" seconds");
				switch (winner) {
					case "tie":
						embed1.addField("Outcome", "You tied with your opponent on round `" + (attack.round + 1) + "`");
						embed2.addField("Outcome", "You tied with your opponent on round `" + (attack.round + 1) + "`");
						embed1.setColor(embedColors.darkRed);
						embed2.setColor(embedColors.darkRed);
						break;
					case "attacker":
						damage += Math.round(attLaserPer * damage);
						accountData[attack.defender].health -= damage;
						if (accountData[attack.defender].health < 0) {
							accountData[attack.defender].health = 0;
						}
						embed1.addField("Outcome", "You won round `" + (attack.round + 1) + "`\nYou dealt " + damage + " HP");
						embed2.addField("Outcome", "You lost round `" + (attack.round + 1) + "`\nYou lost " + damage + " HP");
						embed1.setColor(embedColors.green);
						embed2.setColor(embedColors.red);
						break;
					case "defender":
						damage += defLaserPer * damage;
						accountData[attack.attacker].health -= damage;
						if (accountData[attack.attacker].health < 0) {
							accountData[attack.attacker].health = 0;
						}
						embed1.addField("Outcome", "You lost round `" + (attack.round + 1) + "`\nYou lost " + damage + " HP");
						embed2.addField("Outcome", "You won round `" + (attack.round + 1) + "`\nYou dealt " + damage + " HP");
						embed1.setColor(embedColors.red);
						embed2.setColor(embedColors.green);
						break;
				}

				embed1.addField("Health", "Your Health: `" + accountData[attack.attacker].health + "`\nOpponents Health: `" + accountData[attack.defender].health + "`");
				embed2.addField("Health", "Your Health: `" + accountData[attack.defender].health + "`\nOpponents Health: `" + accountData[attack.attacker].health + "`");
				client.users.get(attack.attacker).send({embed: embed1});
				client.users.get(attack.defender).send({embed: embed2});
			}


			let m1 = null;
			let emojis = ["🛡", "📡", "☄", "🏃"];
			let reactFun = function (message, num) {
				message.react(emojis[num]).then(function () {
					if (emojis[num + 1]) {
						reactFun(message, num + 1);
					}
				});
			};

			let doFun = function (m) {
				if (m1 != null) {
					attack.defendersMid = m1;
					attack.attackersMid = m.id;
					attack.attackerChoice = null;
					attack.defenderChoice = null;
					attack.round++;

					saveJsonFile("./other.json");
				}
				else {
					console.log("ran again");
					setTimeout(function () {
						doFun(m);
					}, 500);
				}
			};
			setTimeout(function () {

				let embed = new Discord.RichEmbed()
					.setTitle("YOU ARE UNDER ATTACK BY `" + accountData[attack.attacker].username + "`")
					.setColor(embedColors.darkRed)
					.setDescription("Please choose either \n:shield: SHIELD (loses to :comet:) (beats :satellite:)\n:satellite: LASER (loses to :shield:) (beats :comet:)\n:comet: PHOTON TORPEDO (beats :shield:) (loses to :satellite:)\n:runner: ESCAPE (40% chance of success)\nYou have `20` seconds or until both sides chooses")
					.setFooter("This an RPS strategy. ");
				client.users.get(attack.defender).send({embed}).then(function (m) {
					reactFun(m, 0);
					m1 = m.id;
				});
				embed = new Discord.RichEmbed()
					.setTitle("YOU ARE ATTACKING `" + accountData[attack.defender].username + "`")
					.setColor(embedColors.darkRed)
					.setDescription("Please choose either \n:shield: SHIELD (loses to :comet:) (beats :satellite:)\n:satellite: LASER (loses to :shield:) (beats :comet:)\n:comet: PHOTON TORPEDO (beats :shield:) (loses to :satellite:)\n:runner: ESCAPE (40% chance of success)\nYou have `20` seconds or until both sides chooses")
					.setFooter("This is an RPS strategy");
				client.users.get(attack.attacker).send({embed}).then(function (m) {
					reactFun(m, 0);
					doFun(m);
				});
			}, 5000);
		}
		else {
			console.log(attack.timeSinceLastAttack + 20000 - Date.now());
		}
	}
}
function getBorders(location) {
	let bordering = [];
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
	for (let i = 0; i < listOfWaitTimes.length; i++) {
		if (listOfWaitTimes[i].expires < Date.now()) {
			console.log("finished");

			switch (listOfWaitTimes[i].type) {
				case "warp":
					let pla = accountData[listOfWaitTimes[i].player];
					pla.location = listOfWaitTimes[i].headTo;
					client.fetchUser(listOfWaitTimes[i].player).then(function (user) {
						sendBasicEmbed({
							content: "Your warp to:\nGalaxy: `" + (listOfWaitTimes[i].headTo[0] + 1) + "` Area: `" + listOfWaitTimes[i].headTo[1] + "x" + listOfWaitTimes[i].headTo[2] + "`\nhas finished.",
							channel: user,
							color  : embedColors.blue
						});
					});
					break;
				case "colonization":
					if (accountData[listOfWaitTimes[i].player].didntMove) {
						accountData[listOfWaitTimes[i].player].colonies.push({
							location: accountData[listOfWaitTimes[i].player].location,
							type    : map[listOfWaitTimes[i].at[0]][listOfWaitTimes[i].at[1]][listOfWaitTimes[i].at[2]].type
						});
						client.fetchUser(listOfWaitTimes[i].player).then(function (user) {
							sendBasicEmbed({
								content: "Your colonization at\nGalaxy: `" + (listOfWaitTimes[i].at[0] + 1) + "` Area: `" + listOfWaitTimes[i].at[1] + "x" + listOfWaitTimes[i].at[2] + "\nhas finished!",
								channel: user,
								color  : embedColors.blue
							});
						});
					}
					else {
						client.fetchUser(listOfWaitTimes[i].player).then(function (user) {
							sendBasicEmbed({
								content: "Your colonization at\nGalaxy: `" + (listOfWaitTimes[i].at[0] + 1) + "` Area: `" + listOfWaitTimes[i].at[1] + "x" + listOfWaitTimes[i].at[2] + "\nhas failed.\n**Reason:** You moved away.",
								channel: user,
								color  : embedColors.red
							});
						});
					}
					break;
				case "attackColony":
					let player = accountData[listOfWaitTimes[i].player];
					let colony = listOfWaitTimes[i].at;
					if (player.didntMove) {
						if (player.attacking) {
							player.colonies.push({
								people  : 0,
								type    : map[colony[0]][colony[1]][colony[2]].type,
								location: colony
							})
						}
						else {
							sendBasicEmbed({
								content: "Attack at the colony\nGalaxy: `" + colony[0] + "` Area: `" + colony[1] + "x" + colony[2] + "`\nHas failed.\n**Reason:** You were/are under attack.",
								color  : embedColors.red,
								channel: client.users.get(player.userID)
							})
						}
					}
					else {
						sendBasicEmbed({
							content: "Attack at the colony\nGalaxy: `" + colony[0] + "` Area: `" + colony[1] + "x" + colony[2] + "`\nHas failed.\n**Reason:** You moved from your spot.",
							color  : embedColors.red,
							channel: client.users.get(player.userID)
						})
					}
					break;
				case "research":
					accountData[listOfWaitTimes[i].player][listOfWaitTimes[i].which]++;
					sendBasicEmbed({
						content: "Your research `" + listOfWaitTimes[i].which + "` has finished.",
						color  : embedColors.yellow,
						channel: client.users.get(listOfWaitTimes[i].player)
					});
					break;


			}
			saveJsonFile("./accounts.json");
			saveJsonFile("./factions.json");
			saveJsonFile("./other.json");
			listOfWaitTimes.splice(i, 1)
		}
	}
	if (!listOfWaitTimes.length) {
		clearInterval(waitTimesInterval);
		waitTimesInterval = false;
	}

}
function createMap(galaxys, xSize, ySize) {
	throw "map ran";
	console.log("map change");
	let planets = [
		{
			name  : "empty",
			chance: 10
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
			name  : "Haven",
			chance: 1
		}
	];
	let chance = 0;
	for (let p = 0; p < planets.length; p++) {
		chance += planets[p].chance;//puts together the entire "chance" of all planets
	}
	let map = [];
	for (let g = 0; g < galaxys; g++) {
		let galaxy = [];
		for (let y = 0; y < ySize; y++) {
			let yMap = [];
			for (let x = 0; x < xSize; x++) {
				let whichPlanet = Math.round(Math.random() * chance);
				let planet = undefined;
				let amountRightNow = 0;
				for (let p = 0; p < planets.length; p++) {
					amountRightNow += planets[p].chance;
					if (whichPlanet <= amountRightNow) {
						planet = p;
						break;
					}
				}
				if (planet === undefined) {
					planet = 0;
				}
				yMap.push({
					type    : planets[planet].name,
					ownersID: null
				});
			}
			galaxy.push(yMap);
		}
		map.push(galaxy);
	}

	return map;
}
function sendBasicEmbed(args) {
	if (args.channel != null && args.color != null && args.content != null) {
		let embed = new Discord.RichEmbed()
			.setColor(args.color)
			.setDescription(args.content);
		args.channel.send({embed});
	}
	else {
		console.log("EMBED MUST HAVE `CONTENT` `COLOR` and `CHANNEL` AND ALL ARGS WAS:\n" + args);
	}
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
	let numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	let whichWordAreWeAt = 0;
	let wordsWithNumbers = [];
	let foundNumber = false;
	for (let i = 0; i < text.length; i++) {
		let currentTextIsNumber = false;
		for (let j = 0; j < numbers.length; j++) {
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
	let times = [[86400000, 0, "day"], [3600000, 0, "hour"], [60000, 0, "minute"], [1000, 0, "second"], [1, 0, "millisecond"]];
	let timeLeftText = "";
	let fakeTime = time;
	for (let i = 0; i < times.length; i++) {
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
	let permsCheck = {
		channelPerms: false,//is channel overriding?
		serverPerms : false//is overall server role overriding
	};

	let user;//which user shall we check on
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
	let newText = text;
	let len = max - text.length - text2.length;
	for (let i = 0; i < len; i++) {
		newText += " ";
	}
	newText += text2;
	return newText;
}
function matchArray(arr1, arr2, text) {
	let match = true;
	text = text || false;
	if (text) {
		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i].toLowerCase() !== arr2[i].toLowerCase()) {
				match = false;
			}
		}
	}
	else {
		for (let i = 0; i < arr1.length; i++) {
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
	for (let i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) > 127) {
			return false;
		}
	}
	return true;
}
function checkGP(station, level, playerData) {
	let GP = playerData["Gravitic Purification"];
	let unlocks = {
		"Refining Station"             : 0,
		"Mining Station"               : 0,
		"Agriculture Station"          : 0,
		"Metalloid Accelerator"        : 1,
		"Research Station"             : 2,
		"Military Station"             : 3,
		"Magnetic Smelter"             : 4,
		"Electronic Propulsion Station": 5
	};
	let levels = {
		"Refining Station"             : [[2, 1], [3, 2], [4, 3], [5, 4]],
		"Mining Station"               : [[2, 1], [3, 2], [4, 3], [5, 4]],
		"Agriculture Station"          : [[2, 2], [3, 3], [4, 4], [5, 5]],
		"Research Station"             : [[2, 3], [3, 4]],
		"Military Smelter"             : [[2, 4], [3, 5]],
		"Magnetic Smelter"             : [[2, 5], [3, 6], [4, 7], [5, 8]],
		"Electronic Propulsion Station": [[2, 6], [3, 7], [4, 8]]
	};
	if (level === 0) {
		if (unlocks[station] !== null) {
			return {
				val: GP >= unlocks[station],
				msg: "You haven't unlocked this station.\nResearch *Gravatic Purification* to unlock this station."
			}
		}
	}
	else {
		if (levels[station]) {
			let stat = levels[station][level];
			if (stat) {
				return {
					val: GP >= stat[1],
					msg: "You haven't unlocked this upgrade.\nResearch *Gravatic Purification* to unlock this station."
				}
			}
			else {
				return {val: false, msg: "You have maxed out this station."}
			}
		}
	}
	return {val: false, msg: "ERROR please report this immediately\n`" + station + "mustbeanactualstation`"}
}
function log(msg) {
	console.log(msg);
}
function saveJsonFile(file) {
	fs.writeFileSync(file, JSON.stringify(require(file), null, 4));//the (null, 4) "cleans" up the json file
}
function runCommand(command, message, args, playerData, prefix) {
	for (let i = 0; i < command.reqs.length; i++) {
		let typeReq = command.reqs[i].split(" ")[0];
		let reqArgs = command.reqs[i].split(" ");
		reqArgs.shift();
		let reqCheck = reqChecks[typeReq](reqArgs, message, args, playerData, prefix);

		if (!reqCheck.val) {
			if (reqCheck.msg) {
				if (reqCheck.author) {
					sendBasicEmbed({
						content: reqCheck.msg,
						color  : embedColors.red,
						channel: message.author
					});
					return;

				}
				else {
					sendBasicEmbed({
						content: reqCheck.msg,
						color  : embedColors.red,
						channel: message.channel
					});
					return;
				}
			}
		}

	}

//	playerData.messagesXp += Math.round(15 + (Math.random() * 10));
	command.effect(message, args, playerData, prefix);
	return;
}


/**CONSTANTS**/
const embedColors = require("./items").colors;
const createFaction = require("./faction.js");
const planets = require("./items.js").planets;
const resources = require("./items.js").resources;
const stations = require("./items.js").stations;
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
		if (message.author.id === "244590122811523082") {
			return {val: true, msg: ""};
		}
		return {val: false, msg: "You must be an owner of the bot."}
	},
	"modChannel"       : function (reqArgs, message, args, playerData, prefix) {
		if (message.channel.type === "text") {
			for (let i = 0; i < serverStuff.names.length; i++) {
				if (serverStuff[serverStuff.names[i]].serverID === message.channel.guild.id) {
					if (serverStuff[serverStuff.names[i]].modChannel != null) {
						return {
							val: client.channels.get(serverStuff[serverStuff.names[i]].modChannel) != null,
							msg: "You must have a mod channel."
						}
					}
					return {val: false, msg: "You must have a mod channel."}
				}
			}
			return {val: false, msg: "You must have a mod channel."}
		}
		else {
			return {val: false, msg: "You must be in a text channel."}
		}
	},
	"warping"          : function (reqArgs, message, args, playerData, prefix) {
		let x = "false";
		if (typeof playerData.location === "string") {
			x = "true";
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
			return {val: playerData != null, msg: "You need to create a profile. use `" + prefix + "join`"};
		}
		else {
			return {val: playerData == null, msg: "You already have a profile."};
		}
	},
	"attacking"        : function (reqArgs, message, args, playerData, prefix) {
		if (reqArgs[0] === "false") {
			return {val: playerData.attacking === false, msg: "You cannot be attacking"}
		}
		else {
			return {val: playerData.attacking === true, msg: "You need be attacking"}
		}
	},
	"faction"          : function (reqArgs, message, args, playerData, prefix) {
		if (playerData !== null) {
			if (playerData.faction) {
				if (reqArgs[0] === "true") {
					return {val: playerData.faction !== null, msg: "You need to be in a faction."};
				}
				else {
					return {val: playerData.faction === null, msg: "You can't be in a faction"};
				}
			}
		}
		return {val: false, msg: ""}
	},
	"factionMod"       : function (reqArgs, message, args, playerData, prefix) {
		if (playerData !== null) {
			let fac = factions[playerData.faction];
			if (fac) {
				for (let i = 0; i < fac.members.length; i++) {
					if (fac.members[i].id === message.author.id) {
						let mod = false;
						if (fac.members[i].rank === "creator" || fac.members[i].rank === "mod") {
							mod = true;
						}
						return {val: mod, msg: "You need to be a mod or owner of your faction"};
					}
				}
			}
		}
		return {val: false, msg: ""}
	},
	"factionOwner"     : function (reqArgs, message, args, playerData, prefix) {
		if (playerData !== null) {
			let fac = factions[playerData.faction];
			if (fac) {
				for (let i = 0; i < fac.members.length; i++) {
					if (fac.members[i].id === message.author.id) {
						return {val: fac.members[i].rank === "creator", msg: "You need to be a owner of your faction"};
					}
				}
			}
		}
		return {val: false, msg: ""}
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
		if (playerData !== null) {
			let faction = factions[playerData.faction];
			if (faction) {
				if (faction.level + 1 !== factions.costs.length) {
					let missing = "";
					let stuff = factions.costs[faction.level].split(" ");
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
			}
			return {val: false, msg: "You need to join a faction"}
		}
		return {val: false, msg: ""}
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
	},
	"normCommand"      : function (reqArgs, message, args, playerData, prefix) {
		if (message.channel.type === "text") {
			function checkSize(obj) {
				let size = 0, key;
				for (key in obj) {
					if (obj.hasOwnProperty(key)) size++;
				}
				return size;
			}

			if (checkSize(serverStuff[message.channel.guild.id].allowedChannels) > 0) {
				if (serverStuff[message.channel.guild.id].allowedChannels[message.channel.id] == null) {
					return {val: false, msg: "Commands not allowed in that channel", author: true}
				}
			}
			return {val: true, msg: ""}
		}
		return {val: true, msg: ""}
	}
};
const serverStuff = require("./other.json").serverStuff;
const updateAccount = require("./account.js");
const commands = [
	"HELP",
	{
		names      : ["help"],
		description: "get a list of all the commands you can do",
		usage      : "help",
		values     : [],
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			let txt = "```css\n";
			for (let i = 0; i < commands.length; i++) {
				if (typeof commands[i] === "object") {
					let sendIt = true;
					for (let q = 0; q < commands[i].reqs.length; q++) {
						let typeReq = commands[i].reqs[q].split(" ")[0];
						let reqArgs = commands[i].reqs[q].split(" ");
						reqArgs.shift();
						let reqCheck = reqChecks[typeReq](reqArgs, message, args, playerData, prefix);
						if (!reqCheck.val) {
							sendIt = false;
						}
					}
					if (sendIt) {
						txt += commands[i].names[0] + "\n";
					}
				}
			}
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.blue)
				.setTitle("HELP")
				.setDescription("For more info\n" + prefix + "command [NAME]")
				.addField("COMMANDS", txt + "```")
				.addField("JOIN US", "[INVITE-BOT](https://discordapp.com/oauth2/authorize?client_id=354670433154498560&scope=bot&permissions=67234830)\n[JOIN-OUR-DISCORD](https://discord.gg/U67PyRG)");
			message.channel.send({embed});
		}
	},
	{
		names      : ["commands", "command", "coms", "com"],
		description: "get a list of all the commands",
		usage      : "commands [VALUE]",
		values     : ["List", "{COMMAND_NAME}"],
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			if (args[0] == "" || args[0] == null) {
				args[0] = "list";
			}
			switch (args[0]) {
				case "list":
					let commandsList = "```markdown\n";
					for (let i = 0; i < commands.length; i++) {
						if (typeof commands[i] === "object") {
							commandsList += commands[i].names[0] + "\n"
						}
						else {
							commandsList += "#" + commands[i] + "\n";
						}
					}
					commandsList += "```";
					let embed = new Discord.RichEmbed()
						.setColor(embedColors.blue)
						.setTitle("COMMAND'S LIST")
						.setDescription(commandsList)
						.setFooter(prefix + "command [NAME]");
					message.author.send({embed});
					sendBasicEmbed({
						content:"Command sent to your DMs",
						channel:message.channel,
						color:embedColors.blue
					})
					break;
				default:
					let commandIs = null;
					for (let i = 0; i < commands.length; i++) {
						if (typeof commands[i] === "object") {
							for (let j = 0; j < commands[i].names.length; j++) {
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
						let aliases = "";
						let command = commands[commandIs];
						for (let i = 0; i < command.names.length; i++) {
							aliases += "`" + command.names[i] + "` ";
						}
						let embed = new Discord.RichEmbed()
							.setColor(embedColors.blue)
							.setTitle("INFO ABOUT \"**`" + prefix + command.names[0] + "`**\"")
							.setDescription(command.description)
							.addField("Aliases", aliases)
							.addField("Usage", "`" + prefix + command.usage + "`", true);
						if (command.values.length) {
							let vals = "";
							for (let i = 0; i < command.values.length; i++) {
								vals += "`" + command.values[i] + "` ";
								if (i + 1 !== command.values.length) {
									vals += "|| "
								}
							}
							embed.addField("`[VALUE]` can be used as:", vals, true);
						}
						message.channel.send({embed});
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
		reqs       : ["normCommand"],
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
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			let storedTimeForPingCommand = Date.now();
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.purple)
				.setDescription("Response Time: `Loading...`");
			message.channel.send({embed}).then(function () {
				embed.setDescription("Response time: `" + (Date.now() - storedTimeForPingCommand) + "` ms");

				let msgID = message.channel.lastMessageID
				let msg = message.channel.fetchMessage(msgID).then(function (m) {
					m.edit({embed});
				});
			})
		}
	},
	{
		names      : ["join"],
		description: "join the game",
		usage      : "join",
		values     : [],
		reqs       : ["normCommand", "profile false"],
		effect     : function (message, args, playerData, prefix) {
			let newPlayerData = new updateAccount();
			newPlayerData.userID = message.author.id;
			newPlayerData.username = message.author.username;
			accountData.names.push(newPlayerData.userID);
			accountData[message.author.id] = newPlayerData;
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
		reqs       : ["normCommand", "profile true", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let canContinue = true;
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
				let amount = Math.round((Date.now() - playerData.lastCollection) / (60000 * 5));//multiplied amount 5 minutes is normal(1) and 10 is doubled(2) (ETC)
				if (skipCollectTime) {
					amount = 10;
				}
				playerData.lastCollection = Date.now();
				let gainedResources = {};//amount of resources gained
				let bonusResourcesPlanet = {};//amount of bonus resources gained from planets
				let bonusResourcesResearch = {};//amount of bonus resources gained from research
				for (let i = 0; i < resources.names.length; i++) {
					gainedResources[resources.names[i]] = 0;
					bonusResourcesPlanet[resources.names[i]] = 0;
					bonusResourcesResearch[resources.names[i]] = 0;
				}
				for (let i = 0; i < playerData.stations.length; i++) {
					let station = stations[playerData.stations[i].type];

					let planetBonus = 0;
					let borders = getBorders(playerData.stations[i].location);
					for (let bor = 0; bor < borders.length; bor++) {
						let planet = planets[borders[bor]];
						for (let bons = 0; bons < planet.bonuses.length; bons++) {
							if (planet.bonuses[bons][0].toLowerCase() === station.name.toLowerCase()) {
								planetBonus = parseInt(planet.bonuses[bons][1], 10);
								break;
							}
						}
						if (planetBonus !== 0) {
							break;
						}
					}
					for (let j = 0; j < station.gives[playerData.stations[i].level].length; j++) {
						let stuff = station.gives[playerData.stations[i].level][j].split(" ");
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
				let longestSpace = [0, 0, 0];
				for (let i = 0; i < resources.names.length; i++) {
					if (gainedResources[resources.names[i]] != null) {
						if (("" + gainedResources[resources.names[i]]).length > longestSpace[0]) {
							longestSpace[0] = ("" + gainedResources[resources.names[i]]).length;
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
				let normalResourcesText = "";
				let bonusResourceTextFromResearch = "";
				let bonusResourceTextFromPlanets = "";
				for (let i = 0; i < resources.names.length; i++) {
					if (gainedResources[resources.names[i]] != null) {
						let space = "";
						for (let j = 0; j < longestSpace[0] - ("" + gainedResources[resources.names[i]]).length; j++) {
							space += " "
						}
						if (gainedResources[resources.names[i]] > 0) {
							normalResourcesText += gainedResources[resources.names[i]] + space + " | " + resources[resources.names[i]] + " " + resources.names[i] + "\n";
						}
					}
					if (bonusResourcesPlanet[resources.names[i]] != null) {
						let space = "";
						for (let j = 0; j < longestSpace[1] - ("" + bonusResourcesPlanet[resources.names[i]]).length; j++) {
							space += " "
						}
						if (bonusResourcesPlanet[resources.names[i]] > 0) {
							bonusResourceTextFromPlanets += bonusResourcesPlanet[resources.names[i].toLowerCase()] + space + " | " + resources[resources.names[i]] + " " + resources.names[i] + "\n";
						}
					}

					if (bonusResourcesResearch[resources.names[i]] != null) {
						let space = "";
						for (let j = 0; j < longestSpace[2] - ("" + bonusResourcesResearch[resources.names[i]]).length; j++) {
							space += " "
						}
						if (bonusResourcesResearch[resources.names[i]] > 0) {
							bonusResourceTextFromResearch += bonusResourcesResearch[resources.names[i]] + space + " | " + resources[resources.names[i]] + " " + resources.names[i] + "\n";
						}
					}
				}

				//send the embed
				let embed = new Discord.RichEmbed()
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
				message.channel.send({embed});
			}
		}
	},
	{
		names      : ["stats"],
		description: "Get your stats",
		usage      : "stats",
		values     : [],
		reqs       : ["normCommand", "profile true"],
		effect     : function (message, args, playerData, prefix) {
			let embed = new Discord.RichEmbed()
				.setTitle(message.member.displayName + "'s stats")
				.setFooter(playerData.userID)
				.setColor(embedColors.blue);
			let location = "";
			if (typeof playerData.location === "object") {
				location = "Galaxy `" + (playerData.location[0] + 1) + "` Area: `" + playerData.location[1] + "x" + playerData.location[2] + "`"
			}
			else {
				location = playerData.location;
			}
			if (playerData.faction !== null) {
				embed.addField("INFO:", "Faction:" + factions[playerData.faction].name + "\nPower: 000\nHealth:" + playerData.health + "\n**Location:**\n" + location);
			}
			else {
				embed.addField("INFO:", "Power: 000\nLocation:\n" + location);
			}

			let playerResources = "```css\n";
			let spaceLength = 1;
			for (let i = 0; i < resources.names.length; i++) {
				let len = "" + playerData[resources.names[i]];
				if (len.length > spaceLength) {
					spaceLength = len.length;
				}
			}
			for (let i = 0; i < resources.names.length; i++) {
				let space = "";
				let len = "" + playerData[resources.names[i]];
				for (let j = 0; j < spaceLength - len.length; j++) {
					space += " ";
				}
				playerResources += playerData[resources.names[i]] + space + "| " + resources[resources.names[i]] + " " + resources.names[i];
				playerResources += "\n";
			}
			playerResources += "```";
			embed.addField("Resources", playerResources);
			message.channel.send({embed});
		}
	},
	{
		names      : ["warp", "go"],
		description: "warp to somewhere",
		usage      : "warp [VALUE]",
		values     : ["{GALAXY}", "{X} {Y}", "{GALAXY} {X} {Y}"],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			if (typeof playerData.location === "object") {
				let numbers = getNumbers(message.content);
				let warpType, goToPos = playerData.location;
				switch (numbers.length) {
					default:
						warpType = "Invalid";
						break;
					case 1:
						warpType = "galaxy";
						goToPos[0] = parseInt(numbers[0], 10);
						break;
					case 2:
						warpType = "positionBase";
						goToPos[1] = parseInt(numbers[0], 10);
						goToPos[2] = parseInt(numbers[1], 10);
						break;
					case 3:
						warpType = "galaxyAndPosition";
						goToPos[0] = parseInt(numbers[0], 10);
						goToPos[1] = parseInt(numbers[1], 10);
						goToPos[2] = parseInt(numbers[2], 10);
						break;
				}
				if (warpType === "Invalid") {
					sendBasicEmbed({content: "Invalid usage", color: embedColors.red, channel: message.channel})
				}
				else {
					playerData.didntMove = false;
					let timeUntilFinishedWarping = 0;
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
						//
						// timeUntilFinishedWarping = 0;
					}
					listOfWaitTimes.push({
						player : playerData.userID,
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
					if (skipWarpTime) {
						playerData.location = goToPos;
					}
				}
			}
			else {
				let timeLeft = null;
				for (let i = 0; i < listOfWaitTimes.length; i++) {
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
		reqs       : ["normCommand", "profile true", "warping false"],
		effect     : function (message, args, playerData, prefix) {
			let pos = playerData.location;
			let loc = map[pos[0]][pos[1]][pos[2]];
			let station = "Unoccupied";
			let items = "**Boost to stations:**\n```\n";
			if (loc.type === "empty") {
				items = "";
			}
			else {
				if (loc.ownersID !== null) {
					console.log(loc);
					station = "Occupied by " + accountData[loc.ownersID].username + ".";
					items = "";
				}
				else {
					for (let i = 0; i < planets["" + loc.type].bonuses.length; i++) {
						items += planets[loc.type].bonuses[i][0];
					}
				}
				items += "```";
			}
			if (loc.ownersID !== "none") {
				items = "attack `" + accountData[loc.ownersID].name + "`'s staion via `" + prefix + "UnImplemented`";
				station = "occupied by `" + accountData[loc.ownersID].name + "`";
			}
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.blue)
				.setTitle("Location:")
				.setDescription("Galaxy: `" + pos[0] + "` Area: `" + pos[1] + "x" + pos[2] + "`")
				.addField("**Current Area is:** " + loc.type, "*__" + station + "__*\n" + items);
			let otherPlayers = [];
			for (let i = 0; i < accountData.names.length; i++) {
				let player = accountData[accountData.names[i]];
				if (matchArray(playerData.location, player.location, false)) {
					otherPlayers.push(player);
				}
			}
			if (otherPlayers.length) {
				let txt = "NAME---|FACTION|HP|---ID\n```css\n";
				for (let i = 0; i < otherPlayers.length; i++) {
					let name = "";
					if (isValidText(otherPlayers[i].username)) {
						name = otherPlayers[i].username;
					}
					else {
						for (let j = 0; j < otherPlayers[i].username.length; j++) {
							if (otherPlayers[i].username.charCodeAt(j) > 127) {
								name += "*";
							}
							else {
								name += otherPlayers[i].username[j];
							}
						}
					}
					if (name.length > 10) {
						name = name.substring(0, 7);
						name += "...";
					}
					let spaceName = "";
					for (let j = 0; j < 10 - name.length; j++) {
						spaceName += " ";
					}
					let spaceFaction = "";
					if (otherPlayers[i].faction !== null) {
						for (let j = 0; j < 10 - otherPlayers[i].faction.length; j++) {
							spaceFaction += " ";
						}
						spaceFaction += otherPlayers.faction + "|"
					}
					else {
						spaceFaction = "None Yet  |";
					}

					txt += name + spaceName + "|" + spaceFaction + otherPlayers[i].health + "|" + otherPlayers[i].userID + "|\n";
				}
				txt += "```";
				embed.setFooter("-attack [PLAYER_ID]");
				embed.addField("Players", txt);
			}
			message.channel.send({embed});
		}
	},
	{
		names      : ["scan", "detect"],
		description: "scan the area around you",
		usage      : "scan",
		values     : [],
		reqs       : ["normCommand", "profile true", "warping false"],
		effect     : function (message, args, playerData, prefix) {
			let mainSize = require("./other.json").imageSize;
			let go = null;

			function doFun(num) {
				console.log("waiting for " + num + " seconds");
				fs.exists("images/mapImage" + playerData.userID + ".png", function (exists) {
					go = exists;
				});
				if (go) {
					message.channel.stopTyping(true);
					let emb = new Discord.RichEmbed()
						.setColor(embedColors.blue)
						.setDescription("Scanned")
						.attachFile("./images/mapImage" + playerData.userID + ".png")
						.setImage("attachment://mapImage" + playerData.userID + ".png");
					message.channel.send({embed: emb}).then(function () {
						fs.unlink("images/mapImage" + playerData.userID + ".png");
						if (mess != null) {
							mess.delete();
						}
					});
				}
				else {
					setTimeout(function () {
						doFun(num + 1)
					}, 1000);
				}
			};
			setTimeout(function () {
				doFun(1);
			}, 1000);
			message.channel.startTyping();
			let loc = playerData.location;
			let m = map[loc[0]];
			let size = mainSize / m.length;

			let mess = null;
			message.channel.send("```fix\nLoading...\nPlease give the bot some time```").then(function (m) {
				mess = m;
			});
			let done = [];
			let setImage = function (y, x, which, newimage) {
				Jimp.read(which, function (err, image) {
					if (err) throw err;
					image.resize(size, size);
					newimage.composite(image, x * size, y * size);
					done[x][y] = true;
				});
			};
			let image = new Jimp(mainSize, mainSize, function (err, newimage) {
				let canShowFunc = function (loc) {
					let theMap = map[playerData.location[0]];
					let y = loc[1];
					let x = loc[2];
					let found = false;

					if(y!=theMap.length){
						if(matchArray([playerData.location[0],y+1,x],playerData.location,false)){
							found = true;
						}

						if(x!=theMap[y+1].length){
							if(matchArray([playerData.location[0],y+1,x],playerData.location,false)){
								found = true;
							}
						}
					}
				};
					for (let i = 0; i < m.length; i++) {
						done.push([]);
						for (let j = 0; j < m[i].length; j++) {
							done[i].push(false);
							let canShow = true;
							console.log(i, j);
							if (i === loc[1] && j === loc[2]) {
								console.log("ran");
								setImage(i, j, "images/Other/You.png", newimage);
							}
							else {
								let setSomething = false;

								if(canShow) {
									if (m[i][j].type !== "empty") {
										if (m[i][j].ownersID !== null) {
											if (m[i][j].ownersID === playerData.userID) {
												let r = m[i][j].type;
												setImage(i, j, "images/Stations/You/" + r + ".png", newimage);
												setSomething = true;
											}
											else if (playerData.faction !== null && canShow) {
												let fac = factions[playerData.faction];
												if (fac) {
													let found = false;
													for (let f = 0; f < fac.members.length; f++) {
														if (m[i][j].ownersID === fac.members[i]) {
															found = true;
															break;
														}
													}
													let r = m[i][j].type;
													if (found) {
														setImage(i, j, "images/Stations/Faction/" + r + ".png", newimage);
													}
													else {
														setImage(i, j, "images/Stations/Enemy/" + r + ".png", newimage);
													}

													setSomething = true;
												}
											}
											else if (canShow) {
												let r = m[i][j].type;
												setImage(i, j, "images/Stations/Enemy/" + r + ".png", newimage);
												setSomething = true;
											}
										}
										else {
											setImage(i, j, "images/Planets/" + m[i][j].type + "Planet" + ".png", newimage);
										}
									}
									else {
										setImage(i, j, "images/Other/EmptySpace.png", newimage);
									}
								}else {
									setImage(i, j, "images/Other/Unknown.png", newimage);
								}

							}
						}
					}
					done[loc[1]][loc[2]] = false;
					for (let i = 0; i < accountData.names.length; i++) {
						let loc2 = accountData[accountData.names[i]].location;
						if (loc2[0] === playerData.location[0] && accountData[accountData.names[i]].userID !== playerData.userID) {
							setImage(loc2[1], loc2[2], "images/Other/Player.png", newimage);
						}
					}
					function doFun() {
						let finished = true;
						for (let i = 0; i < done.length; i++) {
							for (let j = 0; j < done[i].length; j++) {
								if (done[i][j] === false) {
									finished = false;
									break;
								}
							}
						}
						if (finished) {
							newimage.write("images/mapImage" + playerData.userID + ".png");
						}
						else {
							setTimeout(function () {
								doFun();
							}, 1000)
						}
					}

					setTimeout(function () {
						doFun();
					}, 1000);
				}
			);
		}
	},
	{
		names      : ["research", "r"],
		description: "research something",
		usage      : "research [VALUE]",
		values     : ["List", "Info {RESEARCH_NAME}", "{RESEARCH_NAME}"],
		reqs       : ["normCommand", "profile true"],
		effect     : function (message, args, playerData, prefix) {
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.yellow);
			let numbs = getNumbers(args, false);
			let number = null;
			if (numbs.length) {
				number = parseInt(numbs[0], 10);
				if (number >= researches.names.length) {
					embed.setColor(embedColors.red);
					embed.setDescription("Invalid ID number");

				}
			}
			else {
				for (let i = 0; i < researches.names.length; i++) {
					let name = researches.names[i].split(" ");
					let found = matchArray(newArgs, name);
					let newArgs = [];
					for (let q = 0; q < args.length; q++) {
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
						let item = researches[researches.names[number]];
						let level = playerData[researches.names[number]];
						embed.setTitle("RESEARCH INFO");
						embed.setDescription("You have `" + playerData["research"] + "` 💡 research\n" + researches.names[number] + "'s level is `" + (level + 1) + "`");
						embed.addField(researches.names[number], item.does[level] + "\nCosts: " + item.costs[level] + " 💡 research\nTime: " + getTimeRemaining(item.timesToResearch[level]))
						embed.setFooter(prefix + "research " + researches.names[number]);
					}
					break;
				case "list":
					embed.setColor(embedColors.yellow);
					embed.setTitle("ID---Name--------------------------Cost");
					let txt = "```css\n";
					for (let i = 0; i < researches.names.length; i++) {
						let item = researches[researches.names[i]];
						let level = playerData[researches.names[i]];
						txt += spacing("[" + i + "] " + researches.names[i], item.costs[level] + "\n", 40);
					}
					txt += "```";
					embed.setDescription(txt);
					embed.setFooter(prefix + "research info [NAME]/[ID]");
					break;
				default:
					if (number !== null) {
						let item = researches[researches.names[number]];
						let level = playerData[researches.names[number]];
						if (playerData["research"] >= item.costs[level]) {
							playerData["research"] -= item.costs[level];
							listOfWaitTimes.push({
								expires: item.timesToResearch[level],
								type   : "research",
								player : playerData.userID,
								which  : researches.names[number]
							});
							sendBasicEmbed({
								color  : embedColors.yellow,
								channel: message.channel,
								content: "Researching `" + researches.names[number] + "`...\nWill take about " + getTimeRemaining(item.timesToResearch) + "\nCosts: " + item.costs[level] + "💡 Research"
							})
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

			message.channel.send({embed})
		}
	},
	{
		names      : ["attackPlayer", "pAttack", "attackP"],
		description: "attack the player",
		usage      : "attackPlayer [VALUE]",
		values     : ["@player", "PLAYER_ID", "STATION_NAME", "PLANET_NAME"],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {

			let numbers = getNumbers(args[0], false);
			let defender = null;
			if (numbers.length) {
				if (accountData[numbers[0]]) {
					defender = accountData[numbers[0]];
				}
				else {
					sendBasicEmbed({
						content: "Invalid player id.",
						color  : embedColors.red,
						channel: message.channel
					});
				}
			}
			else {
				sendBasicEmbed({
					content: "Invalid player id.",
					color  : embedColors.red,
					channel: message.channel
				});
			}
			if (defender) {
				if (matchArray(playerData.location, defender.location, false)) {
					if (message.channel.type === "text") {
						sendBasicEmbed({
							content: "Attacking has started...\nPlease check your DMs",
							color  : embedColors.darkRed,
							channel: message.channel
						});
					}
					playerData.attacking = true;
					defender.attacking = true;
					let embed = new Discord.RichEmbed()
						.setTitle("WARNING YOU ARE UNDER ATTACK")
						.setColor(embedColors.darkRed)
						.setDescription("You are under attack from `" + playerData.username + "`'s fleet\nYou have 10 seconds to prepare yourself.");
					client.fetchUser(defender.userID).then(function (user) {
						user.send({embed});
					});
					embed = new Discord.RichEmbed()
						.setTitle("WARNING YOU ARE ATTACKING")
						.setColor(embedColors.darkRed)
						.setDescription("You are attacking `" + defender.username + "`'s fleet\nYou have 10 seconds to prepare yourself.");
					client.fetchUser(playerData.userID).then(function (user) {
						user.send({embed});
					});


					setTimeout(function () {
						if (attackTimeInterval === false) {
							attackTimeInterval = setInterval(attackPlayerFunction, 1000);
						}
						let m1 = null;
						let emojis = ["🛡", "📡", "☄", "🏃"];
						let reactFun = function (message, num) {
							message.react(emojis[num]).then(function () {
								if (emojis[num + 1]) {
									reactFun(message, num + 1);
								}
							});
						};
						let embed = new Discord.RichEmbed()
							.setTitle("WARNING YOU ARE UNDER ATTACK BY `" + playerData.username + "`")
							.setColor(embedColors.darkRed)
							.setDescription("Please choose either \n:shield: SHIELD (loses to :comet:) (beats :satellite:)\n:satellite: LASER (loses to :shield:) (beats :comet:)\n:comet: PHOTON TORPEDO (beats :shield:) (loses to :satellite:)\n:runner: ESCAPE (40% chance of success)\nYou have `20` seconds or until both sides chooses")
							.setFooter("This an RPS strategy. ");
						client.users.get(defender.userID).send({embed}).then(function (m) {
							reactFun(m, 0);
							m1 = m.id;
						});
						embed = new Discord.RichEmbed()
							.setTitle("WARNING YOU ARE ATTACKING `" + defender.username + "`")
							.setColor(embedColors.darkRed)
							.setDescription("Please choose either \n:shield: SHIELD (loses to :comet:) (beats :satellite:)\n:satellite: LASER (loses to :shield:) (beats :comet:)\n:comet: PHOTON TORPEDO (beats :shield:) (loses to :satellite:)\n:runner: ESCAPE (40% chance of success)\nYou have `20` seconds or until both sides chooses")
							.setFooter("This is an RPS strategy");
						client.users.get(playerData.userID).send({embed}).then(function (m) {
							reactFun(m, 0);

							let doFun = function () {
								if (m1 != null) {
									require("./other.json").attacks.push({
										attackersMid       : m.id,
										defendersMid       : m1,
										attacker           : playerData.userID,
										defender           : defender.userID,
										attackerChoice     : null,
										defenderChoice     : null,
										round              : 0,
										timeStarted        : Date.now(),
										timeSinceLastAttack: Date.now()
									});
									saveJsonFile("./other.json");
								}
								else {
									setTimeout(function () {
										doFun();
									}, 500);
								}
							};
							doFun();
//372082226021793792||372082226021793792
						});
					}, 10000);
				}
				else {
					sendBasicEmbed({
						content: "You arent in the same location as him/her",
						color  : embedColors.red,
						channel: message.channel
					})
				}
			}
			else {
				sendBasicEmbed({
					content: "Invalid player id.",
					color  : embedColors.red,
					channel: message.channel
				});
			}
		}
	},

	"PLANETS",
	{
		names      : ["colonize", "colo"],
		description: "colonize a planet",
		usage      : "colonize",
		values     : [],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let isValid = false;
			let mapSpot = map[loc[0]][loc[1]][loc[2]];
			for (let i = 0; i < planets.names.length; i++) {
				if (mapSpot.type.toLowerCase() === planets.names[i].toLowerCase()) {
					isValid = true;
				}
			}
			if (isValid) {
				if (mapSpot.ownersID === null) {
					listOfWaitTimes.push({
						player : playerData.userID,
						expires: Date.now() + 20000,
						headTo : null,
						type   : "colonization",
						at     : playerData.location
					});
					let loc = playerData.location;
					if (!waitTimesInterval) {
						waitTimesInterval = setInterval(checkWaitTimes, 1000);//once every second
					}
					sendBasicEmbed({
						content: "You are colonizing a `" + mapSpot.type + "` planet.\nThis will take `20` seconds to complete.",
						color  : embedColors.blue,
						channel: message.channel
					});
				}
				else {
					sendBasicEmbed({
						content: "This planet is already colonized by `" + accountData[mapSpot.ownersID].username + "`",
						color  : embedColors.red,
						channel: message.channel
					});
				}
			}
			else {
				sendBasicEmbed({
					content: "You are not on a planet.",
					color  : embedColors.red,
					channel: message.channel
				});
			}
		}
	},
	{
		names      : ["myColonies", "myColonys", "myC"],
		description: "Gives you a list of all your colonies",
		usage      : "myColonies",
		values     : [],
		reqs       : ["normCommand", "profile true"],
		effect     : function (message, args, playerData, prefix) {
			let colonies = playerData.colonies;
			let txt = "```css\n";
			for (let i = 0; i < colonies.length; i++) {
				txt += spacing(colonies[i].type, "Galaxy: " + (colonies[i].location[0] + 1) + "  Area: " + colonies[i].location[1] + "x" + colonies[i].location[2], 50);
				txt += "\n";
			}
			txt += "```";
			if (!colonies.length) {
				txt = "You currently don't have any colonies";
			}
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.pink)
				.setTitle("NAME-----------------------LOCATION")
				.setDescription(txt);
			message.channel.send({embed});
		}
	},
	{
		names      : ["attackColony", "cAttack", "attackC"],
		description: "attack the colony on the planet.",
		usage      : "attackColony",
		values     : [],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let isValid = false;
			let mapSpot = map[loc[0]][loc[1]][loc[2]];
			for (let i = 0; i < planets.names.length; i++) {
				if (mapSpot.type.toLowerCase() === planets.names[i].toLowerCase()) {
					isValid = true;
				}
			}
			if (isValid) {
				playerData.didntMove = true;
				if (mapSpot.ownersID !== null) {
					playerData.didntMove = true;
					listOfWaitTimes.push({
						player : playerData.userID,
						expires: Date.now() + 120000,
						type   : "attackColony",
						at     : playerData.location
					});
					let loc = playerData.location;
					if (!waitTimesInterval) {
						waitTimesInterval = setInterval(checkWaitTimes, 1000);//once every second
					}
					sendBasicEmbed({
						content: "You are attacking `" + accountData[mapSpot.ownersID].username + "`'s colony.\nThis will take `2` minutes to complete.",
						color  : embedColors.blue,
						channel: message.channel
					});
					client.fetchUser(mapSpot.ownersID).then(function (user) {
						sendBasicEmbed({
							content: "Your colony at\nGalaxy `" + loc[0] + "` Area: `" + loc[1] + "x" + loc[2] + "`\nIs under attack by `" + playerData.username + "`\nYou have `2` minutes to save it",
							color  : embedColors.red,
							channel: user
						});
					})
				}
				else {
					sendBasicEmbed({
						content: "This planet isnt colonized",
						color  : embedColors.red,
						channel: message.channel
					});
				}
			}
			else {
				sendBasicEmbed({
					content: "You are not on a planet.",
					color  : embedColors.red,
					channel: message.channel
				});
			}
		}
	},

	"STATIONS",
	{
		names      : ["stations", "station", "s"],
		description: "get info on stations",
		usage      : "station [VALUE]",
		values     : ["List", "Info {STATION_NAME}"],
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.pink);
			if (args[0] == "" || args[0] == null) {
				args[0] = "list";
			}
			switch (args[0]) {
				case "list":
					embed.setTitle("ID------Name");
					let txt = "```css\n";
					for (let i = 0; i < stations.names.length; i++) {
						txt += "[" + (i + 1) + "] " + stations.names[i] + "\n";
					}
					embed.setDescription(txt + "```")
						.setFooter(prefix + "station info [NAME]/[ID]");
					break;
				case "info":
					let numbs = getNumbers(args, false);
					let number = null;
					if (numbs.length) {
						number = parseInt(numbs[0], 10);
						number--;
						if (number >= researches.names.length) {
							embed.setColor(embedColors.red);
							embed.setDescription("Invalid ID number");

						}
					}
					else {
						for (let i = 0; i < stations.names.length; i++) {
							let name = stations.names[i].split(" ");
							let newArgs = [];
							for (let q = 0; q < args.length; q++) {
								newArgs.push(args[q]);
							}
							if (newArgs[0] === "info") {
								newArgs.splice(0, 1);
							}
							let found = matchArray(newArgs, name, true);
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
						let item = stations[stations.names[number]];
						embed.setDescription("Info about:")
							.setTitle(stations.names[number])
							.setDescription(item.description + "\n-------------------------------------------------");
						let levels = "```css\n";
						for (let i = 0; i < item.gives.length; i++) {
							levels += "Level " + (i + 1) + " Gives: ";
							for (let j = 0; j < item.gives[i].length; j++) {
								let givesStuff = item.gives[i][j].split(" ");
								levels += givesStuff[1] + " ";
								if ((givesStuff[1] < 10 && givesStuff[1] > 0) || (givesStuff[1] < 0 && givesStuff[1] > -10)) {
									levels += " ";
								}
								levels += resources[[givesStuff[0]]] + " ";
							}
							levels += "|| Costs: ";
							for (let j = 0; j < item.costs[i].length; j++) {
								let costsStuff = item.costs[i][j].split(" ");
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
			message.channel.send({embed});
		}
	},
	{
		names      : ["build"],
		description: "builds a station where you currently are at",
		usage      : "build [VALUE]",
		values     : ["{STATION_NAME}"],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			const freeStation = playerData.stations.length === 0;
			let nums = getNumbers(message.content);
			let unlocked = true;
			let selectedStation = false;

			for (let i = 0; i < stations.names.length; i++) {
				let name = stations.names[i].split(" ");
				let match = matchArray(args, name, true);

				if (match === true) {
					selectedStation = i;
					break;
				}
			}
			if(nums.length){
				if(parseInt(nums[0],10)<stations.names.length){
					selectedStation = parseInt(nums[0],10);
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
				let loc = playerData.location;
				if (map[loc[0]][loc[1]][loc[2]].type.toLowerCase() === "empty") {
					if (checkGP(stations.names[selectedStation], 0, playerData).val) {
						let station = stations[stations.names[selectedStation]];
						let hasEnough = true;
						let missingItems = [];
						for (let i = 0; i < station.costs[0].length; i++) {
							let costsStuff = station.costs[0][i].split(" ");
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
							map[playerData.location[0]][playerData.location[1]][playerData.location[2]].ownersID = playerData.userID;
							map[playerData.location[0]][playerData.location[1]][playerData.location[2]].type = stations.names[selectedStation];
							console.log(map[playerData.location[0]][playerData.location[1]][playerData.location[2]]);
							let lostResources = "";
							for (let i = 0; i < station.costs[0].length; i++) {
								if (freeStation) {
									break;
								}
								let costStuff = station.costs[0][i].split(" ");
								playerData[costStuff[0]] -= costStuff[1];
								lostResources += costStuff[0] + " " + resources[costStuff[0]] + " " + costStuff[1] + "\n";
							}
							let embed = new Discord.RichEmbed()
								.setDescription("Successfully bought " + stations.names[selectedStation] + "\n")
								.setColor(embedColors.pink);
							if (!freeStation) {
								embed.addField("Lost Resources", lostResources);
							}
							else {
								embed.addField("FIRST STATION", "As this is your first station\nIts completely free!");
								playerData.lastCollection = Date.now();
							}
							message.channel.send({embed});
						}
						else {
							let missingResources = "";
							for (let i = 0; i < missingItems.length; i++) {
								missingResources += missingItems[i][0] + " " + missingItems[i][1] + "\n"
							}
							let embed = new Discord.RichEmbed()
								.setColor(embedColors.red)
								.setTitle("Missing Resources")
								.setDescription(missingResources);
							message.channel.send({embed});
						}
					}
					else {
						sendBasicEmbed({
							content: checkGP(stations.names[selectedStation], 0, playerData).msg,
							color  : embedColors.red,
							channel: message.channel
						});
					}
				}
				else {
					sendBasicEmbed({
						content: "You cannot *build* **on** a planet.",
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
		reqs       : ["normCommand", "profile true"],
		effect     : function (message, args, playerData, prefix) {
			let stations = playerData.stations;
			let txt = "```css\n";
			for (let i = 0; i < stations.length; i++) {
				txt += spacing("[" + (stations[i].level + 1) + "] " + stations[i].type, "Galaxy: " + (stations[i].location[0] + 1) + "  X: " + stations[i].location[1] + " Y: " + stations[i].location[2], 50);
				txt += "\n";
			}
			txt += "```";
			if (!stations.length) {
				txt = "You currently don't have any stations";
			}
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.pink)
				.setTitle("LEVEL----NAME-----------------------LOCATION")
				.setDescription(txt);
			message.channel.send({embed});
		}
	},
	{
		names      : ["upgradeStation", "upStation", ""],
		description: "upgrade the station where you currently are at.",
		usage      : "upgradeStation",
		values     : [],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let whichStation = null;
			let stationToUpgrade;
			for (let i = 0; i < playerData.stations.length; i++) {
				stationToUpgrade = playerData.stations[i];
				if (matchArray(stationToUpgrade.location, playerData.location, false)) {
					whichStation = i;
					break;
				}
			}
			let hasEnough = true;
			let missingItems = [];

			if (whichStation == null) {
				sendBasicEmbed({
					content: "Something went wrong.\n**Either:**\n1. You do not own the station here\n2. A station doesn't exist here",
					color  : embedColors.red,
					channel: message.channel
				})
			}
			else {
				let level = stationToUpgrade.level + 1;
				let station = stations[playerData.stations[whichStation].type];
				if (checkGP(playerData.stations[whichStation].type, level, playerData).val) {
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
					for (let i = 0; i < station.costs[level].length; i++) {
						let costsStuff = station.costs[level][i].split(" ");
						if (playerData[costsStuff[0]] < costsStuff[1]) {
							hasEnough = false;
							missingItems.push([(costsStuff[1] - playerData[costsStuff[0]]), resources[costsStuff[0]]]);
						}
					}
					if (hasEnough) {
						stationToUpgrade.level++;
						let lostResources = "";
						for (let i = 0; i < station.costs[level].length; i++) {
							let costStuff = station.costs[level][i].split(" ");
							playerData[costStuff[0]] -= costStuff[1];
							lostResources += costStuff[0] + " " + resources[costStuff[0]] + " " + costStuff[1] + "\n";
						}
						let embed = new Discord.RichEmbed()
							.setDescription("Successfully upgraded " + stationToUpgrade.type + "\n")
							.setColor(embedColors.pink)
							.addField("Lost Resources", lostResources);
						message.channel.send({embed});
						playerData.stations[whichStation].type = station.name;
						playerData.stations[whichStation].level = 0;
					}
					else {
						let missingResources = "";
						for (let i = 0; i < missingItems.length; i++) {
							missingResources += missingItems[i][0] + " " + missingItems[i][1] + "\n"
						}
						let embed = new Discord.RichEmbed()
							.setColor(embedColors.red)
							.setTitle("Missing Resources")
							.setDescription(missingResources);
						message.channel.send({embed});

					}
				}
				else {
					sendBasicEmbed({
						content: checkGP(playerData.stations[whichStation].type, level, playerData).msg,
						color  : embedColors.red,
						channel: message.channel
					})
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
		reqs       : ["normCommand", "profile true", "faction false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {

			let embed = new Discord.RichEmbed()
				.setColor(embedColors.darkblue);
			if (playerData["credits"] >= 500) {
				if (args[0] != null) {
					let txt = "";
					for (let i = 0; i < args.length; i++) {
						txt += args[i];
						if (i + 1 !== args.length) {
							txt += " ";
						}
					}
					if (txt.length < 10) {
						let canCreate = true;
						for (let i = 0; i < factions.length; i++) {
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
							let newFactionData = new createFaction();
							newFactionData.members.push({id: message.author.id, rank: "creator"});
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
			message.channel.send({embed});
		}
	},
	{
		names      : ["factionJoin", "fJoin", "joinFaction"],
		description: "join faction",
		usage      : "factioncreate [VALUE] ",
		values     : ["{FACTION_NAME}"],
		reqs       : ["normCommand", "profile true", "faction false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let txt = "";
			for (let i = 0; i < args.length; i++) {
				txt += args[i];
				if (i + 1 !== args.length) {
					txt += " ";
				}
			}
			let faction = null;
			for (let i = 0; i < factions.names; i++) {
				if (factions.names[i].lowerCaseName === txt.toLowerCase()) {
					faction = factions[factions.names[i].lowerCaseName];
					break;
				}
			}
			if (faction) {
				if (faction.members.length < faction.maxMembers) {
					faction.members.push({id: message.author.id, rank: "member"});
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
		reqs       : ["normCommand", "profile true", "faction true"],
		effect     : function (message, args, playerData, prefix) {
			let validResource = false;
			for (let i = 0; i < resources.names.length; i++) {
				if (args[0] === resources.names[i].toLowerCase()) {
					validResource = true;
					break;
				}
			}
			if (validResource) {
				let numbers = getNumbers(args[1], false);
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
		reqs       : ["normCommand", "profile true", "faction true"],
		effect     : function (message, args, playerData, prefix) {

			let faction = factions[playerData.faction];
			let embed = new Discord.RichEmbed()
				.setTitle(playerData.faction + "'s stats")
				.setFooter(playerData.userID)
				.setColor(faction.color);
			let factionsResources = "css\n";

			let spaceLength = 1;
			for (let i = 0; i < resources.names.length; i++) {
				let len = "" + faction[resources.names[i]];
				if (len.length > spaceLength) {
					spaceLength = len.length;
				}
			}
			for (let i = 0; i < resources.names.length; i++) {
				let space = "";
				let len = "" + faction[resources.names[i]];
				for (let j = 0; j < spaceLength - len.length; j++) {
					space += " ";
				}
				factionsResources += faction[resources.names[i]] + space + "| " + resources[resources.names[i]] + " " + resources.names[i];
				factionsResources += "\n";
			}
			factionsResources += "```";

			embed.addField("Info", "Level:" + faction.level + "\nImage: " + faction.canUseDescription + "\nDescription: " + faction.canUseDescription + "Color: " + faction.color + "\nEmoji: " + faction.emoji, true);
			embed.addField("Resources", factionsResources, true);
			message.channel.send({embed});
		}
	},
	{
		names      : ["factionUpgrade", "fUpgrade", "upgradeFaction", "uFaction", "upgradeF"],
		description: "Upgrade your faction",
		usage      : "factionUpgrade",
		values     : [],
		reqs       : ["normCommand", "profile true", "faction true", "factionMod", "upgradableFaction", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let faction = factions[playerData.faction];
			let stuff = factions.costs[faction.level].split(" ");
			faction.level++;
			let embed = new Discord.RichEmbed()
				.setColor(faction.color)
				.setTitle("Upgrade to Level **" + (faction.level + 1) + "**");
			let gains = "Members: +5\nMods: +1\n";
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
			message.channel.send({embed});
		}
	},
	{
		names      : ["factionDescription", "fDescription"],
		description: "change your faction's description",
		usage      : "factionDescription [VALUE]",
		values     : ["{TEXT}"],
		reqs       : ["normCommand", "profile true", "faction true", "factionMod", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let txt = "";
			for (let i = 0; i < args.length; i++) {
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
		reqs       : ["normCommand", "profile true", "faction true", "factionMod", "factionImage", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			if (message.attachments.first()) {
				let image = message.attachments.first();
				let fileType = "";
				for (let i = image.url.length - 3; i < image.url.length; i++) {
					fileType += image.url[i].toLowerCase();
				}
				if (fileType === "png" || fileType === "jpg" || fileType === "tif") {
					factions[playerData.faction].image = image.url;
					let embed = new Discord.RichEmbed()
						.setThumbnail(image.url)
						.setTitle("Setting `" + factions[playerData.faction].name + "`'s image")
						.setColor(factions[playerData.faction].color)
						.setDescription("Your faction's image has been updated.");
					message.channel.send({embed});
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
		reqs       : ["normCommand", "profile true", "faction false", "factionOwner"],
		effect     : function (message, args, playerData, prefix) {
			let numbers = getNumbers(message.content, false);
			let ID = numbers[0];
			let faction = factions[playerData.faction];
			let member = null;
			let mod = false;
			for (let i = 0; i < faction.members.length; i++) {
				if (ID === faction.members[i].id) {
					member = i;
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
						for (let i = 0; i < faction.members.length; i++) {
							if (faction.members[i].id === ID) {
								faction.members[i].rank = "creator";
							}
							if (faction.members[i].id === message.author.id) {
								faction.members[i].rank = "mod";
							}
						}
						;
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
					for (let i = 0; i < faction.members.length; i++) {
						if (faction.members[i].id === ID) {
							faction.members[i].rank = "mod";
						}
					}
				}
			}
		}
	},
	{
		names      : ["demote"],
		description: "demote somebody",
		usage      : "demote [VALUE]",
		values     : ["{@NAME}", "{USER_ID}"],
		reqs       : ["normCommand", "profile true", "faction false", "factionOwner"],
		effect     : function (message, args, playerData, prefix) {
			let numbers = getNumbers(message.content, false);
			let ID = numbers[0];
			let faction = factions[playerData.faction];
			let member = null;
			for (let i = 0; i < faction.members.length; i++) {
				if (ID === faction.members[i].id && faction.members[i].rank === "mod") {
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
					for (let i = 0; i < faction.members.length; i++) {
						if (faction.members[i].id === ID) {
							faction.members[i].rank = "member";
						}
					}
				}
			}
		}
	},
	{
		names      : ["kick"],
		description: "kick somebody out of your faction",
		usage      : "kick [VALUE]",
		values     : ["{@NAME}", "{USER_ID}"],
		reqs       : ["normCommand", "profile true", "faction false", "factionMod"],
		effect     : function (message, args, playerData, prefix) {
			let numbers = getNumbers(message.content, false);
			let ID = numbers[0];

			let faction = factions[playerData.faction];
			let member = null;
			let creator = null;
			for (let i = 0; i < faction.members.length; i++) {
				if (ID === faction.members[i].id) {
					member = i;
				}
				if (faction.members[i].rank === "creator") {
					creator = i;
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
				if (faction.members[member].rank === "creator") {
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
						if (faction.members[member].rank === "mod") {

							if (faction.members[creator].id === message.author.id) {
								sendBasicEmbed({
									content: "Kicked <@!" + ID + "> from the faction.",
									channel: message.channel,
									color  : faction.color
								});
								accountData[faction.members[i].id].faction = null;
								faction.members.splice(member, 1);
							}
							else {
								sendBasicEmbed({
									content: "Only <@!" + faction.members[creator].id + "> can kick Mods.",
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
							accountData[faction.members[i].id].faction = null;
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
		reqs       : ["normCommand", "profile true", "faction", "factionOwner"],
		effect     : function (message, args, playerData, prefix) {
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.red)
				.setDescription("Disbanding your faction is irreversible.\nIf you *really* want to disband your faction please do\n`" + prefix + "factionDisband " + factions[playerData.faction].name + "`");
			let txt = "";
			for (let i = 0; i < args.length; i++) {
				txt += args[0].toLowerCase();
			}
			if (!txt.length) {
				embed.setTitle("WARNING");
			}
			else {
				let fac = playerData.faction;
				let name = playerData.faction;
				embed.setDescription("Faction was disbanded");
				for (let i = 0; i < fac.members.length; i++) {
					accountData[fac.members[i].id].faction = null;
				}
				delete factions[name];
			}
			message.channel.send({embed})
		}
	},
	{
		names      : ["factionLeave", "fLeave", "leaveFaction"],
		description: "leave your current faction",
		usage      : "factionLeave",
		values     : [],
		reqs       : ["normCommand", "profile true", "faction"],
		effect     : function (message, args, playerData, prefix) {
			let txt = "";
			for (let i = 0; i < args.length; i++) {
				txt += args[0].toLowerCase();
				if (i + 1 !== args.length) {
					txt += " ";
				}
			}

			if (txt === playerData.faction.toLowerCase()) {
				let faction = factions[playerData.faction];
				sendBasicEmbed({
					content: "You have left your faction.",
					color  : embedColors.red,
					channel: message.channel
				});
				for (let i = 0; i < faction.members.length; i++) {
					if (faction.members[i].id === message.author.id) {
						if (faction.members[i].rank !== "creator") {
							faction.members.splice(i, 1);
							break;
						}
						else {
							sendBasicEmbed({
								content: "You are the owner of this faction\nYou cannot leave! But you can do\n```css\n" + prefix + "factionDisband        Delete your faction\n" + prefix + "promote     promote somebody to a mod/owner```",
								color  : embedColors.red,
								channel: message.channel
							})
						}
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
					for (let i = 0; i < serverStuff.names.length; i++) {
						if (serverStuff[serverStuff.names[i]].serverID === message.guild.id) {
							serverStuff[serverStuff.names[i]].prefix = args[0];
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
		names      : ["allowChannel"],
		description: "allow a channel for galactica usage",
		usage      : "allowChannel [VALUE]",
		values     : ["{CHANNEL_ID}", "{#CHANNEL}"],
		reqs       : ["channel text", "userPerms ADMINISTRATOR"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			if (nums.length) {
				if (client.channels.get(nums[0]) != null) {
					serverStuff[message.guild.id].allowedChannels[nums[0]] = true;
					sendBasicEmbed({
						content: "Set <#" + nums[0] + "> as an allowed channel.",
						color  : embedColors.purple,
						channel: message.channel
					});
				}
				else {
					sendBasicEmbed({
						content: "Something went wrong, its either\n```fix\nThe bot doesnt have access to the channel\nInvalid channel\nDM's channel\nVoice Channel```\nThe channel must be a text channel.",
						color  : embedColors.red,
						channel: message.channel
					})
				}
			}
			else {
				sendBasicEmbed({
					content: "Invalid Usage\nYou must send the channel you to allow",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["disallowChannel"],
		description: "disallow a channel for galactica usage",
		usage      : "disallowChannel [VALUE]",
		values     : ["{CHANNEL_ID}", "{#CHANNEL}"],
		reqs       : ["channel text", "userPerms ADMINISTRATOR"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			if (nums.length) {
				if (client.channels.get(nums[0]) != null) {
					delete serverStuff[message.guild.id].allowedChannels[nums[0]];
					sendBasicEmbed({
						content: "Set <#" + nums[0] + "> as a disallowed channel.",
						color  : embedColors.purple,
						channel: message.channel
					})
				}
				else {
					sendBasicEmbed({
						content: "Something went wrong, its either\n```fix\nThe bot doesnt have access to the channel\nInvalid channel\nDM's channel\nVoice Channel```\nThe channel must be a text channel.",
						color  : embedColors.red,
						channel: message.channel
					})
				}
			}
			else {
				sendBasicEmbed({
					content: "Invalid Usage\nYou must send the channel you to disallow",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["setModChannel", "setMC"],
		description: "set your server's mod channel",
		usage      : "setModChannel [VALUE]",
		values     : ["{CHANNEL_ID}", "{#CHANNEL}"],
		reqs       : ["channel text", "userPerms ADMINISTRATOR"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			if (nums.length) {
				if (client.channels.get(nums[0]) != null) {
					serverStuff[message.guild.id].modChannel = nums[0];
					sendBasicEmbed({
						content: "Set <#" + nums[0] + "> as the mod channel.\nYou may now use `warn`, `kick`, `mute` and `ban`",
						color  : embedColors.purple,
						channel: message.channel
					})

				}
				else {
					sendBasicEmbed({
						content: "Something went wrong, its either\n```fix\nThe bot doesnt have access to the channel\nInvalid channel\nDM's channel\nVoice Channel```\nThe channel must be a text channel.",
						color  : embedColors.red,
						channel: message.channel
					})
				}
			}
			else {
				sendBasicEmbed({
					content: "Invalid Usage!\nYou must include the channel you want to be the mod channel.",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["setWelcomeChannel", "setWC"],
		description: "set your server's welcome channel and its message",
		usage      : "setModChannel [VALUE]",
		values     : ["{CHANNEL_ID} {MESSAGE}", "{#CHANNEL} {MESSAGE}"],
		reqs       : ["channel text", "userPerms ADMINISTRATOR"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			if (nums.length) {
				let welcomeTxt = "Welcome {username} to {server} owned by {owner} you are member #{members}";
				if (client.channels.get(nums[0]) != null) {
					if (args.length >= 2) {
						welcomeTxt = "";
						for (let i = 0; i < args.length; i++) {
							welcomeTxt += args[i] + " ";
						}
					}
					serverStuff[message.guild.id].welcomeChannel.id = nums[0];
					serverStuff[message.guild.id].welcomeChannel.message = welcomeTxt;
					sendBasicEmbed({
						content: "Set <#" + nums[0] + "> as the welcome channel.\nWith the welcome message as\n" + welcomeTxt,
						color  : embedColors.purple,
						channel: message.channel
					});
					if (serverStuff[message.channel.guild.id].modChannel != null) {
						let embed = new Discord.RichEmbed()
							.setTitle("Welcome Message")
							.setDescription("Welcome message was changed by <@!" + message.author.id + "> to\n" + welcomeTxt)
							.setColor(embedColors.purple);
						client.channels.get(serverStuff[message.channel.guild.id].modChannel).send({embed});
					}
				}
				else {
					sendBasicEmbed({
						content: "Something went wrong, its either\n```fix\nThe bot doesnt have access to the channel\nInvalid channel\nDM's channel\nVoice Channel```\nThe channel must be a text channel.",
						color  : embedColors.red,
						channel: message.channel
					})
				}
			}
			else {
				if (args[0] === "none") {
					sendBasicEmbed({
						content: "Disabled the welcome message.",
						color  : embedColors.red,
						channel: message.channel
					});
					serverStuff[message.channel.guild.id].welcomeChannel.id = null;
					serverStuff[message.channel.guild.id].welcomeChannel.message = null;
					if (serverStuff[message.channel.guild.id].modChannel != null) {
						let embed = new Discord.RichEmbed()
							.setTitle("Welcome Message")
							.setDescription("Welcome message was deleted by <@!" + message.author.id + ">")
							.setColor(embedColors.purple);
						client.channels.get(serverStuff[message.channel.guild.id].modChannel).send({embed});
					}
				}
				else {
					sendBasicEmbed({
						content: "Invalid Usage!\nYou must include the channel you want to be the mod channel.",
						color  : embedColors.red,
						channel: message.channel
					})
				}
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
			let theNumbersInput = getNumbers(message.content, true);
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
		names      : ["warn"],
		description: "warn a user",
		usage      : "warn [VALUE]",
		values     : ["{@USER} [REASON]", "{@USER_ID} [REASON]"],
		reqs       : ["channel text", "userPerms KICK_MEMBERS", "modChannel"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			let reason = "No reason supplied";
			if (args.length >= 2) {
				reason = "";
				for (let i = 1; i < args.length; i++) {
					reason += args[i] + " ";
				}
			}
			if (nums.length) {
				client.fetchUser(nums[0]).then(function (user) {

					let warningNum = "This is the 1st warning given to this user.";
					if (serverStuff[message.guild.id].warnings[nums[0]] != null) {
						serverStuff[message.guild.id].warnings[nums[0]]++;
						warningNum = "This the " + serverStuff[message.guild.id].warnings[nums[0]];
						let num = "" + serverStuff[message.guild.id].warnings[nums[0]];
						console.log(num[num.length - 1]);
						switch (num[num.length - 1]) {
							case "1":
								warningNum += "st";
								break;
							case "2":
								warningNum += "nd";
								break;
							case "3":
								warningNum += "rd";
								break;
							default:
								warningNum += "th";
								break;
						}
						warningNum += " warning given to this user.";
					}
					else {
						serverStuff[message.guild.id].warnings[nums[0]] = 1;
					}
					let embed = new Discord.RichEmbed()
						.setTitle("WARNING <@!" + nums[0] + ">")
						.setColor(embedColors.yellow)
						.setDescription("<@!" + nums[0] + "> has been warned\n**Reason:** " + reason + "\nGiven by: <@!" + message.author.id + ">")
						.setFooter(warningNum);
					client.channels.get(serverStuff[message.guild.id].modChannel).send({embed});
					let deleteIt = checkPerms({
						message: message,
						user   : "bot",
						perms  : "MANAGE_MESSAGES"
					});
					let embedNew = new Discord.RichEmbed()
						.setDescription("warned the user")
						.setColor(embedColors.purple);
					message.channel.send({embed: embedNew}).then(function (mess) {
						if (deleteIt) {
							message.delete();
							setTimeout(function () {
								mess.delete();
							}, 10000)
						}
					});

				}).catch(function (err) {
					console.log(err);
					sendBasicEmbed({
						content: "that user doesnt exist",
						color  : embedColors.red,
						channel: message.channel
					})
				});

			}
			else {
				sendBasicEmbed({
					content: "Invalid Usage\nPlease add in the USER you want to warn",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["clearWarnings", "clearWarning", "clearWarns", "clearWarn"],
		description: "Clear warnings from a user",
		usage      : "clearWarnings [VALUE]",
		values     : ["{USER_ID}", "{@USER}"],
		reqs       : ["channel text", "userPerms KICK_MEMBERS", "modChannel"],
		effect     : function (message, args, playerData, prefix) {
			let deleteIt = checkPerms({
				message: message,
				user   : "bot",
				perms  : "MANAGE_MESSAGES"
			});
			let nums = getNumbers(message.content);
			let reason = "No reason supplied";
			if (args.length >= 2) {
				reason = "";
				for (let i = 1; i < args.length; i++) {
					reason += args[i] + " ";
				}
			}
			if (nums.length) {
				client.fetchUser(nums[0]).then(function (user) {

					if (serverStuff[message.guild.id].warnings[nums[0]] != null) {
						let clearedWarnings = "This user HAD " + serverStuff[message.guild.id].warnings[nums[0]] + " warnings.";
						delete serverStuff[message.guild.id].warnings[nums[0]];
						let embed = new Discord.RichEmbed()
							.setTitle("CLEARING <@!" + nums[0] + ">'S WARNINGS")
							.setColor(embedColors.green)
							.setDescription("<@!" + nums[0] + "> has had his warnings removed\n**Reason:** " + reason + "\nGiven by: <@!" + message.author.id + ">")
							.setFooter(clearedWarnings);
						client.channels.get(serverStuff[message.guild.id].modChannel).send({embed});
						let embed2 = new Discord.RichEmbed()
							.setDescription("cleared user's warnings.")
							.setColor(embedColors.purple);
						message.channel.send({embed: embed2}).then(function (mess) {
							if (deleteIt) {
								message.delete();
								setTimeout(function () {
									mess.delete();
								}, 10000)
							}
						});

					}
					else {
						sendBasicEmbed({
							content: "That user had no warnings",
							color  : embedColors.red,
							channel: message.channel
						})
					}
				}).catch(function (err) {
					sendBasicEmbed({
						content: "That user doesnt exist",
						color  : embedColors.red,
						channel: message.channel
					})
				});


			}
			else {
				sendBasicEmbed({
					content: "Invalid Usage\nPlease add in the USER you want to warn",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["kick"],
		description: "kick a user",
		usage      : "kick [VALUE]",
		values     : ["{@USER} [REASON]", "{@USER_ID} [REASON]"],
		reqs       : ["channel text", "userPerms KICK_MEMBERS", "modChannel", "botPerms KICK_MEMBERS"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			let reason = "No reason supplied";
			if (args.length >= 2) {
				reason = "";
				for (let i = 1; i < args.length; i++) {
					reason += args[i] + " ";
				}
			}
			if (nums.length) {
				client.fetchUser(nums[0]).then(function (user) {
					let warningNum = "This user had 0 warnings.";
					if (serverStuff[message.guild.id].warnings[nums[0]] != null) {
						warningNum = "This user had " + serverStuff[message.guild.id].warnings[nums[0]] + " warnings.";
					}
					let embed = new Discord.RichEmbed()
						.setTitle("KICKING <@!" + nums[0] + ">")
						.setColor(embedColors.orange)
						.setDescription("<@!" + nums[0] + "> has been kicked!\n**Reason:** " + reason + "\nGiven by: <@!" + message.author.id + ">")
						.setFooter(warningNum);
					client.channels.get(serverStuff[message.guild.id].modChannel).send({embed});
					client.guilds.get(message.guild.id).members.get(nums[0]).kick(reason);
					let deleteIt = checkPerms({
						message: message,
						user   : "bot",
						perms  : "MANAGE_MESSAGES"
					});
					let embed2 = new Discord.RichEmbed()
						.setDescription("kicked the user")
						.setColor(embedColors.purple);
					message.channel.send({embed: embed2}).then(function (mess) {
						if (deleteIt) {
							message.delete();
							setTimeout(function () {
								mess.delete();
							}, 10000)
						}
					});
				}).catch(function (err) {
					sendBasicEmbed({
						content: "That user doesn't exist.",
						color  : embedColors.red,
						channel: message.channel
					})
				});

			}
			else {
				sendBasicEmbed({
					content: "Invalid Usage\nPlease add in the USER you want to warn",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},
	{
		names      : ["ban"],
		description: "ban a user",
		usage      : "ban [VALUE]",
		values     : ["{@USER} [REASON] [DELETE_DAYS_OF_MESSAGES]", "{@USER_ID} [REASON] [DELETE_DAYS_OF_MESSAGES]"],
		reqs       : ["channel text", "userPerms BAN_MEMBERS", "modChannel", "botPerms BAN_MEMBERS"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			let reason = "No reason supplied";

			if (args.length >= 2) {
				reason = "";
				for (let i = 1; i < args.length; i++) {
					reason += args[i] + " ";
				}
			}
			if (nums.length) {
				client.fetchUser(nums[0]).then(function (user) {

					let warningNum = "This user had 0 warnings.";
					if (serverStuff[message.guild.id].warnings[nums[0]] != null) {
						warningNum = "This user had " + serverStuff[message.guild.id].warnings[nums[0]] + " warnings.";
					}
					let embed = new Discord.RichEmbed()
						.setTitle("BANNING <@!" + nums[0] + ">")
						.setColor(embedColors.red)
						.setDescription("<@!" + nums[0] + "> has been banned!\n**Reason:** " + reason + "\nGiven by: <@!" + message.author.id + ">")
						.setFooter(warningNum);
					client.channels.get(serverStuff[message.guild.id].modChannel).send({embed});
					let days = nums[1] || 0;
					client.guilds.get(message.guild.id).members.get(nums[0]).ban({days: days, reason: reason});
					let deleteIt = checkPerms({
						message: message,
						user   : "bot",
						perms  : "MANAGE_MESSAGES"
					});
					let embed2 = new Discord.RichEmbed()
						.setDescription("banned the user")
						.setColor(embedColors.purple);
					message.channel.send({embed: embed2}).then(function (mess) {
						if (deleteIt) {
							message.delete();
							setTimeout(function () {
								mess.delete();
							}, 10000)
						}
					});

				}).catch(function (err) {
					sendBasicEmbed({
						content: "That user doesn't exist.",
						color  : embedColors.red,
						channel: message.channel
					})
				});

			}
			else {
				sendBasicEmbed({
					content: "Invalid Usage\nPlease add in the USER you want to warn",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},

	"OWNER",
	{
		names      : ["clearLogs"],
		description: "clearLogs",
		usage      : "clearLogs",
		values     : [],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			//require("galatica.log");
		}
	},
	{
		names      : ["eval"],
		description: "does some code",
		usage      : "eval [VALUE]",
		values     : ["{CODE}"],
		reqs       : ["normCommand", "owner"],
		effect     : function (message, args, playerData, prefix) {
			let words = message.content.split(";");
			words[0] = words[0].slice((universalPrefix + "eval ").length, words[0].length);
			if (words[0][0] === "`" && words[0][1] === "`" && words[0][2] === "`") {
				let newWords = message.content.split("```");
				words = newWords[1].split("\n");
			}
			let code = "```js\n";
			let logged = "```css\n";
			let evalCode = "";

			for (let i = 0; i < words.length; i++) {
				let checkLogs = words[i].split("(");
				evalCode += words[i] + " ";
				log(words[i]);
				code += words[i] + "\n";
			}
			eval(evalCode);
			let embed = new Discord.RichEmbed()
				.setTitle(universalPrefix + "eval")
				.setDescription("Your code that got ran was,")
				.addField("Code", code + "```")
				.setColor(embedColors.green);
			if (logged !== "```css\n") {
				embed.addField("Logged items", logged + "```");
			}
			message.channel.send({embed});
		}
	},
	{
		names      : ["exit"],
		description: "Turns off the bot",
		usage      : "exit",
		values     : [],
		reqs       : ["normCommand", "owner"],
		effect     : function (message, args, playerData, prefix) {
			client.destroy().then(function () {
				console.log("Successfully logged out");
				process.exit();
			});
		}
	},
	{
		names      : ["changeVersion", "versionChange", "changeV", "vChange"],
		description: "change the version",
		usage      : "version {VALUE}",
		values     : ["{VERSION}"],
		reqs       : ["normCommand", "owner"],
		effect     : function (message, args, playerData, prefix) {
			if (args[0]) {
				let other = require("./other.json");
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
		names      : ["resetMap"],
		description: "recreate the map",
		usage      : "resetMap",
		values     : [],
		reqs       : ["normCommand", "owner"],
		effect     : function (message, args, playerData, prefix) {
			let other = require("./other.json");
			other.map = createMap(4, 25, 25);
			map = other.map;
			sendBasicEmbed({
				content: "Create map 4x25x25",
				color  : embedColors.purple,
				channel: message.channel
			})
		}
	},
	{
		names      : ["give"],
		description: "gives items to the player or yourself",
		usage      : "give [VALUE]",
		values     : ["{ITEM} {AMOUNT}", "{PLAYER} {ITEM} {AMOUNT}"],
		reqs       : ["normCommand", "profile true", "owner"],
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
				let id = "";
				for (let i = 3; i < args[0].length - 1; i++) {
					id += args[0][i];
				}
				let data = accountData[id];
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
		names      : ["deleteAccount"],
		description: "delete a players account",
		usage      : "delete [VALUE]",
		values     : ["{ID}", "{@PLAYER}"],
		reqs       : ["normCommand", "owner"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			let player = accountData[nums[0]];
			if (player != null) {
				if (player.faction != null) {
					let fac = factions[player.faction];
					if (fac) {
						for (let i = 0; i < fac.members.length; i++) {
							if (fac.members[i].id === player.id) {
								if (fac.members[i].rank !== "creator") {
									fac.members.splice(i, 1);
								}
								else {
									let found = false;
									for (let j = 0; j < fac.members.length; i++) {
										if (fac.members[j].rank === "mod") {
											fac.members[j].rank = "owner";
											found = true;
											break;
										}
									}
									if (!found) {
										for (let j = 0; j < fac.members.length; i++) {
											if (fac.members[j].rank === "mod") {
												accountData[fac.members[j].id].faction = null;
											}
										}
										delete factions[player.faction];
									}
								}
							}
						}
					}
				}
				if (player.stations.length) {
					for (let i = 0; i < player.stations.length; i++) {
						let loc = player.stations[i].location;
						map[loc[0]][loc[1]][loc[2]].type = "Empty";
						map[loc[0]][loc[1]][loc[2]].ownersID = null;
					}
				}
				for (let i = 0; i < accountData.names.length; i++) {
					if (accountData.names[i] === nums[0]) {
						accountData.splice(i, 1);
					}
				}
				delete accountData[nums[0]];

				sendBasicEmbed({
					content: "Deleted " + nums[0] + "'s account",
					color  : embedColors.purple,
					channel: message.channel
				})
			}
			else {
				sendBasicEmbed({
					content: "Something went wrong...\n```fix\nEither that player doesnt have an account\nOr invalid ID```",
					color  : embedColors.red,
					channel: message.channel
				})
			}

		}
	}
];

/**CLIENTS**/
setInterval(function () {
	client.sweepMessages((60000 * 60) * 24);
}, 60000 * 60);
client.on("guildMemberAdd", function (member) {
	if (serverStuff[member.guild.id].welcomeChannel.id != null) {
		let txt = "";
		let msg = serverStuff[member.guild.id].welcomeChannel.message.split(" ");
		for (let i = 0; i < msg.length; i++) {
			let value = msg[i].split("{");
			if (value.length <= 1) {
				txt += msg[i] + " ";
			}
			else {
				value = value[1].split("}")[0];
				switch (value) {
					case "username":
						txt += member.user.username + " ";
						break;
					case "server":
						txt += member.guild.name + " ";
						break;
					case "members":
						txt += member.guild.members.size + " ";
						break;
					case "owner":
						txt += member.guild.owner + " ";
						break;
					default:
						txt += msg[i] + " ";
						break;
				}
			}
		}
		let embed = new Discord.RichEmbed()
			.setTitle(member.user.username.toUpperCase() + " HAS JOINED!")
			.setDescription(txt)
			.setColor(embedColors.green);
		client.channels.get(serverStuff[member.guild.id].welcomeChannel.id).send({embed});
	}
});
client.on("guildCreate", function (Guild) {
	if (serverStuff[Guild.id] == null) {
		serverStuff[Guild.id] = {
			prefix    : "-",
			serverID  : Guild.id,
			modChannel: null,
			warnings  : {}
		};
		//TODO: add a welcome message
	}
	else {
		//TODO: add a thank you for inviting me back
	}
});
client.on("ready", function () {
	console.log("Galactica | Online");
	client.user.setGame(universalPrefix + 'help | Guilds: ' + (client.guilds.size));
});
client.on("messageReactionAdd", function (reaction, user) {
	if (user.bot) {
		return;
	}
	let message = reaction.message;

	let emojis = ["🛡", "📡", "☄", "🏃"];
	let isValid = false;
	for (let i = 0; i < emojis.length; i++) {
		if (reaction.emoji.name === emojis[i]) {
			isValid = true;
		}
	}
	if (isValid) {
		for (let i = 0; i < attacks.length; i++) {
			let attack = attacks[i];
			if (message.id === attack.attackersMid) {
				attack.attackerChoice = reaction.emoji.name;

				let embed = new Discord.RichEmbed()
					.setTitle("YOU ARE ATTACKING `" + accountData[attack.defender].username + "`")
					.setColor(embedColors.darkRed)
					.setDescription("Please choose either \n:shield: SHIELD (loses to :comet:) (beats :satellite:)\n:satellite: LASER (loses to :shield:) (beats :comet:)\n:comet: PHOTON TORPEDO (beats :shield:) (loses to :satellite:)\n:runner: ESCAPE (40% chance of success)\nYou have `20` seconds or until both sides chooses")
					.setFooter("Your choice: " + reaction.emoji.name);
				message.edit({embed});
			}
			else if (message.id === attack.defendersMid) {
				attack.defenderChoice = reaction.emoji.name;
				let embed = new Discord.RichEmbed()
					.setTitle("YOU ARE UNDER ATTACK BY`" + accountData[attack.attacker].username + "`")
					.setColor(embedColors.darkRed)
					.setDescription("Please choose either \n:shield: SHIELD (loses to :comet:) (beats :satellite:)\n:satellite: LASER (loses to :shield:) (beats :comet:)\n:comet: PHOTON TORPEDO (beats :shield:) (loses to :satellite:)\n:runner: ESCAPE (40% chance of success)\nYou have `20` seconds or until both sides chooses")
					.setFooter("Your choice: " + reaction.emoji.name);
				message.edit({embed});
			}
		}
	}
});
client.on("message", function (message) {
	attacks = require("./other.json").attacks;
	accountData = require("./accounts.json").players;
	factions = require("./factions.json").factions;
	listOfWaitTimes = require("./other.json").listOfWaitTimes;
	map = require("./other.json").map;

	if (message.author.bot) {
		return;
	}
	let command = message.content.toLowerCase().split(" ")[0];
	let args = message.content.toLowerCase().split(" ");
	let serverPrefix = universalPrefix;
	if (message.channel.type === "text") {
		for (let i = 0; i < serverStuff.names.length; i++) {
			let server = serverStuff[serverStuff.names[i]];
			if (server.serverID === message.guild.id) {
				serverPrefix = server.prefix;
				break;
			}
		}
	}
	if (args[0][0] === universalPrefix || args[0] === "<@" + client.user.id + ">" || args[0].substring(0, serverPrefix.length) === serverPrefix) {
		if (args[0].substring(0, serverPrefix.length) === serverPrefix) {
			command = args[0].substring(serverPrefix.length, message.content.length);
		}
		else if (args[0] === "<@" + client.user.id + ">") {
			command = message.content.toLowerCase().split(" ")[1];
			args.shift()
		}
		else {
			command = command.substring(1);
		}
		args.shift();
		for (let i = 0; i < commands.length; i++) {
			if (typeof commands[i] === "object") {
				for (let j = 0; j < commands[i].names.length; j++) {
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
							accountData[message.author.id] = new updateAccount(accountData[message.author.id]);
							if (accountData[message.author.id].username !== message.author.username) {
								accountData[message.author.id].username = message.author.username;
							}
							runCommand(commands[i], message, args, accountData[message.author.id], serverPrefix);
							saveJsonFile("./accounts.json");
							saveJsonFile("./factions.json");
							saveJsonFile("./other.json");
							break;
						}
						else {
							sendBasicEmbed({
								content: "Unreadable message...\nPlease send only characters `A-Z` and Numbers `0-9`",
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

});
client.login(require("./config.json").token);//Secure Login