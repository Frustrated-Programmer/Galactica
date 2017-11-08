/**Set Up **/
let version = require("./other.json").version;
let Jimp = require("jimp");
const universalPrefix = require("./other.json").uniPre || "-";
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
let checked = 0;
let checker = setInterval(function () {
	let guilds = client.guilds.array();
	for (let i = 0; i < guilds.length; i++) {
		let found = false;
		for (let j = 0; j < serverStuff.names.length; j++) {
			if (serverStuff.names[j] === guilds[i].id) {
				found = true;
				break;
			}
		}
		if (!found) {
			serverStuff[guilds[i].id] = {
				prefix         : "-",
				serverID       : guilds[i].id,
				modChannel     : null,
				warnings       : {},
				allowedChannels: {},
				welcomeChannel : {
					id     : null,
					message: null
				},
				goodbyeChannel : {
					id     : null,
					message: null
				}
			};
		}
	}
	for (let i = 0; i < serverStuff.names.length; i++) {
		let found = false;
		for (let j = 0; j < guilds.length; j++) {
			if (serverStuff.names[i] === guilds[j].id) {
				found = true;
				break;
			}
		}
		if (!found) {
			delete serverStuff[serverStuff.names[i]];
			serverStuff.names.splice(i, 1)
		}
	}
	client.user.setGame(universalPrefix + 'help | Guilds: ' + (client.guilds.size));
	fs.readFile("./galactica.log", "utf8", function (err, data) {
		if (err) {
			console.log(err);
		}
		let words = data.split(" ");
		if (words.length >= 5000) {
			fs.writeFile("./galactica.log", "Cleared Logs!\n", function (err) {
				if (err) {
					throw err
				}
				console.log("Refreshed due to amount of logs.");
			});
		}
	});
	for (let i = 0; i < accountData.names.length; i++) {
		let player = accountData[accountData.names[i]];
		let rankLevel = 0;
		for (let j = 0; j < ranks.list.length; j++) {
			if (player["power"] >= ranks.list[j]) {
				rankLevel = j;
			}
		}
		if (player.rank !== ranks.names[rankLevel]) {
			let promo = "demoted";
			for (let j = 0; j < ranks.names.length; j++) {
				if (ranks.names[j] === player.rank) {
					if (j > rankLevel) {
						promo = "promoted";
					}
				}
			}
			player.rank = ranks.names[rankLevel];
			client.fetchUser(player.id).then(function (user) {
				sendBasicEmbed({
					content: "You've been " + promo + " to " + ranks.names[rankLevel],
					color  : promo === "demoted" ? embedColors.red : embedColors.green,
					channel: user
				})
			})
		}
	}
	console.log(client.status);
	if (client.status !== 1 || checked >= 1) {
		console.log("rebooted");
		process.exit();
	}
	checked++;
	for (let i = 0; i < accountData.names.length; i++) {
		let player = accountData[accountData.names[i]];
		let rank = null;
		for (let j = 0; j < ranks.names.length; i++) {
			if (ranks.names[i].toLowerCase() === player.rank) {
				rank = ranks[ranks.names[i]]
			}
		}
		if (player.isDominating) {
			let amo = 0;
			switch (playerData["Domination Kingdoms"]) {
				case 1:
					amo = Math.floor(rank.dom / 5);
					break;
				case 2:
					amo = Math.floor(rank.dom / 3);
					break;
				case 3:
					amo = Math.floor(rank.dom / 3) * 2;
					break;
				case 4:
					amo = rank.dom;
					break;
			}
			accountData[accountData.names[i]]["credits"] += rank.dom + amo;
		}
		else if (player.isInSafeZone) {
			accountData[accountData.names[i]]["credits"] -= rank.safe;
		}
		if (accountData[accountData.names[i]]["credits"] < 0) {
			accountData[accountData.names[i]]["credits"] = 0;
			client.fetchUser(accountData[accountData.names[i]].userID).then(function (user) {
				sendBasicEmbed({
					content: "You were removed from the SafeZone due to having Insufficient Funds\nIt costs " + rank.safe + " " + resources["credits"] + " credits every 10 minutes to stay in the safe zone.",
					color  : embedColors.red,
					channel: user
				})
			})
		}
	}
}, 60000 * 10);
fs.exists('./permissions.json', function (exists) {
	if (!exists) {
		fs.writeFile("permissions.json", "{}", function (err) {
			if (err) {
				throw err;
			}
			console.log("created Permissions.json");
		});
	}
});


/**VARIABLES**/
let powerEmoji = "";
let upTime = 0;
let attacks = require("./other.json").attacks;
let attackTimeInterval = false;
let accountData = require("./accounts.json").players;
let waitTimesInterval = false;
let factions = require("./factions.json").factions;
let listOfWaitTimes = require("./other.json").listOfWaitTimes;
let timesTake = require("./items.js").times;
let map = require("./other.json").map;

/**FUNCTIONS**/
function isVerified(ID) {
	let accounts = require("./permissions.json");
	if (accounts[ID] != null) {
		return true;
	}
	return false;
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
	 timeSinceLastAttack: Date.now(),
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
				let defLaserPer = Math.round(((accountData[attack.defender]["Compressed Laser Generators"] * 5) / damage) * 100);
				let attLaserPer = Math.round(((accountData[attack.attacker]["Compressed Laser Generators"] * 5) / damage) * 100);
				let attShields = Math.round(((accountData[attack.attacker]["Super Galactic Shields"] * 5) / damage) * 100);
				let defShields = Math.round(((accountData[attack.defender]["Super Galactic Shields"] * 5) / damage) * 100);
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
						damage += attLaserPer;
						damage -= defLaserPer;
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
						damage += defLaserPer;
						damage -= attLaserPer;
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

				attack.attackerChoice = null;
				attack.defenderChoice = null;
				attack.round++;
				attack.timeSinceLastAttack = Date.now();
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
	}
	if (!attacks.length) {
		clearInterval(attackTimeInterval);
		attackTimeInterval = false;
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
	listOfWaitTimes = require("./other.json").listOfWaitTimes;
	for (let i = 0; i < listOfWaitTimes.length; i++) {
		if (listOfWaitTimes[i].expires <= Date.now()) {
			let playerData = accountData[listOfWaitTimes[i].player];
			let loc = playerData.location;
			switch (listOfWaitTimes[i].type) {
				case "warp":
					accountData[listOfWaitTimes[i].player].location = listOfWaitTimes[i].headTo;
					let headTo = listOfWaitTimes[i].headTo;
					sendBasicEmbed({
						content: "Your warp to:\nGalaxy: `" + (headTo[0] + 1) + "` Area: `" + (headTo[2] + 1) + "x" + (headTo[1] + 1) + "`\nhas finished.",
						channel: client.users.get(listOfWaitTimes[i].player),
						color  : embedColors.blue
					});
					if (headTo[1] < 3 && headTo[2] < 3) {
						accountData[listOfWaitTimes[i].player].isInSafeZone = true;
					}
					else if (headTo[1] > 16 && headTo[2] > 16) {
						accountData[listOfWaitTimes[i].player].isDominating = true;
					}
					listOfWaitTimes.splice(i, 1);

					break;
				case "colonization":
					if (accountData[listOfWaitTimes[i].player].didntMove) {
						let mapSpot = map[listOfWaitTimes[i].at[0]][listOfWaitTimes[i].at[1]][listOfWaitTimes[i].at[2]];
						accountData[listOfWaitTimes[i].player].colonies.push({
							location : accountData[listOfWaitTimes[i].player].location,
							type     : mapSpot.type,
							people   : 0,
							maxPeople: planets[mapSpot.type].inhabitedMax
						});
						client.fetchUser(listOfWaitTimes[i].player).then(function (user) {

							sendBasicEmbed({
								content: "Your colonization at\nGalaxy: `" + (listOfWaitTimes[i].at[0] + 1) + "` Area: `" + listOfWaitTimes[i].at[2] + "x" + listOfWaitTimes[i].at[1] + "`\nhas finished!\n" + resources["power"].emoji + " Power Gained:" + powerIncreases.colonize,
								channel: user,
								color  : embedColors.blue
							});
							accountData[listOfWaitTimes[i].player]["power"] += powerIncreases.colonize;

							map[loc[0]][loc[1]][loc[2]].item = "colony";
							map[loc[0]][loc[1]][loc[2]].ownersID = listOfWaitTimes[i].player;
							map[loc[0]][loc[1]][loc[2]].soonOwner = null;

							listOfWaitTimes.splice(i, 1);
						});
					}
					else {
						client.fetchUser(listOfWaitTimes[i].player).then(function (user) {
							sendBasicEmbed({
								content: "Your colonization at\nGalaxy: `" + (listOfWaitTimes[i].at[0] + 1) + "` Area: `" + (listOfWaitTimes[i].at[2] + 1) + "x" + (listOfWaitTimes[i].at[1] + 1) + "\nhas failed.\n**Reason:** You moved away.",
								channel: user,
								color  : embedColors.red
							});
							map[listOfWaitTimes[i].at[0]][listOfWaitTimes[i].at[1]][listOfWaitTimes[i].at[2]].item = "planet";
							listOfWaitTimes.splice(i, 1);
						});
					}
					break;
				case "attackColony":
					let colony = listOfWaitTimes[i].at;
					if (playerData.didntMove) {

						client.fetchUser(map[loc[0]][loc[1]][loc[2]].ownersID).then(function (user) {

							for (let j = 0; j < accountData[map[loc[0]][loc[1]][loc[2]].ownersID].stations.length; j++) {
								if (matchArray(accountData[map[loc[0]][loc[1]][loc[2]].ownersID].stations[j].location, playerData.location, false)) {
									accountData[map[loc[0]][loc[1]][loc[2]].ownersID].stations.splice(j, 1);
								}
							}
							map[loc[0]][loc[1]][loc[2]].ownersID = null;
							map[loc[0]][loc[1]][loc[2]].item = "planet";
							accountData[user.id]["power"] -= powerIncreases.colonyDestroy;
							if (accountData[user.id]["power"] < 0) {
								accountData[user.id]["power"] = 0;
							}
							accountData[listOfWaitTimes[i].player]["power"] += powerIncreases.attackColony;
							sendBasicEmbed({
								content: "Your colony at\nGalaxy: `" + loc[0] + "` Area: `" + loc[2] + "x" + loc[1] + "`\nHas been destroyed by `" + playerData.username + "`\n" + resources["power"].emoji + " Power lost: " + powerIncreases.colonyDestroy,
								color  : embedColors.red,
								channel: user
							});

							sendBasicEmbed({
								content: "You have destroyed the station at\nGalaxy: `" + loc[0] + "` Area: `" + loc[2] + "x" + loc[1] + "`\n" + resources["power"].emoji + " Power Gained: " + powerIncreases.attackColony,
								color  : embedColors.blue,
								channel: client.users.get(playerData.userID)
							});
							listOfWaitTimes.splice(i, 1);
						});
					}
					else {
						sendBasicEmbed({
							content: "Attacking the colony at\nGalaxy: `" + colony[0] + "` Area: `" + colony[2] + "x" + colony[1] + "`\nHas failed.\nYou either\nmoved from your spot\nwere under attack",
							color  : embedColors.red,
							channel: client.users.get(player.userID)
						})
						listOfWaitTimes.splice(i, 1);
					}
					break;
				case "research":
					accountData[listOfWaitTimes[i].player][listOfWaitTimes[i].which]++;
					console.log(accountData[listOfWaitTimes[i].player][listOfWaitTimes[i].which]);
					sendBasicEmbed({
						content: "Your research `" + listOfWaitTimes[i].which + "` has finished.",
						color  : embedColors.yellow,
						channel: client.users.get(listOfWaitTimes[i].player)
					});
					listOfWaitTimes.splice(i, 1);
					break;
				case "buildStation":
					if (playerData.didntMove) {
						playerData.stations.push({
							location: playerData.location,
							type    : stations.names[listOfWaitTimes[i].which],
							level   : 0
						});
						map[playerData.location[0]][playerData.location[1]][playerData.location[2]].ownersID = playerData.userID;
						map[playerData.location[0]][playerData.location[1]][playerData.location[2]].item = "station";
						map[playerData.location[0]][playerData.location[1]][playerData.location[2]].type = stations.names[listOfWaitTimes[i].which];

						let powGained = powerIncreases.buildStation;
						if (map[loc[0]][loc[1]][loc[2]].type === "Military Station") {
							powGained = powerIncreases.buildMiltary;
						}
						accountData[listOfWaitTimes[i].player]["power"] += powGained;
						let embed = new Discord.RichEmbed()
							.setDescription("Your " + stations.names[listOfWaitTimes[i].which] + " has finished building.\n" + resources["power"].emoji + " Gained Power: " + powGained)
							.setColor(embedColors.pink);
						client.users.get(listOfWaitTimes[i].player).send({embed});
						listOfWaitTimes.splice(i, 1);
					}
					break;
				case "attackStation":
					if (playerData.didntMove) {
						client.fetchUser(map[loc[0]][loc[1]][loc[2]].ownersID).then(function (user) {
							let powGained = powerIncreases.buildStation;
							let powLost = powerIncreases.attackStation;
							if (map[loc[0]][loc[1]][loc[2]].type === "Military Station") {
								powGained = powerIncreases.buildMiltary;
								powLost = powerIncreases.attackMilitary;
							}
							sendBasicEmbed({
								content: "Your station at\nGalaxy: `" + loc[0] + "` Area: `" + loc[2] + "x" + loc[1] + "`\nHas been destroyed by `" + playerData.username + "`\n" + resources["power"].emoji + " Power lost: " + powLost,
								color  : embedColors.red,
								channel: message.channel
							});
							accountData[user.id]["power"] -= powLost;
							if (accountData[user.id]["power"] < 0) {
								accountData[user.id]["power"] = 0;
							}
							for (let i = 0; i < accountData[map[loc[0]][loc[1]][loc[2]].ownersID].stations.length; i++) {
								if (matchArray(accountData[map[loc[0]][loc[1]][loc[2]].ownersID].stations[i].location, playerData.location, false)) {
									accountData[map[loc[0]][loc[1]][loc[2]].ownersID].stations.splice(i, 1);
								}
							}
							let gained = stations[map[loc[0]][loc[1]][loc[2]].type].destroyBonus;
							let gainedtxt = "```\n" + powGained + " " + resources["power"].emoji + " Power\n";
							playerData["power"] += powGained;
							for (let i = 0; i < gained.length; i++) {
								let stuff = gained[i].split(" ");
								playerData[stuff[0]] += parseInt(stuff[1], 10);
								gainedtxt += stuff[1] + " " + resources[stuff[0]].emoji + " " + stuff[0] + "\n";
							}
							map[loc[0]][loc[1]][loc[2]] = {
								ownersID : null,
								item     : "empty",
								type     : "empty",
								soonOwner: null
							};
							sendBasicEmbed({
								content: "You have destroyed the station at\nGalaxy: `" + loc[0] + "` Area: `" + loc[2] + "x" + loc[1] + "`\nGained Resources " + gainedtxt + "```",
								color  : embedColors.blue,
								channel: client.users.get(playerData.userID)
							});
							listOfWaitTimes.splice(i, 1);
						}).catch(function (err) {
							throw  err;
						});
					}
					else {
						sendBasicEmbed({
							content: "Attacking the station at\nGalaxy: `" + loc[0] + "` Area: `" + loc[2] + "x" + loc[1] + "`\nHas failed.\nYou either\nmoved from your spot\nwere under attack",
							color  : embedColors.red,
							channel: client.users.get(playerData.userID)
						});
						listOfWaitTimes.splice(i, 1);
					}
					break;
				case "heal":
					accountData[listOfWaitTimes[i].player].health = 100;
					accountData[listOfWaitTimes[i].player].healing = false;
					sendBasicEmbed({
						content: "You have finished healing",
						color  : embedColors.green,
						channel: client.users.get(listOfWaitTimes[i].player)
					});
					listOfWaitTimes.splice(i, 1);
					break;
			}
		}
	}

	//if(map[loc[0]][loc[1]][loc[2]].type === "Military Station"){

	//}
	saveJsonFile("./accounts.json");
	saveJsonFile("./factions.json");
	saveJsonFile("./other.json");
	if (!listOfWaitTimes.length) {
		clearInterval(waitTimesInterval);
		waitTimesInterval = false;
	}
}
function createMap(galaxys, xSize, ySize) {
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
				let item = "planet";
				if (planets[planet].name === "empty") {
					item = "empty";
				}
				if (x < 3 && y < 3) {
					yMap.push({
						type     : "Safe Zone",
						item     : "SafeZone",
						ownersID : null,
						soonOwner: null
					})
				}
				else if (x > xSize - 3 && y > ySize - 3) {
					yMap.push({
						type     : "Domination Zone",
						item     : "DominateZone",
						ownersID : null,
						soonOwner: null
					})
				}
				else {
					yMap.push({
						type     : planets[planet].name,
						item     : item,
						ownersID : null,
						soonOwner: null
					});
				}
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
		throw "EMBED MUST HAVE `CONTENT` `COLOR` and `CHANNEL` AND ALL ARGS WAS:\n" + args;
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
	time = parseInt(time, 10);
	let times = [[31557600000000, 0, "millennial"], [3155760000000, 0, "century"], [315576000000, 0, "decade"], [31557600000, 0, "year"], [86400000, 0, "day"], [3600000, 0, "hour"], [60000, 0, "minute"], [1000, 0, "second"], [1, 0, "millisecond"]];
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
			timeLeftText += "`" + times[i][1] + "` " + times[i][2];
			if (times[i][1] > 1) {
				timeLeftText += "s";
			}
			if (i + 2 === times.length) {
				timeLeftText += " and "
			}
			else if (i + 2 !== times.length) {
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
		throw "args.user should be \"user\" or \"bot\"";
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
		"Research Station"             : 0,
		"Metalloid Accelerator"        : 1,
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
				console.log("s" + stat[1] + "g" + GP);
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
function log(msg, message) {
	console.log(msg);
	if (message) {
		sendBasicEmbed({
			content: msg,
			color  : embedColors.blue,
			channel: message.channel
		})
	}
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
const ranks = require("./items.js").ranks;
const powerIncreases = require("./items.js").power;
const embedColors = require("./items").colors;
const createFaction = require("./faction.js");
const planets = require("./items.js").planets;
const resources = require("./items.js").resources;
const stations = require("./items.js").stations;
const researches = require("./items.js").researches;
const reqChecks = {
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
					if (checkPerms({user: "bot", perms: "MANAGE_MESSAGES", message: message})) {
						message.delete();
					}
					return {val: false, msg: "Commands not allowed in that channel", author: true}
				}
			}
			return {val: true, msg: ""}
		}
		return {val: true, msg: ""}
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
			let timeLeft = "Time Remaining: ";
			for (let i = 0; i < listOfWaitTimes.length; i++) {
				if (listOfWaitTimes[i].type === "warp" && listOfWaitTimes[i].player === playerData.userID) {
					timeLeft += getTimeRemaining(Date.now() - listOfWaitTimes[i].expires);
				}
			}
			return {val: false, msg: "You can't be warping to use this command."}
		}
	},
	"healing"          : function (reqArgs, message, args, playerData, prefix) {
		let x = "false";
		if (playerData.healing === true) {
			x = "true";
		}
		if (reqArgs[0] === x) {
			return {val: true, msg: ""}
		}
		else {
			if (reqArgs[0] === "true") {
				return {val: false, msg: "You have to be healing to use this command."}
			}
			return {val: false, msg: "You can't be healing to use this command."}
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
		if (playerData != null) {
			if (reqArgs[0] === "false") {
				return {val: playerData.attacking === false, msg: "You cannot be attacking"}
			}
			else {
				return {val: playerData.attacking === true, msg: "You need be attacking"}
			}
		}
		return {val: false, msg: "You need a profile"}


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
						if (fac.members[i].rank === "owner" || fac.members[i].rank === "mod") {
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
						return {val: fac.members[i].rank === "owner", msg: "You need to be a owner of your faction"};
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
				if (faction.level + 1 < factions.costs.length) {
					let missing = "";
					let stuff = factions.costs[faction.level].split(" ");
					if (faction[stuff[0]] < parseInt(stuff[1], 10)) {
						missing += (parseInt(stuff[1], 10) - faction[stuff[0]]) + " " + resources[stuff[0]].emoji + " " + stuff[0];
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
	"outOfCommision"   : function (reqArgs, message, args, playerData, prefix) {
		return {val: false, msg: "This command is out of service for the moment"}
	}
};
const serverStuff = require("./other.json").serverStuff;
const updateAccount = require("./account.js");
const commands = [
	["HELP"],
	{
		names      : ["help"],
		description: "Basic help for all your command needs.",
		usage      : "help",
		values     : [],
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			if (args.length) {
				let commandIs = null;
				for (let i = 0; i < commands.length; i++) {
					if (!(commands[i] instanceof Array)) {
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

				if (commandIs != null) {
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
				return;
			}
			let txt = "```css\n";
			for (let i = 0; i < commands.length; i++) {
				if (!(commands[i] instanceof Array)) {
					let sendIt = true;
					for (let q = 0; q < commands[i].reqs.length; q++) {
						let typeReq = commands[i].reqs[q].split(" ")[0];
						let reqArgs = commands[i].reqs[q].split(" ");
						reqArgs.shift();
						let reqCheck = reqChecks[typeReq](reqArgs, message, args, playerData, prefix);
						if (!reqCheck.val) {
							sendIt = false;
							break;
						}
					}
					if (sendIt) {
						txt += commands[i].names[0] + "\n";
					}
				}
				else {
					txt += "#" + commands[i][0] + "#\n";
				}
			}
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.blue)
				.setTitle("HELP")
				.setDescription("For more info\n" + prefix + "command [NAME]")
				.addField("COMMANDS", txt + "```")
				.addField("JOIN US", "[INVITE-BOT](https://discordapp.com/oauth2/authorize?client_id=354670433154498560&scope=bot&permissions=67234830)\n[JOIN-OUR-DISCORD](https://discord.gg/J7NkgPZ)");
			message.channel.send({embed});

		}
	},
	{
		names      : ["commands", "command", "coms", "com"],
		description: "Infomation about commands.",
		usage      : "commands [VALUE]",
		values     : ["List", "{COMMAND_NAME}"],
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			if (!args.length) {
				args[0] = "list";
			}
			switch (args[0]) {
				case "list":
					let commandsList = "```markdown\n";
					for (let i = 0; i < commands.length; i++) {
						if (!(commands[i] instanceof Array)) {
							commandsList += commands[i].names[0] + "\n"
						}
						else {
							commandsList += "#" + commands[i][0] + "\n";
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
						content: "Commands sent to your DMs",
						channel: message.channel,
						color  : embedColors.blue
					});
					break;
				default:
					let commandIs = null;
					for (let i = 0; i < commands.length; i++) {
						if (!(commands[i] instanceof Array)) {
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
		names      : ["tags", "tag"],
		description: "get a list of all the tags and their info",
		usage      : "commands [VALUE]",
		values     : ["List", "{COMMAND_NAME}"],
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			if (!args.length) {
				args[0] = "list";
			}
			switch (args[0]) {
				case "list":
					let tagsList = "";
					for (let i = 0; i < commands.length; i++) {
						if (commands[i] instanceof Array) {
							for (let j = 0; j < commands[i].length; j++) {
								tagsList += "`" + commands[i][j] + "` ";
							}
						}
					}
					let embed = new Discord.RichEmbed()
						.setColor(embedColors.blue)
						.setTitle("TAGS'S LIST")
						.setDescription(tagsList)
						.setFooter(prefix + "tag [TAG_NAME]");
					message.author.send({embed});
					if (message.channel.type === "text") {
						sendBasicEmbed({
							content: "tags sent to your DMs",
							channel: message.channel,
							color  : embedColors.blue
						});
					}
					break;
				default:
					let tagIs = null;
					for (let i = 0; i < commands.length; i++) {
						if (commands[i] instanceof Array) {
							for (let j = 0; j < commands[i].length; j++) {
								if (args[0] === commands[i][j].toLowerCase()) {
									tagIs = i;
									break;
								}
							}

						}
						if (tagIs != null) {
							break;
						}
					}

					if (tagIs == null) {
						sendBasicEmbed({
							content: "Invalid Usage\nTry using `" + prefix + "tags list`",
							color  : embedColors.red,
							channel: message.channel
						})
					}
					else {

						let commandsInTag = "```css";
						for (let i = tagIs + 1; i < commands.length; i++) {
							if (commands[i] instanceof Array) {
								break;
							}
							commandsInTag += commands[i].names[0] + "\n"
						}
						for (let i = tagIs; i < commands.length; i++) {
							if (commands[i] instanceof Array) {
								break;
							}
							else if (inTag) {
								commandsInTag += prefix + commands[i].names[0] + "\n"
							}
						}
						let embed = new Discord.RichEmbed()
							.setColor(embedColors.blue)
							.setTitle("COMMANDS IN \"**`" + commands[tagIs][0] + "`**\"")
							.setDescription(commandsInTag + "```");
						message.channel.send({embed});
					}
					break;
			}
		}
	},
	{
		names      : ["version"],
		description: "get the game's current version",
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
		names      : ["upTime"],
		description: "get the amount of time the bot has been up",
		usage      : "upTime",
		values     : [],
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			sendBasicEmbed({
				content: "Galactica has been up for " + getTimeRemaining(Date.now() - upTime),
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
	{
		names      : ["iWantToDeleteMyAccountForever"],
		description: "delete Your account",
		usage      : "delete",
		values     : [],
		reqs       : ["normCommand", "profile true"],
		effect     : function (message, args, playerData, prefix) {
			let nums = playerData.userID;
			let player = playerData;
			if (player.faction != null) {
				let fac = factions[player.faction];
				if (fac) {
					for (let i = 0; i < fac.members.length; i++) {
						if (fac.members[i].id === player.id) {
							if (fac.members[i].rank !== "owner") {
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
					map[loc[0]][loc[1]][loc[2]].type = "empty";
					map[loc[0]][loc[1]][loc[2]].ownersID = null;
				}
			}
			for (let i = 0; i < accountData.names.length; i++) {
				if (accountData.names[i] === player.userID) {
					accountData.names.splice(i, 1);
				}
			}
			let newData = {
				names: accountData.names
			};
			for (let i = 0; i < accountData.names.length; i++) {
				newData[accountData.names[i]] = accountData[accountData.names[i]];
			}
			require("./accounts.json").players = newData;
			accountData = newData;
			saveJsonFile("./accounts.json");

			sendBasicEmbed({
				content: "Deleted your account 😭 please comeback another time",
				color  : embedColors.purple,
				channel: message.channel
			})


		}
	},
	{
		names      : ["tutorial", "tut"],
		description: "get a tutorial for the game",
		usage      : "tutorial",
		values     : [],
		reqs       : ["normCommand", "profile false"],
		effect     : function (message, args, playerData, prefix) {
			let inServer = false;
			if (message.channel.type === "text") {
				if (message.guild.id === "354670066480054272") {
					inServer = true;
				}
			}
			if (inServer) {
				sendBasicEmbed({
					content: "<#374618558153621535>",
					color  : embedColors.blue,
					channel: message.channel
				})
			}
			else {
				fs.readFile("./tut.txt", "utf8", function (err, data) {
					let msg = data.split("???///breakpoint\\\\\\???");

				});
				if (message.channel.type === "text") {
					sendBasicEmbed({
						content: "Sent to DM's"
					})
				}
			}
		}
	},
	{
		names      : ["leaderboard", "highscores", "lb"],
		description: "get a leaderboard of everyone's power",
		usage      : "leaderboard",
		values     : [],
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			let lb = [];
			for (let i = 0; i < accountData.names.length; i++) {
				let player = accountData[accountData.names[i]];
				if (player["power"] > 0) {
					if (lb.length) {
						for (let j = 0; j < lb.length; j++) {
							if (player["power"] > lb[j]) {
								lb.splice(j, 0, [player.username, player["power"]]);
							}
						}
					}
					else {
						lb.push([player.username, player["power"]]);
					}
				}
				if (lb.length > 10) {
					lb.pop();
				}
			}
			let lbText = "```css\n";
			for (let i = 0; i < lb.length; i++) {
				lbText += spacing("[" + (i + 1) + "]" + lb[i][0], lb[i][1] + " power\n", 30);
			}
			sendBasicEmbed({
				content: "Galactica's leaderboard of power is " + lbText + "```",
				color  : embedColors.purple,
				channel: message.channel
			})
		}
	},

	["GAMEPLAY", "MAIN"],
	{
		names      : ["stats", "me", "info", "status"],
		description: "Get your stats or someone else's stats",
		usage      : "stats (VALUE)",
		values     : ["{@USER}", "PLAYER_ID"],
		reqs       : ["normCommand", "profile true"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			let player = playerData;
			if (nums.length) {
				if (accountData[nums[0]] != null) {
					player = accountData[nums[0]];
				}
			}
			let embed = new Discord.RichEmbed()
				.setFooter(player.userID)
				.setColor(embedColors.blue)
				.setTitle(player.username + "'s stats");

			let location = "";
			if (player.location instanceof Array) {
				location = "Galaxy `" + (player.location[0] + 1) + "` Area: `" + (player.location[2] + 1) + "x" + (player.location[1] + 1) + "`";
				if (player.isInSafeZone[0]) {
					location += "\nCurrently in the Safe Zone"
				}
				else if (player.isDominating[0]) {
					location += "\nCurrently in the Domination Zone"
				}
			}
			else {
				location = player.location;
			}
			if (player.faction !== null) {
				embed.addField("INFO:", "Faction:" + factions[player.faction].name + "\n" + resources["power"].emoji + " Power: " + player["power"] + "\nHealth:" + player.health + "\n**Location:**\n" + location);
			}
			else {
				embed.addField("INFO:", "Power: 000\nLocation:\n" + location);
			}

			let playerResources = "```css\n";
			let spaceLength = 1;
			for (let i = 0; i < resources.names.length - 1; i++) {
				let len = "" + player[resources.names[i]];
				if (len.length > spaceLength) {
					spaceLength = len.length;
				}
			}
			for (let i = 0; i < resources.names.length - 1; i++) {
				let space = "";
				let len = "" + player[resources.names[i]];
				for (let j = 0; j < spaceLength - len.length; j++) {
					space += " ";
				}
				playerResources += player[resources.names[i]] + space + "| " + resources[resources.names[i]].emoji + " " + resources.names[i];
				playerResources += "\n";
			}
			embed.addField("Resources", playerResources + "```");
			message.channel.send({embed});
		}
	},
	{
		names      : ["warp", "go"],
		description: "warp to somewhere",
		usage      : "warp [VALUE]",
		values     : ["{GALAXY}", "{X} {Y}", "{GALAXY} {X} {Y}"],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false", "healing false"],
		effect     : function (message, args, playerData, prefix) {

			let numbers = getNumbers(message.content);
			let warpType, goToPos = [];
			goToPos[0] = playerData.location[0];
			goToPos[1] = playerData.location[1];
			goToPos[2] = playerData.location[2];

			switch (numbers.length) {
				default:
					warpType = "Invalid";
					break;
				case 1:
					warpType = "galaxy";
					goToPos[0] = parseInt(numbers[0], 10) - 1;
					if (goToPos[0] >= map.length) {
						warpType = "Invalid";
					}
					break;
				case 2:
					warpType = "positionBase";
					goToPos[2] = parseInt(numbers[0], 10) - 1;
					goToPos[1] = parseInt(numbers[1], 10) - 1;
					let valid = false;

					if (goToPos[1] >= 0) {
						if (goToPos[1] <= map[goToPos[0]].length) {
							if (goToPos[2] >= 0) {
								if (goToPos[2] <= map[goToPos[0]][goToPos[1]].length) {
									valid = true;
								}
							}
						}
					}
					if (!valid) {
						warpType = "Invalid";
					}
					break;
				case 3:
					warpType = "galaxyAndPosition";
					goToPos[0] = parseInt(numbers[0], 10) - 1;
					goToPos[2] = parseInt(numbers[1], 10) - 1;
					goToPos[1] = parseInt(numbers[2], 10) - 1;
					if (goToPos[0] >= map.length) {
						warpType = "Invalid";
					}
					if (goToPos[1] >= map[goToPos[0]].length) {
						warpType = "Invalid";
					}
					if (goToPos[2] >= map[goToPos[0]][goToPos[1]].length) {
						warpType = "Invalid";
					}
					break;
			}
			if (warpType === "Invalid") {
				sendBasicEmbed({
					content: "Invalid usage!\nEither\n```fix\nYou didn't put in the position to warp to\nThe position doesnt exist on the map.```",
					color  : embedColors.red,
					channel: message.channel
				})
			}
			else {
				let rank = 0;
				for (let i = 0; i < ranks.names.length; i++) {
					if (ranks.names[i].toLowerCase() === playerData.rank.toLowerCase()) {
						rank = i;
						break;
					}
				}
				if (goToPos[0] >= ranks[ranks.names[rank]].min && goToPos[0] < ranks[ranks.names[rank]].max) {
					playerData.didntMove = false;
					let timeUntilFinishedWarping = 0;
					if (goToPos[1] + 1 > playerData.location[1]) {
						timeUntilFinishedWarping += ((goToPos[1] + 1) - playerData.location[1]) * timesTake.warpPerPosition;
					}
					else {
						timeUntilFinishedWarping += (playerData.location[1] + (goToPos[1] + 1)) * timesTake.warpPerPosition;
					}
					if (goToPos[2] + 1 > playerData.location[2]) {
						timeUntilFinishedWarping += ((goToPos[2] + 1) - playerData.location[2]) * timesTake.warpPerPosition;
					}
					else {
						timeUntilFinishedWarping += (playerData.location[2] + (goToPos[2] + 1)) * timesTake.warpPerPosition;
					}
					if (warpType !== "positionBase") {
						timeUntilFinishedWarping += 60000 * 5;//5 mins if its a galaxy warp
					}
					timeUntilFinishedWarping -= Math.round((playerData["HyperDrive Generator"] / timeUntilFinishedWarping) * 100);
					listOfWaitTimes.push({
						player : playerData.userID,
						expires: Date.now() + timeUntilFinishedWarping,
						headTo : goToPos,
						type   : "warp"
					});
					if (!waitTimesInterval) {
						waitTimesInterval = setInterval(checkWaitTimes, 1000);//once every second
					}
					playerData.location = "Warping to Galaxy: `" + (goToPos[0] + 1) + "` Area: `" + (goToPos[2] + 1) + "x" + (goToPos[1] + 1) + "`";
					sendBasicEmbed({
						content: "Warping will take approximately: " + getTimeRemaining(timeUntilFinishedWarping),
						color  : embedColors.blue,
						channel: message.channel
					});
					playerData.isDominating = false;
					playerData.isInSafeZone = false;
				}
				else {
					sendBasicEmbed({
						content: "Your rank: `" + playerData.rank + "` Only allows you to be in the Galaxy's `" + (ranks[ranks.names[rank]].min + 1) + "` through `" + ranks[ranks.names[rank]].max + "`\nMake sure your warping to one of those Galaxy's",
						color  : embedColors.blue,
						channel: message.channel
					})
				}
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
			let theitem = "";
			if (loc.item === "planet") {
				theitem = "Planet"
			}
			else if (loc.item === "empty") {
				theitem = "Space";
			}
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.blue)
				.setTitle("Location:")
				.setDescription("Galaxy: `" + (pos[0] + 1) + "` Area: `" + (pos[2] + 1) + "x" + (pos[1] + 1) + "`\nYou're at a " + loc.type + " " + theitem);


			let item = "Empty Space";
			let info = "Unoccupied";
			let attack = "Attack this " + loc.item + " via `" + prefix + "attack" + loc.item + "`";
			let moreInfo = "";
			if (loc.type.toLowerCase() !== "empty" && loc.item.toLowerCase() !== "empty") {
				item = loc.type;
				if (loc.ownersID !== null) {
					info = "Owned by " + accountData[loc.ownersID].username;
					if (loc.ownersID === playerData.userID) {
						info = "Owned by You";
						attack = "";
					}
				}
				if (loc.item.toLowerCase() === "station") {
					let station = null;
					for (let i = 0; i < accountData[loc.ownersID].stations.length; i++) {
						if (matchArray(playerData.location, accountData[loc.ownersID].stations[i].location, false)) {
							station = accountData[loc.ownersID].stations[i];
						}
					}
					if (station !== null) {
						embed.addField("Information", info + "\n```css\nLevel: " + station.level + "\nDoes: " + stations[loc.type].description + "```" + attack);
					}
				}
				else {
					let Bonuses = "";
					let Rates = "";
					console.log(loc);
					for (let i = 0; i < planets[loc.type].bonuses.length; i++) {
						Bonuses += planets[loc.type].bonuses[i][0] + "\n";
					}
					for (let i = 0; i < planets[loc.type].generatesRates.length; i++) {
						let stuff = planets[loc.type].generatesRates[i].split(" ");
						if (stuff.length > 2) {
							Rates += " + " + stuff[1] + resources[stuff[0]].emoji + " " + stuff[0] + " Per " + stuff[3] + " people\n";
						}
						else {
							Rates += " + " + stuff[1] + "% more " + resources[stuff[0]].emoji + stuff[0] + " Generation.";
						}
					}
					for (let i = 0; i < planets[loc.type].loseRates.length; i++) {
						let stuff = planets[loc.type].loseRates.split(" ");
						if (stuff.length > 2) {
							Rates += " - " + stuff[1] + resources[stuff[0]].emoji + " " + stuff[0] + " Per " + stuff[3] + " people\n";
						}
						else {
							Rates += " - " + stuff[1] + "% more " + resources[stuff[0]].emoji + stuff[0] + " Consumption.";
						}
					}

					if (Rates.length) {
						embed.addField("Generation Rates", "```diff\n" + Rates + "```");
					}
					if (Bonuses.length) {
						if (loc.item === "planet") {
							attack = "";
						}
						embed.addField("Bonuses", "```fix\n" + Bonuses + "```" + attack);
					}
					if (planets[loc.type].inhabitedMax === 0) {
						embed.setFooter("Uninhabitable");
					}
					else {
						embed.setFooter("Habitable");
					}
				}
			}
			let otherPlayers = [];
			for (let i = 0; i < accountData.names.length; i++) {
				let player = accountData[accountData.names[i]];
				if (player.userID !== playerData.userID) {
					if (matchArray(playerData.location, player.location, false)) {
						otherPlayers.push(player);
					}
				}
			}
			if (otherPlayers.length) {
				let txt = "ID|NAME---|FACTION|HP|\n```css\n";
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
					let space = "";
					if (i + 1 < 10) {
						space += " ";
					}
					txt += "[" + (i + 1) + space + "]|" + name + spaceName + "|" + spaceFaction + otherPlayers[i].health + "|\n";
				}
				embed.addField("Players", txt + "```\nAttack a player via `attackPlayer [ID]`");
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
			let mess = null;
			let embed = new Discord.RichEmbed()
				.setDescription("```fix\nLoading...\nPlease give the bot some time```")
				.setColor(embedColors.blue);
			message.channel.send({embed}).then(function (m) {
				mess = m;
			});
			function doFun(num) {
				fs.exists("TheImages/mapImage" + playerData.userID + ".png", function (exists) {
					go = exists;
				});
				if (go) {
					message.channel.stopTyping(true);
					let emb = new Discord.RichEmbed()
						.setColor(embedColors.blue)
						.setDescription("Scanned")
						.attachFile("./TheImages/mapImage" + playerData.userID + ".png")
						.setImage("attachment://mapImage" + playerData.userID + ".png");
					message.channel.send({embed: emb}).then(function () {
						fs.unlink("TheImages/mapImage" + playerData.userID + ".png");
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
			}

			setTimeout(function () {
				doFun(1);
			}, 1000);
			message.channel.startTyping();
			let loc = playerData.location;
			let m = map[loc[0]];
			let size = mainSize / (m.length + 1);

			let done = [];
			let playersVision = 3;
			playersVision += playerData["Eagle Eyed"];
			if (typeof playersVision !== "number") {
				playersVision = 3;
			}
			let canShowFunc = function (y, x) {
				let theMap = map[playerData.location[0]];

				let found = false;
				let checkIfCanBe = function (x, y, dis) {
					let theMap = map[playerData.location[0]];
					if (x < 0 || y < 0 || y + 1 > theMap.length || x + 1 > theMap[y].length) {
						return;
					}
					if (matchArray([playerData.location[0], y, x], playerData.location, false) && dis <= playersVision) {
						found = true;
					}
					if (theMap[y][x].ownersID != null) {
						if (theMap[y][x].ownersID === playerData.userID) {

							if (theMap[y][x].type.toLowerCase() === "military station") {
								for (let i = 0; i < playerData.stations.length; i++) {
									let stats = playerData.stations[i];
									if (matchArray([playerData.location[0], y, x], stats.location)) {
										if (stats.level + 1 >= dis) {
											found = true;
										}
									}
								}
							}
							else if (theMap[y][x].item === "station") {
								if (dis <= 1) {
									found = true;
								}
							}
							else if (theMap[y][x].item === "colony") {
								if (dis <= 1) {
									found = true;
								}
							}

						}
					}
				};
				checkIfCanBe(x, y, 0);
				for (let i = 0; i < 4; i++) {
					for (let j = 0; j <= 4 - i; j++) {
						checkIfCanBe(x + j, y + i, i + j);
						checkIfCanBe(x - j, y + i, i + j);
						checkIfCanBe(x + j, y - i, i + j);
						checkIfCanBe(x - j, y - i, i + j);

						checkIfCanBe(x + i, y + j, i + j);
						checkIfCanBe(x - i, y + j, i + j);
						checkIfCanBe(x + i, y - j, i + j);
						checkIfCanBe(x - i, y - j, i + j);
					}
				}
				return found;
			};
			let setImage = function (y, x, which, newimage) {
				Jimp.read(which, function (err, image) {
					if (err) throw err;
					image.resize(size, size);
					newimage.composite(image, (x + 1) * size, (y + 1) * size);
					done[y][x] = true;
				});
			};
			let image = new Jimp(mainSize, mainSize, function (err, newimage) {
				for (let i = 0; i < m.length; i++) {
					done.push([]);
					for (let j = 0; j < m[i].length; j++) {
						let folder = "";
						let who = "";
						let typeImage = m[i][j].type;

						done[i].push(false);
						let canShow = canShowFunc(i, j);

						if (canShow) {
							if (m[i][j].type !== "empty") {
								if (m[i][j].ownersID !== null) {
									if (m[i][j].ownersID === playerData.userID) {
										who = "You";
									}
									if (playerData.faction != null) {
										let fac = factions[playerData.faction];
										if (fac) {
											let found = false;
											for (let f = 0; f < fac.members.length; f++) {
												if (m[i][j].ownersID === fac.members[i]) {
													found = true;
													break;
												}
											}
											if (found) {
												who = "Faction";

											}
											else {
												who = "Enemy";
											}
										}
									}
									else {
										who = "Enemy";
									}
									folder = m[i][j].item + "s";
									if (m[i][j].item === "colony") {
										folder = "planets"
										typeImage = m[i][j].type + "Planet";
									}
								}
								else {
									if (m[i][j].item === "planet") {
										folder = "planets";
										who = "Neutral";
										typeImage = m[i][j].type + "Planet";
									}
									else {
										folder = "Other";
										who = "Items";
										typeImage = m[i][j].type
									}
								}
							}
							if (!folder.length) {
								folder = "Other";
								who = "items";
								typeImage = "EmptySpace";
							}
						}
						else {
							folder = "Other";
							who = "items";
							typeImage = "Unknown";
						}

						setImage(i, j, "TheImages/" + folder + "/" + who + "/" + typeImage + ".png", newimage);
					}
				}
				done.push([]);
				done[m.length].push(false);
				for (let q = 0; q < accountData.names.length; q++) {
					let loc2 = accountData[accountData.names[q]].location;
					if (loc2[0] === playerData.location[0] && accountData[accountData.names[q]].userID !== playerData.userID) {
						if (canShowFunc(loc2[1], loc2[2])) {
							if (loc[1] === playerData.location[1] && loc[2] === playerData.location[2]) {
								somethingUnder = true;
							}
							setImage(loc2[1], loc2[2], "TheImages/Other/items/Player.png", newimage);
						}
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
						newimage.write("TheImages/mapImage" + playerData.userID + ".png");
					}
					else {
						setTimeout(function () {
							doFun();
						}, 1000)
					}
				}

				done[loc[1]][loc[2]] = false;
				setTimeout(function () {
					doFun();
				}, 1000);
				Jimp.read("./TheImages/Other/items/GridLines.png", function (err, image) {
					if (err) throw err;
					image.resize(mainSize, mainSize);
					newimage.composite(image, 0, 0);
					done[m.length][0] = true;
					done[loc[1]][loc[2]] = false;
					setImage(loc[1], loc[2], "TheImages/Other/items/You.png", newimage);
				});
			});
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
				let newArgs = [];
				for (let i = 0; i < researches.names.length; i++) {
					let name = researches.names[i].split(" ");
					let found = matchArray(newArgs, name);
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
			if (!args.length) {
				args = ["list"];
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
						let level = playerData[researches.names[i]] || 0;
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
							let researchTime = item.timesToResearch[level];
							researchTime -= Math.round(((playerData["Scientific Labs"] * 5) / researchTime) * 100);
							listOfWaitTimes.push({
								expires: Date.now() + researchTime,
								type   : "research",
								player : playerData.userID,
								which  : researches.names[number]
							});
							embed.setDescription("Researching `" + researches.names[number] + "`...\nWill take about " + getTimeRemaining(researchTime) + "\nCosts: " + item.costs[level] + "💡 Research");
						}
						else {
							embed.setDescription("Not enough 💡 research.");
							embed.setColor(embedColors.red);
							return;
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
		values     : ["@player", "PLAYERS_ID", "LOOK_ID"],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(args[0], false);
			let defender = null;
			if (nums.length) {
				if (nums.length < 3) {
					let numbers = parseInt(nums[0], 10);
					if (numbers > 0) {
						let otherPlayers = [];
						for (let i = 0; i < accountData.names.length; i++) {
							if (matchArray(accountData[accountData.names[i]].location, playerData.location, false)) {
								if (accountData.names[i] !== playerData.userID) {
									otherPlayers.push(accountData.names[i]);
								}
							}
						}
						if (otherPlayers[numbers - 1] != null) {
							defender = accountData[otherPlayers[numbers - 1]];

						}
						else {
							sendBasicEmbed({
								content: "There is no player with that id.\nCheck `" + prefix + "lookAround` again",
								color  : embedColors.red,
								channel: message.channel
							});
						}
					}
				}
				else {
					if (accountData[nums[0]] != null) {
						defender = accountData[nums[0]];
					}
					else {
						sendBasicEmbed({
							content: "Invalid Player ID",
							color  : embedColors.red,
							channel: message.channel
						});
					}

				}
			}
			else {
				sendBasicEmbed({
					content: "You have to include the player's id.\nFound via `" + prefix + "lookAround`",
					color  : embedColors.red,
					channel: message.channel
				});
			}
			if (defender) {
				if (!defender.healing || defender.isInSafeZone) {
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
						content: "You are un able to attack this player.",
						color  : embedColors.red,
						channel: message.channel
					})
				}
			}
		}
	},
	{
		names      : ["removeMy", "remove"],
		description: "remove a station or colony",
		usage      : "removeMy [VALUE]",
		values     : ["\"station\" [ID]", "\"colony\" [ID]"],
		reqs       : ["normCommand", "profile", "attacking false", "warping false"],
		effect     : function (message, args, playerData, prefix) {
			sendBasicEmbed({
				content: "WIP",
				color  : embedColors.red,
				channel: message.channel
			})
		}
	},
	{
		names      : ["heal"],
		description: "heal yourself",
		usage      : "heal",
		values     : [],
		reqs       : ["normCommand", "profile true", "attacking false", "warping false", "healing false"],
		effect     : function (message, args, playerData, prefix) {
			if (playerData.health < 100) {
				playerData.healing = true;
				listOfWaitTimes.push({
					player : playerData.userID,
					expires: Date.now() + (100 - playerData.health) * 60000,
					type   : "heal"
				});
				sendBasicEmbed({
					content: "Healing started. will take\n" + getTimeRemaining((100 - playerData.health) * 60000),
					color  : embedColors.red,
					channel: message.channel
				})
			}
			else {
				sendBasicEmbed({
					content: "You are at full health already.",
					color  : embedColors.red,
					channel: message.channel
				})
			}
		}
	},

	["RESOURCES", "ITEMS", "SHOP"],
	{
		names      : ["collect"],
		description: "collect resources from your stations and colonies",
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
			if (playerData.lastCollection + timesTake.collectionRate > Date.now()) {
				sendBasicEmbed({
					content: "You can only collect once every " + getTimeRemaining(timesTake.collectionRate) + "\nYou currently need to wait:\n" + getTimeRemaining((playerData.lastCollection + (60000 * 5)) - Date.now()),
					channel: message.channel,
					color  : embedColors.red
				});
				canContinue = false;
			}
			if (canContinue) {
				let max = false;
				let amount = Math.round((Date.now() - playerData.lastCollection) / timesTake.collectionRate);//multiplied amount 5 minutes is normal(1) and 10 is doubled(2) (ETC)
				let oldAmount = null;
				let maxAmount = Math.round(((playerData["Super Resource Containers"] * 10) / amount) * 100);
				if (amount + maxAmount > timesTake.collectionMax / 60000) {
					max = true;
					oldAmount = amount;
					amount = timesTake.collectionMax / 60000;
				}
				playerData.lastCollection = Date.now();
				let gainedResources = {};//amount of resources gained
				let bonusResourcesPlanet = {};//amount of bonus resources gained from planets
				let bonusResourcesResearch = {};//amount of bonus resources gained from research
				let colonyResources = {};
				for (let i = 0; i < resources.names.length - 1; i++) {
					gainedResources[resources.names[i]] = 0;
					bonusResourcesPlanet[resources.names[i]] = 0;
					bonusResourcesResearch[resources.names[i]] = 0;
					colonyResources[resources.names[i]] = 0;
				}
				for (let i = 0; i < playerData.stations.length; i++) {
					let station = stations[playerData.stations[i].type];

					let planetBonus = 0;
					let borders = getBorders(playerData.stations[i].location);
					for (let bor = 0; bor < borders.length; bor++) {
						let planet = planets[borders[bor]];
						if (planet != null) {
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
					}
					for (let j = 0; j < station.gives[playerData.stations[i].level].length; j++) {
						let stuff = station.gives[playerData.stations[i].level][j].split(" ");

						if (parseInt(stuff[1], 10) < 0) {
							if (playerData[stuff[0]] + parseInt(stuff[1], 10) * amount < 0 || playerData[stuff[0]] - parseInt(stuff[1], 10) * amount < 0) {
								break;
							}
						}

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
				for (let i = 0; i < playerData.colonies.length; i++) {
					let colony = playerData.colonies[i];
					let planet = planets[playerData.colonies[i].type];
					let amoPpl = 1 + Math.round(amount / 2 - 0.1);
					if (colony.people + amoPpl < colony.maxPeople) {
						playerData.colonies[i].people += amoPpl;
						colonyResources["people"] += amoPpl;
					}
					else {
						colonyResources["people"] += colony.maxPeople - colony.people;
						playerData.colonies[i].people = colony.maxPeople;
					}
					for (let j = 0; j < planet.generatesRates.length; j++) {
						let stuff = planet.generatesRates[j].split(" ");
						if (stuff[0] === "people") {
							let extra = Math.round(parseInt(stuff[1], 10) * (amoPpl / 100)) * amount
							if (extra > 0) {
								if (colony.people + extra < colony.maxPeople) {
									playerData.colonies[i].people += extra;
									colonyResources["people"] += extra;
								}
								else {
									colonyResources["people"] += colony.maxPeople - colony.people;
									playerData.colonies[i].people = colony.maxPeople;
								}
							}
						}
						else {
							if (stuff[2] === "perPerson") {
								let amoItems = Math.round(colony.people / parseInt(stuff[3], 10));
								playerData[stuff[0]] += amoItems;
								colonyResources += amoItems;
							}
						}
					}

					if (colony.people < colony.inhabitedMax) {
						if (colony.people + amount < colony.inhabitedMax) {
							colonyResources["people"] += amount;
							playerData.colonies[i].people += amount;
						}
						else {
							colonyResources["people"] += colony.inhabitedMax - colony.people;
							playerData.colonies[i].people = colony.inhabitedMax;
						}

					}

				}
				/**LongestSpace makes sure all the resources TEXT is evenly spaced even with double digits**/
				let longestSpace = [0, 0, 0, 0];
				for (let i = 0; i < resources.names.length - 1; i++) {
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
					if (colonyResources[resources.names[i]] != null) {
						if (("" + colonyResources[resources.names[i]]).length > longestSpace[3]) {
							longestSpace[3] = ("" + colonyResources[resources.names[i]]).length;
						}
					}
				}

				/**Create the gained resources text**/
				let normalResourcesText = "Nothing...";
				let bonusResourceTextFromResearch = "";
				let bonusResourceTextFromPlanets = "";
				let resourcesFromColonyText = "";
				for (let i = 0; i < resources.names.length - 1; i++) {
					if (gainedResources[resources.names[i]] != null) {
						let space = "";
						if (gainedResources[resources.names[i]] > 0) {
							if (normalResourcesText === "Nothing...") {
								normalResourcesText = "";
							}
							for (let j = 0; j < longestSpace[0] - ("" + gainedResources[resources.names[i]]).length; j++) {
								space += " "
							}
							normalResourcesText += gainedResources[resources.names[i]] + space + " | " + resources[resources.names[i]].emoji + " " + resources.names[i] + "\n";
						}
					}
					if (bonusResourcesPlanet[resources.names[i]] != null) {
						let space = "";
						if (bonusResourcesPlanet[resources.names[i]] > 0) {
							for (let j = 0; j < longestSpace[1] - ("" + bonusResourcesPlanet[resources.names[i]]).length; j++) {
								space += " "
							}

							bonusResourceTextFromPlanets += bonusResourcesPlanet[resources.names[i].toLowerCase()] + space + " | " + resources[resources.names[i]].emoji + " " + resources.names[i] + "\n";
						}
					}
					if (bonusResourcesResearch[resources.names[i]] != null) {
						let space = "";
						if (bonusResourcesResearch[resources.names[i]] > 0) {
							for (let j = 0; j < longestSpace[2] - ("" + bonusResourcesResearch[resources.names[i]]).length; j++) {
								space += " "
							}
							bonusResourceTextFromResearch += bonusResourcesResearch[resources.names[i]] + space + " | " + resources[resources.names[i]].emoji + " " + resources.names[i] + "\n";
						}
					}
					if (colonyResources[resources.names[i]] != null) {
						let space = "";
						if (colonyResources[resources.names[i]] > 0) {
							for (let j = 0; j < longestSpace[3] - ("" + colonyResources[resources.names[i]]).length; j++) {
								space += " "
							}
							resourcesFromColonyText += colonyResources[resources.names[i]] + space + " | " + resources[resources.names[i]].emoji + " " + resources.names[i] + "\n";
						}
					}
				}

				//send the embed
				let embed = new Discord.RichEmbed()
					.setColor(embedColors.pink)
					.setTitle("Current Collection");
				if (!max) {
					embed.setDescription("You have waited " + (amount * 5) + " minutes so your collection is multiplied by `" + amount + "`")
				}
				else {
					embed.setDescription("You have waited " + (oldAmount * 5) + " minutes! \nYour stations had stop collecting resources a while ago as they can only hold up to " + getTimeRemaining(timesTake.collectionMax) + "  worth of resources");
				}
				embed.addField("Normal Resources", normalResourcesText, true);

				if (bonusResourceTextFromPlanets.length) {
					embed.addField("Bonus Resources from planets", bonusResourceTextFromPlanets, true);
				}
				if (bonusResourceTextFromResearch.length) {
					embed.addField("Bonus Resources from researches", bonusResourceTextFromResearch, true);
				}
				if (resourcesFromColonyText.length) {
					embed.addField("Total colonies populations gains:", resourcesFromColonyText, true);
				}


				for (let i = 0; i < resources.names.length - 1; i++) {
					if (playerData[resources.names[i]] < 0) {
						playerData[resources.names[i]] = 0;
					}
				}

				message.channel.send({embed});
			}
		}
	},
	{
		names      : ["resources", "shop"],
		description: "get a list of all the resource's",
		usage      : "resources",
		values     : [],
		reqs       : ["normCommand"],
		effect     : function (message, args, playerData, prefix) {
			let list = "```css\n";
			for (let i = 0; i < resources.names.length - 1; i++) {
				list += resources[resources.names[i]].emoji + "  " + resources.names[i] + "\n"
			}
			sendBasicEmbed({
				content: "Resources List\n" + list + "```",
				color  : embedColors.purple,
				channel: message.channel
			})
		}
	},
	{
		names      : ["buy"],
		description: "Buy something or get the list of what you can buy",
		usage      : "buy [VALUE]",
		values     : ["\"List\"", "{ITEM} (AMOUNT)"],
		reqs       : ["normCommand", "profile true", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			if (!args.length) {
				args[0] === "list";
			}
			switch (args[0]) {
				case "list":
					let list = "```css\n";
					for (let i = 0; i < resources.names.length - 1; i++) {
						list += spacing(resources[resources.names[i]].emoji + " " + resources.names[i], resources[resources.names[i]].buyRate + "\n", 30);
					}
					sendBasicEmbed({
						content: list + "```",
						color  : embedColors.blue,
						channel: message.channel
					});
					break;
				default:
					let valid = false;
					for (let i = 0; i < resources.names.length - 1; i++) {
						if (resources.names[i] === args[0]) {
							valid = true;
							break;
						}
					}
					if (valid) {
						let nums = getNumbers(message.content);
						let amount = 1;
						if (nums.length) {
							amount = parseInt(nums[0], 10);
						}
						if (playerData["credits"] >= resources[args[0]].buyRate * amount) {
							playerData[args[0]] += amount;
							playerData["credits"] -= resources[args[0]].buyRate * amount;
							sendBasicEmbed({
								content: "Bought `" + amount + "` " + resources[args[0]].emoji + " " + args[0] + "\nLost: `" + (resources[args[0]].buyRate * amount) + "` " + resources["credits"].emoji + " credits.",
								color  : embedColors.blue,
								channel: message.channel
							});
						}
						else {
							sendBasicEmbed({
								content: "You dont have enough " + resources["credits"].emoji + " credits for `" + amount + "` " + resources[args[0]].emoji + " " + args[0] + "!\nMissing `" + (playerData["credits"] - resources[args[0]].buyRate * amount) + " " + resources["credits"].emoji + " credits",
								color  : embedColors.red,
								channel: message.channel
							});
						}
					}
					else {
						sendBasicEmbed({
							content: "Invalid Usage.\nWe don't know what resource `" + args[0] + "` is",
							color  : embedColors.red,
							channel: message.channel
						});
					}
					break;
			}
		}
	},
	{
		names      : ["sell"],
		description: "Sell something or the the list of what you can sell",
		usage      : "sell [VALUE]",
		values     : ["\"List\"", "{ITEM} (AMOUNT)"],
		reqs       : ["normCommand", "profile true", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			if (!args.length) {
				args[0] === "list";
			}
			switch (args[0]) {
				case "list":
					let list = "```css\n";
					for (let i = 0; i < resources.names.length - 1; i++) {
						list += spacing(resources[resources.names[i]].emoji + " " + resources.names[i], resources[resources.names[i]].sellRate + "\n", 30);
					}
					sendBasicEmbed({
						content: list + "```",
						color  : embedColors.blue,
						channel: message.channel
					});
					break;
				default:
					let valid = false;
					for (let i = 0; i < resources.names.length - 1; i++) {
						if (resources.names[i] === args[0]) {
							valid = true;
							break;
						}
					}
					if (valid) {
						let nums = getNumbers(message.content);
						let amount = 1;
						if (nums.length) {
							amount = parseInt(nums[0], 10);
						}
						if (playerData[args[0]] >= amount) {
							playerData[args[0]] -= amount;
							playerData["credits"] += resources[args[0]].sellRate * amount
							sendBasicEmbed({
								content: "sold `" + amount + "` " + resources[args[0]].emoji + " " + args[0] + "\nGained: `" + (resources[args[0]].sellRate * amount) + "` " + resources["credits"].emoji + " credits.",
								color  : embedColors.blue,
								channel: message.channel
							});
						}
						else {
							sendBasicEmbed({
								content: "You dont have `" + amount + "` " + resources[args[0]].emoji + " " + args[0] + "!",
								color  : embedColors.red,
								channel: message.channel
							});
						}
					}
					else {
						sendBasicEmbed({
							content: "Invalid Usage.\nWe don't know what resource `" + args[0] + "` is",
							color  : embedColors.red,
							channel: message.channel
						});
					}
					break;
			}
		}
	},

	["PLANETS", "PLANET"],
	{
		names      : ["colonize", "colo"],
		description: "colonize a planet",
		usage      : "colonize",
		values     : [],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			const freeColony = playerData.colonies.length === 0;
			let loc = playerData.location;
			let mapSpot = map[loc[0]][loc[1]][loc[2]];
			let isValid = mapSpot.item.toLowerCase() === "planet";
			if (isValid) {
				if (mapSpot.ownersID === null) {
					playerData.didntMove = true;
					listOfWaitTimes.push({
						player : playerData.userID,
						expires: Date.now() + timesTake.colonize,
						type   : "colonization",
						at     : playerData.location
					});
					let loc = playerData.location;
					map[loc[0]][loc[1]][loc[2]].item = "colonizing";
					map[loc[0]][loc[1]][loc[2]].soonOwner = playerData.userID;
					if (!waitTimesInterval) {
						waitTimesInterval = setInterval(checkWaitTimes, 1000);//once every second
					}
					let embed = new Discord.RichEmbed()
						.setDescription("You are colonizing a `" + mapSpot.type + "` planet.\nThis will take " + getTimeRemaining(timesTake.colonize) + " to complete.")
						.setColor(embedColors.blue);
					if (freeColony) {
						embed.addField("FREE COLONY", "As this is your first station. Your colony is free of charge");
					}
					else {
						embed.addField("LOST RESOURCES", Math.round(planets[map[loc[0]][loc[1]][loc[2]].type].inhabitedMax / 10) + " " + resources["food"].emoji + " food");
					}
					message.channel.send({embed});
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
				if (mapSpot.item === "colonizing") {
					sendBasicEmbed({
						content: "Someone's already colonizing this.",
						color  : embedColors.red,
						channel: message.channel
					});
				}
				else {
					sendBasicEmbed({
						content: "You are not on a planet.",
						color  : embedColors.red,
						channel: message.channel
					});
				}
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
				let space = "";
				if (colonies[i].people < 100) {
					space += " ";
					if (colonies.people < 10) {
						space += " "
					}
				}
				txt += spacing("[" + (i + 1) + "] " + colonies[i].people + space + " | " + colonies[i].type, "Galaxy: " + (colonies[i].location[0] + 1) + "  Area: " + (colonies[i].location[2] + 1) + " x " + (colonies[i].location[1] + 1), 50);
				txt += "\n";
			}
			txt += "```";
			if (!colonies.length) {
				txt = "You currently don't have any colonies";
			}
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.pink)
				.setTitle("[ID]-PEOPLE--NAME-------------------LOCATION")
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
			let loc = playerData.location;
			let mapSpot = map[loc[0]][loc[1]][loc[2]];
			if (mapSpot.item === "colony") {
				playerData.didntMove = true;
				if (mapSpot.ownersID !== null) {
					if (mapSpot.ownersID !== playerData.userID) {
						playerData.didntMove = true;
						listOfWaitTimes.push({
							player : playerData.userID,
							expires: Date.now() + timesTake.attackColony,
							type   : "attackColony",
							at     : playerData.location
						});
						let loc = playerData.location;
						if (!waitTimesInterval) {
							waitTimesInterval = setInterval(checkWaitTimes, 1000);//once every second
						}
						sendBasicEmbed({
							content: "You are attacking `" + accountData[mapSpot.ownersID].username + "`'s colony.\nThis will take " + getTimeRemaining(timesTake.attackColony) + " to complete.",
							color  : embedColors.blue,
							channel: message.channel
						});
						client.fetchUser(mapSpot.ownersID).then(function (user) {
							sendBasicEmbed({
								content: "Your colony at\nGalaxy `" + loc[0] + "` Area: `" + loc[2] + "x" + loc[1] + "`\nIs under attack by `" + playerData.username + "`\nYou have " + getTimeRemaining(timesTake.attackColony) + " to save it",
								color  : embedColors.red,
								channel: user
							});
						})
					}
					else {
						if (args.length) {
							if (args[0] === "removemine") {
								map[loc[0]][loc[1]][loc[2]] = {
									ownersID : null,
									item     : "empty",
									type     : "empty",
									soonOwner: null
								};
								for (let i = 0; i < playerData.colonies.length; i++) {
									if (matchArray(playerData.location, playerData.colonies[i].location)) {
										playerData.stations.splice(i, 1);
										break;
									}
								}
								sendBasicEmbed({
									content: "Your colony has been removed.",
									color  : embedColors.red,
									channel: message.channel
								})
							}
							else {
								sendBasicEmbed({
									content: "The colony here is yours.\nDo you want to remove it? You will not be refunded!\nif you do please send `" + prefix + "attackColony removeMine`",
									color  : embedColors.red,
									channel: message.channel
								})
							}
						}
						else {
							sendBasicEmbed({
								content: "The colony here is yours.\nDo you want to remove it? You will not be refunded!\nif you do please send `" + prefix + "attackColony removeMine`",
								color  : embedColors.red,
								channel: message.channel
							})
						}
					}
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

	["STATIONS", "STATION"],
	{
		names      : ["attackStation", "sAttack", "attackS"],
		description: "attack the station",
		usage      : "attackStation",
		values     : [],
		reqs       : ["normCommand", "profile true", "warping false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let loc = playerData.location;
			let mapSpot = map[loc[0]][loc[1]][loc[2]];
			if (mapSpot.item === "station") {
				playerData.didntMove = true;
				if (mapSpot.ownersID !== playerData.userID) {
					playerData.didntMove = true;
					listOfWaitTimes.push({
						player : playerData.userID,
						expires: Date.now() + timesTake.attackStation,
						type   : "attackStation",
						at     : playerData.location
					});
					let loc = playerData.location;
					if (!waitTimesInterval) {
						waitTimesInterval = setInterval(checkWaitTimes, 1000);//once every second
					}
					sendBasicEmbed({
						content: "You are attacking `" + accountData[mapSpot.ownersID].username + "`'s station.\nThis will take " + getTimeRemaining(timesTake.attackStation) + " to complete.",
						color  : embedColors.blue,
						channel: message.channel
					});
					client.fetchUser(mapSpot.ownersID).then(function (user) {
						sendBasicEmbed({
							content: "Your station at\nGalaxy `" + loc[0] + "` Area: `" + loc[2] + "x" + loc[1] + "`\nIs under attack by `" + playerData.username + "`\nYou have " + getTimeRemaining(timesTake.attackStation) + " to save it",
							color  : embedColors.red,
							channel: user
						});
					})
				}
				else {
					if (args.length) {
						if (args[0] === "removemine") {
							map[loc[0]][loc[1]][loc[2]] = {
								ownersID : null,
								item     : "empty",
								type     : "empty",
								soonOwner: null
							};
							for (let i = 0; i < playerData.stations.length; i++) {
								if (matchArray(playerData.location, playerData.stations[i].location)) {
									playerData.stations.splice(i, 1);
									break;
								}
							}
							sendBasicEmbed({
								content: "You " + mapSpot.type + " has been removed.",
								color  : embedColors.red,
								channel: message.channel
							})
						}
						else {
							sendBasicEmbed({
								content: "The station here is yours.\nDo you want to remove it? You will not be refunded!\nif you do please send `" + prefix + "attackStation removeMine`",
								color  : embedColors.red,
								channel: message.channel
							})
						}
					}
					else {
						sendBasicEmbed({
							content: "The station here is yours.\nDo you want to remove it? You will not be refunded!\nif you do please send `" + prefix + "attackStation removeMine`",
							color  : embedColors.red,
							channel: message.channel
						})
					}
				}
			}
			else {
				sendBasicEmbed({
					content: "There is no station here.",
					color  : embedColors.red,
					channel: message.channel
				});
			}
		}
	},
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
								levels += resources[[givesStuff[0]]].emoji + " ";
							}
							levels += "|| Costs: ";
							for (let j = 0; j < item.costs[i].length; j++) {
								let costsStuff = item.costs[i][j].split(" ");
								levels += costsStuff[1] + " ";
								if (costsStuff[1] < 10) {
									levels += " ";
								}
								levels += resources[[costsStuff[0]]].emoji + " ";
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
			if (nums.length) {
				if (parseInt(nums[0], 10) < stations.names.length) {
					selectedStation = parseInt(nums[0], 10);
					selectedStation--;
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
								missingItems.push([(costsStuff[1] - playerData[costsStuff[0]]), costsStuff[0]])
							}
						}

						if (hasEnough || freeStation) {
							playerData.didntMove = true;

							if (!waitTimesInterval) {
								waitTimesInterval = setInterval(checkWaitTimes, 1000);//once every second
							}
							listOfWaitTimes.push({
								player : playerData.userID,
								expires: Date.now() + timesTake.buildStation,
								which  : selectedStation,
								type   : "buildStation",
								at     : playerData.location
							});
							let lostResources = "";
							for (let i = 0; i < station.costs[0].length; i++) {
								if (freeStation) {
									break;
								}
								let costStuff = station.costs[0][i].split(" ");
								playerData[costStuff[0]] -= costStuff[1];
								lostResources += costStuff[0] + " " + resources[costStuff[0]].emoji + " " + costStuff[1] + "\n";
							}
							let embed = new Discord.RichEmbed()
								.setDescription("Successfully bought " + stations.names[selectedStation] + "\nThis will take " + getTimeRemaining(timesTake.buildStation) + " to complete.\nDon't move from your spot.")
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
								missingResources += missingItems[i][0] + " " + resources[missingItems[i][1]].emoji + " " + missingItems[i][1] + "\n"
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
						content: "You cannot *build* **on** a " + map[loc[0]][loc[1]][loc[2]].type + ".",
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
				txt += spacing("[" + (stations[i].level + 1) + "] " + stations[i].type, "Galaxy: " + (stations[i].location[0] + 1) + "  Area: " + (stations[i].location[2] + 1) + " x " + (stations[i].location[1] + 1), 50);
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
		names      : ["upgradeStation", "upStation"],
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
				console.log(station.costs);
				if (checkGP(playerData.stations[whichStation].type, level - 1, playerData).val) {
					if (station.costs.length < level) {
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
							missingItems.push([(parseInt(costsStuff[1], 10) - playerData[costsStuff[0]]), resources[costsStuff[0]]].emoji);
						}
					}
					if (hasEnough) {
						playerData.stations[whichStation].level++;
						let lostResources = "";
						for (let i = 0; i < station.costs[level].length; i++) {
							let costStuff = station.costs[level][i].split(" ");
							playerData[costStuff[0]] -= costStuff[1];
							lostResources += costStuff[0] + " " + resources[costStuff[0]].emoji + " " + costStuff[1] + "\n";
						}
						let embed = new Discord.RichEmbed()
							.setDescription("Successfully upgraded " + stationToUpgrade.type + "\n")
							.setColor(embedColors.pink)
							.addField("Lost Resources", lostResources);
						message.channel.send({embed});
						if (station.costs.length < level) {
							playerData.stations[whichStation].type = station.name;
							playerData.stations[whichStation].level = 0;
						}
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

	["FACTION", "FACTIONS"],
	{
		names      : ["factionCreate", "fCreate", "createFaction"],
		description: "create your faction",
		usage      : "factioncreate [VALUE] ",
		values     : ["{NAME}"],
		reqs       : ["normCommand", "profile true", "faction false", "attacking false"],
		effect     : function (message, args, playerData, prefix) {
			let creditCost = 1000;
			let embed = new Discord.RichEmbed()
				.setColor(embedColors.darkblue);
			if (playerData["credits"] >= creditCost) {
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
							embed.setDescription("You have successfully created the faction `" + txt + "`\n-" + creditCost + " " + resources["credits"].emoji + " credits");
							playerData.faction = txt.toLowerCase();
							factions.names.push({lowerCaseName: txt.toLowerCase(), regularName: txt});
							let newFactionData = new createFaction();
							newFactionData.members.push({id: message.author.id, rank: "owner"});
							newFactionData.name = txt;
							factions[txt.toLowerCase()] = newFactionData;
							playerData["credits"] -= creditCost;
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
				embed.setDescription("You are missing\n" + (creditCost - playerData["credits"]) + " " + resources["credits"].emoji + " credits");
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
			for (let i = 0; i < resources.names.length - 1; i++) {
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
			for (let i = 0; i < resources.names.length - 1; i++) {
				let len = "" + faction[resources.names[i]];
				if (len.length > spaceLength) {
					spaceLength = len.length;
				}
			}
			for (let i = 0; i < resources.names.length - 1; i++) {
				let space = "";
				let len = "" + faction[resources.names[i]];
				for (let j = 0; j < spaceLength - len.length; j++) {
					space += " ";
				}
				factionsResources += faction[resources.names[i]] + space + "| " + resources[resources.names[i]].emoji + " " + resources.names[i];
				factionsResources += "\n";
			}
			factionsResources += "```";

			embed.addField("Info", "Level:" + faction.level + "\nImage: " + faction.canUseDescription + "\nDescription: " + faction.canUseDescription + "Color: " + faction.color + "\nEmoji: " + faction.emoji, true);
			embed.addField("Resources", factionsResources, true);
			message.channel.send({embed});
		}
	},
	{
		names      : ["fAdvertise", "fAds", "fAd"],
		description: "advertise your faction",
		usage      : "factionAdvertise",
		values     : [],
		reqs       : ["normCommand", "profile true", "faction true", "factionMod"],
		effect     : function (message, args, playerData, prefix) {
			let fac = factions[playerData.faction];

			if (fac.lastAd + timesTake.factionAdvertise <= Date.now()) {
				fac.lastAd = Date.now();
				let channel = client.channels.get('371068393941368844');
				let own = null;
				let mods = 0;
				for (let i = 0; i < fac.members.length; i++) {
					if (fac.members[i].rank.toLowerCase() === "owner") {
						own = fac.members[i].id;
					}
					if (fac.members[i].rank.toLowerCase() === "mod") {
						mods++;
					}
				}
				let isFull = "The faction is open to joining!";
				if (fac.members.length >= fac.maxMembers) {
					isFull = "This faction is full";
				}
				client.fetchUser(own).then(function (owner) {
					if (fac.level >= 2) {
						let embed = new Discord.RichEmbed()
							.setColor(fac.color)
							.setDescription("```fix\nOwner: " + owner.username + "\nMembers: " + fac.members.length + "/" + fac.maxMembers + "\nMods   : " + mods + "/" + fac.maxMods + "```")
							.setTitle(fac.emoji + " || " + fac.name)
							.setFooter(isFull);
						if (fac.image.length) {
							embed.setThumbnail(fac.image);
						}
						if (fac.description.length) {
							embed.addField("Description:", fac.description);
						}
						channel.send({embed});
					}
					else {
						channel.send(fac.emoji + " || " + fac.name + "\n```fix\nOwner: " + owner.username + "\nMembers: " + fac.members.length + "/" + fac.maxMembers + "\nMods   : " + mods + "/" + fac.maxMods + "```\n" + fac.description);
					}
					sendBasicEmbed({
						content: "We have advertised your faction.",
						color  : embedColors.blue,
						channel: message.channel
					})
				});
			}
			else {
				sendBasicEmbed({
					content: "You can only advertise once every " + getTimeRemaining(timesTake.factionAdvertise) + "\nYou need to wait " + getTimeRemaining(fac.lastAd + timesTake.factionAdvertise - Date.now()) + " before you can advertise again.",
					color  : embedColors.red,
					channel: message.channel
				})
			}

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
			embed.addField("Unlocked:", gains + "\n\n-" + (stuff[1] + " " + resources[stuff[0]].emoji + " " + stuff[0]));
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
								faction.members[i].rank = "owner";
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
				if (faction.members[i].rank === "owner") {
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
				if (faction.members[member].rank === "owner") {
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
						if (faction.members[i].rank !== "owner") {
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

	["MODERATION", "MODS"],
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
					if (serverStuff[message.guild.id].modChannel != null) {
						let embed = new Discord.RichEmbed()
							.setTitle("allowed Channel")
							.setDescription("<@!" + message.author.id + "> Allowed <#" + nums[0] + "> as a channel for Galactica Usage")
							.setColor(embedColors.purple);
						client.channels.get(serverStuff[message.channel.guild.id].modChannel).send({embed});
					}
				}
				else {
					sendBasicEmbed({
						content: "Something went wrong, its either\n```fix\nThe bot doesn't have access to the channel\nInvalid channel\nDM's channel\nVoice Channel```\nThe channel must be a text channel.",
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
					serverStuff[message.guild.id].allowedChannels[nums[0]] = false;
					sendBasicEmbed({
						content: "Set <#" + nums[0] + "> as a disallowed channel.",
						color  : embedColors.purple,
						channel: message.channel
					})
					if (serverStuff[message.guild.id].modChannel != null) {
						let embed = new Discord.RichEmbed()
							.setTitle("Disallowed Channel")
							.setDescription("<@!" + message.author.id + "> Dis-allowed <#" + nums[0] + "> as a channel for Galactica Usage")
							.setColor(embedColors.purple);
						client.channels.get(serverStuff[message.channel.guild.id].modChannel).send({embed});
					}
				}
				else {
					sendBasicEmbed({
						content: "Something went wrong, its either\n```fix\nThe bot doesn't have access to the channel\nInvalid channel\nDM's channel\nVoice Channel```\nThe channel must be a text channel.",
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
						content: "Set <#" + nums[0] + "> as the mod channel.",
						color  : embedColors.purple,
						channel: message.channel
					})

				}
				else {
					sendBasicEmbed({
						content: "Something went wrong, its either\n```fix\nThe bot doesn't have access to the channel\nInvalid channel\nDM's channel\nVoice Channel```\nThe channel must be a text channel.",
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
		usage      : "setWelcomeChannel [VALUE]",
		values     : ["{CHANNEL_ID} {MESSAGE}", "{#CHANNEL} {MESSAGE}", "\"NONE\""],
		reqs       : ["channel text", "userPerms ADMINISTRATOR"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			if (nums.length) {
				let welcomeTxt = "Welcome {username} to {server} owned by {owner} you are member #{members}";
				if (client.channels.get(nums[0]) != null) {
					if (args.length >= 2) {
						welcomeTxt = "";
						let words = message.content.split(" ");
						words.shift();
						for (let i = 1; i < words.length; i++) {
							welcomeTxt += words[i] + " ";
						}
					}
					serverStuff[message.guild.id].welcomeChannel.id = nums[0];
					serverStuff[message.guild.id].welcomeChannel.message = welcomeTxt;
					sendBasicEmbed({
						content: "Set <#" + nums[0] + "> as the welcome channel.\nWith the welcome message as\n" + welcomeTxt,
						color  : embedColors.purple,
						channel: message.channel
					});
					if (serverStuff[message.guild.id].modChannel != null) {
						let embed = new Discord.RichEmbed()
							.setTitle("Welcome Message")
							.setDescription("Welcome message was changed by <@!" + message.author.id + "> to\n" + welcomeTxt)
							.setColor(embedColors.purple);
						client.channels.get(serverStuff[message.channel.guild.id].modChannel).send({embed});
					}
				}
				else {
					sendBasicEmbed({
						content: "Something went wrong, its either\n```fix\nThe bot doesn't have access to the channel\nInvalid channel\nDM's channel\nVoice Channel```\nThe channel must be a text channel.",
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
							.setDescription("Welcome message was removed by <@!" + message.author.id + ">")
							.setColor(embedColors.purple);
						client.channels.get(serverStuff[message.channel.guild.id].modChannel).send({embed});
					}
				}
				else {
					sendBasicEmbed({
						content: "Invalid Usage!\nYou must include the channel you want to be the welcome channel.",
						color  : embedColors.red,
						channel: message.channel
					})
				}
			}
		}
	},
	{
		names      : ["setGoodbyeChannel", "setGC"],
		description: "set your server's goodbye channel and its message",
		usage      : "setGoodbyeChannel [VALUE]",
		values     : ["{CHANNEL_ID} {MESSAGE}", "{#CHANNEL} {MESSAGE}", "\"NONE\""],
		reqs       : ["channel text", "userPerms ADMINISTRATOR"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			if (nums.length) {
				let goodbyeTxt = "Goodbye {username}. {server} now has {members} members";
				if (client.channels.get(nums[0]) != null) {
					if (args.length >= 2) {
						goodbyeTxt = "";
						let words = message.content.split(" ");
						words.shift();
						for (let i = 1; i < words.length; i++) {
							goodbyeTxt += words[i] + " ";
						}
					}
					serverStuff[message.guild.id].goodbyeChannel.id = nums[0];
					serverStuff[message.guild.id].goodbyeChannel.message = goodbyeTxt;
					sendBasicEmbed({
						content: "Set <#" + nums[0] + "> as the goodbye channel.\nWith the goodbye message as\n" + goodbyeTxt,
						color  : embedColors.purple,
						channel: message.channel
					});
					if (serverStuff[message.channel.guild.id].modChannel != null) {
						let embed = new Discord.RichEmbed()
							.setTitle("Goodbye Message")
							.setDescription("Goodbye message was changed by <@!" + message.author.id + "> to\n" + goodbyeTxt)
							.setColor(embedColors.purple);
						client.channels.get(serverStuff[message.channel.guild.id].modChannel).send({embed});
					}
				}
				else {
					sendBasicEmbed({
						content: "Something went wrong, its either\n```fix\nThe bot doesn't have access to the channel\nInvalid channel\nDM's channel\nVoice Channel```\nThe channel must be a text channel.",
						color  : embedColors.red,
						channel: message.channel
					})
				}
			}
			else {
				if (args[0] === "none") {
					sendBasicEmbed({
						content: "Disabled the Goodbye message.",
						color  : embedColors.red,
						channel: message.channel
					});
					serverStuff[message.channel.guild.id].welcomeChannel.id = null;
					serverStuff[message.channel.guild.id].welcomeChannel.message = null;
					if (serverStuff[message.channel.guild.id].modChannel != null) {
						let embed = new Discord.RichEmbed()
							.setTitle("Goodybye Message")
							.setDescription("Goodbye message was removed by <@!" + message.author.id + ">")
							.setColor(embedColors.purple);
						client.channels.get(serverStuff[message.channel.guild.id].modChannel).send({embed});
					}
				}
				else {
					sendBasicEmbed({
						content: "Invalid Usage!\nYou must include the channel you want to be the goodbye channel.",
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
		values     : ["\"All\"", "{NUMBER}"],
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
		reqs       : ["channel text", "userPerms KICK_MEMBERS"],
		effect     : function (message, args, playerData, prefix) {
			let modChannel = false;
			let canDelete = checkPerms({
				message: message,
				user   : "bot",
				perms  : "MANAGE_MESSAGES"
			});
			if (serverStuff[message.guild.id].modChannel != null) {
				modChannel = true;
			}
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
					sendBasicEmbed({
						content: "You have been warned in the server: `" + message.guild.name + "`\nReason: " + reason,
						color  : embedColors.orange,
						channel: user
					});
					if (modChannel) {
						let warningNum = "This is the 1st warning given to this user.";
						if (serverStuff[message.guild.id].warnings[nums[0]] != null) {
							serverStuff[message.guild.id].warnings[nums[0]]++;
							warningNum = "This the " + serverStuff[message.guild.id].warnings[nums[0]];
							let num = "" + serverStuff[message.guild.id].warnings[nums[0]];
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
					}
					let embedNew = new Discord.RichEmbed()
						.setDescription("warned the user")
						.setColor(embedColors.purple);
					message.channel.send({embed: embedNew}).then(function (mess) {
						if (canDelete) {
							message.delete();
							setTimeout(function () {
								mess.delete();
							}, 10000)
						}
					});

				}).catch(function (err) {
					sendBasicEmbed({
						content: "that user doesn't exist",
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
		reqs       : ["channel text", "userPerms KICK_MEMBERS"],
		effect     : function (message, args, playerData, prefix) {
			let modChannel = false;
			let canDelete = checkPerms({
				message: message,
				user   : "bot",
				perms  : "MANAGE_MESSAGES"
			});
			if (serverStuff[message.guild.id].modChannel != null) {
				modChannel = true;
			}
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
						sendBasicEmbed({
							content: "All your warnings in the server `" + message.guild.name + "` have been cleared\nReason: " + reason,
							color  : embedColors.orange,
							channel: user
						});
						if (modChannel) {
							let clearedWarnings = "This user HAD " + serverStuff[message.guild.id].warnings[nums[0]] + " warnings.";
							delete serverStuff[message.guild.id].warnings[nums[0]];
							let embed = new Discord.RichEmbed()
								.setTitle("CLEARING <@!" + nums[0] + ">'S WARNINGS")
								.setColor(embedColors.green)
								.setDescription("<@!" + nums[0] + "> has had his warnings removed\n**Reason:** " + reason + "\nGiven by: <@!" + message.author.id + ">")
								.setFooter(clearedWarnings);
							client.channels.get(serverStuff[message.guild.id].modChannel).send({embed});
						}
						let embed2 = new Discord.RichEmbed()
							.setDescription("cleared user's warnings.")
							.setColor(embedColors.purple);
						message.channel.send({embed: embed2}).then(function (mess) {
							if (canDelete) {
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
						content: "That user doesn't exist",
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
		reqs       : ["channel text", "userPerms KICK_MEMBERS", "botPerms KICK_MEMBERS"],
		effect     : function (message, args, playerData, prefix) {
			let modChannel = false;
			let canDelete = checkPerms({
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
					let warningNum = "This user had 0 warnings.";
					if (serverStuff[message.guild.id].warnings[nums[0]] != null) {
						warningNum = "This user had " + serverStuff[message.guild.id].warnings[nums[0]] + " warnings.";
					}
					sendBasicEmbed({
						content: "You have been kicked from the server: `" + message.guild.name + "`\nReason: " + reason,
						color  : embedColors.red,
						channel: message.channel
					});
					if (modChannel) {
						let embed = new Discord.RichEmbed()
							.setTitle("KICKING <@!" + nums[0] + ">")
							.setColor(embedColors.orange)
							.setDescription("<@!" + nums[0] + "> has been kicked!\n**Reason:** " + reason + "\nGiven by: <@!" + message.author.id + ">")
							.setFooter(warningNum);
						client.channels.get(serverStuff[message.guild.id].modChannel).send({embed});
					}
					client.guilds.get(message.guild.id).members.get(nums[0]).kick(reason);
					let embed2 = new Discord.RichEmbed()
						.setDescription("kicked the user")
						.setColor(embedColors.purple);
					message.channel.send({embed: embed2}).then(function (mess) {
						if (canDelete) {
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
		values     : ["{@USER} [REASON]", "{@USER_ID} [REASON]"],
		reqs       : ["channel text", "userPerms BAN_MEMBERS", "botPerms BAN_MEMBERS"],
		effect     : function (message, args, playerData, prefix) {
			let modChannel = false;
			let canDelete = checkPerms({
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

					let warningNum = "This user had 0 warnings.";
					if (serverStuff[message.guild.id].warnings[nums[0]] != null) {
						warningNum = "This user had " + serverStuff[message.guild.id].warnings[nums[0]] + " warnings.";
					}
					if (modChannel) {
						let embed = new Discord.RichEmbed()
							.setTitle("BANNING <@!" + nums[0] + ">")
							.setColor(embedColors.red)
							.setDescription("<@!" + nums[0] + "> has been banned!\n**Reason:** " + reason + "\nGiven by: <@!" + message.author.id + ">")
							.setFooter(warningNum);
						client.channels.get(serverStuff[message.guild.id].modChannel).send({embed});
					}
					client.guilds.get(message.guild.id).members.get(nums[0]).ban({days: 1, reason: reason});

					let embed2 = new Discord.RichEmbed()
						.setDescription("banned the user")
						.setColor(embedColors.purple);
					message.channel.send({embed: embed2}).then(function (mess) {
						if (canDelete) {
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

	["OWNER"],
	{
		names      : ["clearLogs"],
		description: "clearLogs",
		usage      : "clearLogs",
		values     : [],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			fs.writeFile("./galactica.log", "Cleared Logs!\n", function (err) {
				if (err) {
					throw err;
				}
			});
			sendBasicEmbed({
				content: "Cleared all logs",
				color  : embedColors.purple,
				channel: message.channel
			})
		}
	},
	{
		names      : ["ResetAllData"],
		description: "resets all the data",
		usage      : "ResetAllData",
		values     : [],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			accountData = {
				names: []
			};
			createMap(map.length, map[0].length, map[0][0].length);
			sendBasicEmbed({
				content: "All game's data has been reset",
				color  : embedColors.red,
				channel: message.channel
			})
		}
	},
	{
		names      : ["eval"],
		description: "does some code",
		usage      : "eval [VALUE]",
		values     : ["{CODE}"],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			let words = message.content.split(" ");
			words.shift();
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
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			console.log("exited");
			process.exit();
		}
	},
	{
		names      : ["announce"],
		description: "announce a message",
		usage      : "announce [VALUE]",
		values     : ["{MESSAGE}"],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			let ids = serverStuff.names;
			let text = "";
			let txt = message.content.split(" ").shift();
			for (let i = 0; i < txt.length; i++) {
				text += txt + " ";
			}
			let embed = new Discord.RichEmbed()
				.setTitle("FrustratedProgrammer has a Announcement")
				.setColor(embedColors.purple)
				.setDescription(text);
			for (let i = 0; i < ids.length; i++) {
				let guild = client.guilds.get(ids[i]);
				guild.defaultChannel.send({embed});
			}
		}
	},
	{
		names      : ["servers"],
		description: "get a list of all servers",
		usage      : "severs",
		values     : [],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			let ids = serverStuff.names;
			let text = "```css\n";
			for (let i = 0; i < ids.length; i++) {
				let guild = client.guilds.get(ids[i]);
				text += spacing(guild.name + " | " + guild.owner, guild.id + "\n", 40);
			}
			message.channel.send(text + "```");
		}
	},
	{
		names      : ["server"],
		description: "get info on a server",
		usage      : "server [VALUE]",
		values     : ["{ID}"],
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			let ids = serverStuff.names;
			let guild = client.guilds.get(args[0]);
			if (guild) {
				let embed = new Discord.RichEmbed()
					.setTitle(guild.name)
					.setThumbnail(guild.icon)
					.addField("Info", "Owner: " + guild.owner + "\nMembers: " + guild.members.size);
				message.author.send({embed});
			}
			else {
				sendBasicEmbed({
					content: "Invalid ID",
					color  : embedColors.red,
					channel: message.author
				})
			}
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
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content, true);
			if (nums.length === 3) {
				let other = require("./other.json");
				other.map = createMap(nums[0], nums[1], nums[2]);
				for (let i = 0; i < accountData.names.length; i++) {
					let acc = accountData[accountData.names[i]];
					if (acc.location[0] > other.map.length || acc.location[1] > other.map[0].length || acc.location[2] > other.map[0][0].length) {
						accountData.location = [0, 0, 0];
					}
					for (let j = 0; j < acc.stations.length; j++) {
						let statsLoc = acc.stations[j].location;
						if (statsLoc[0] >= other.map.length || statsLoc[1] >= other.map[0].length || statsLoc[2] >= other.map[0][0].length) {
							acc.stations.splice(j, 1);
						}
						else {
							if (other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].item !== "SafeZone" || other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].item !== "DominateZone") {
								other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].ownersID = accountData.names[i];
								other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].type = acc.stations[j].type;
								other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].item = "station";
							}
							else {
								acc.stations.splice(i, 1);
							}
						}
					}
					for (let j = 0; j < acc.colonies.length; j++) {
						let statsLoc = acc.colonies[j].location;
						if (statsLoc[0] >= map.length || statsLoc[1] >= map[0].length || statsLoc[2] >= map[0][0].length) {
							acc.colonies.splice(j, 1);
						}
						else {
							if (other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].item !== "SafeZone" || other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].item !== "DominateZone") {

								other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].ownersID = accountData.names[i];
								other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].type = acc.colonies[j].type;
								other.map[statsLoc[0]][statsLoc[1]][statsLoc[2]].item = "colony";
							}
							else {
								acc.colonies.splice(i, 1);
							}
						}
					}
				}
				map = other.map;
				sendBasicEmbed({
					content: `Create map ${nums[0]}x${nums[1]}x${nums[2]}`,
					color  : embedColors.purple,
					channel: message.channel
				})
			}
			else {
				sendBasicEmbed({
					content: `3 numbers required instead of ${nums.length}`,
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
					content: "You gave yourself " + args[1] + " " + resources[args[0]].emoji + " " + args[0],
					channel: message.channel,
					color  : embedColors.purple
				})
			}
			else {
				let id = getNumbers(message.content)[0];
				let data = accountData[id];
				data[args[1]] += parseInt(args[2], 10);
				sendBasicEmbed({
					content: "You gave " + args[0] + " " + args[2] + " " + resources[args[1]].emoji + " " + args[1],
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
		reqs       : ["owner"],
		effect     : function (message, args, playerData, prefix) {
			let nums = getNumbers(message.content);
			let player = accountData[nums[0]];
			if (player != null) {
				if (player.faction != null) {
					let fac = factions[player.faction];
					if (fac) {
						for (let i = 0; i < fac.members.length; i++) {
							if (fac.members[i].id === player.id) {
								if (fac.members[i].rank !== "owner") {
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
						map[loc[0]][loc[1]][loc[2]].type = "empty";
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
					content: "Something went wrong...\n```fix\nEither that player doesn't have an account\nOr invalid ID```",
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
	console.log("swept messages");
}, 60000 * 60);
client.on("guildMemberRemove", function (member) {
	if (serverStuff[member.guild.id].goodbyeChannel.id != null) {
		let txt = "";
		let msg = serverStuff[member.guild.id].goodbyeChannel.message.split(" ");
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
			.setTitle(member.user.username.toUpperCase() + " HAS LEFT!")
			.setDescription(txt)
			.setColor(embedColors.red);
		client.channels.get(serverStuff[member.guild.id].goodbyeChannel.id).send({embed});
	}
});
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
			prefix         : "-",
			serverID       : Guild.id,
			modChannel     : null,
			warnings       : {},
			allowedChannels: {},
			welcomeChannel : {
				id     : null,
				message: null
			},
			goodbyeChannel : {
				id     : null,
				message: null
			}
		};
		//TODO: add a welcome message
	}
	else {
		//TODO: add a thank you for inviting me back
	}
});
client.on("ready", function () {
	if (listOfWaitTimes.length) {
		//waitTimesInterval = setInterval(checkWaitTimes,1000);
	}
	if (attacks.length) {
		attackTimeInterval = setInterval(attackPlayerFunction, 1000);
	}
	upTime = Date.now();
	console.log("Galactica | Online");
	powerEmoji = client.guilds.get("354670066480054272").emojis.find("name", "Fist");
	resources["power"].emoji = powerEmoji.toString();
	if (universalPrefix !== "test") {
		client.user.setGame(universalPrefix + 'help | Guilds: ' + (client.guilds.size));
	}
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

	if (message.channel.type === "text") {
		if (serverStuff[message.guild.id] == null) {
			serverStuff.names.push(message.guild.id);
			serverStuff[message.guild.id] = {
				prefix         : "-",
				serverID       : message.guild.id,
				modChannel     : null,
				warnings       : {},
				allowedChannels: {},
				welcomeChannel : {
					id     : null,
					message: null
				},
				goodbyeChannel : {
					id     : null,
					message: null
				}
			};
		}
	}
	attacks = require("./other.json").attacks;
	accountData = require("./accounts.json").players;
	factions = require("./factions.json").factions;
	listOfWaitTimes = require("./other.json").listOfWaitTimes;
	map = require("./other.json").map;

	if (message.author.bot) {
		return;
	}
	if (checked > 0) {
		checked = 0;
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
	if (message.channel.type === "dm") {
		if (message.content.toLowerCase() === "i allow galactica to store my enduser's data") {
			sendBasicEmbed({
				content: "Thank you for playing with us",
				color  : embedColors.green,
				channel: message.channel
			});
			let perms = require("./permissions.json");
			perms[message.author.id] = true;
			saveJsonFile("./permissions.json");
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
			if (!(commands[i] instanceof Array)) {
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
						if (isVerified(message.author.id)) {
							if (isValidText(message.content)) {
								if (accountData[message.author.id] != null) {
									accountData[message.author.id] = new updateAccount(accountData[message.author.id]);

									if (accountData[message.author.id].username !== message.author.username) {
										accountData[message.author.id].username = message.author.username;
									}
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
						else {
							let embed = new Discord.RichEmbed()
								.setTitle("Permission to store EndUser's Data")
								.setDescription("Discord's Terms Of Service requires me to have **your** permission to store any data related to you.")
								.addField("This includes ~~(but not limited to)~~", "```css\nUsernames\nIDs\nProfile Pictures\nMessages```")
								.addField("✅", "To Give me permission please say in your DMs this exact message\n```fix\nI allow Galactica to store my EndUser's Data```\nOtherwise you will not be allowed to use Galactica")
								.setFooter("None of your info will be sold/shared")
								.setColor(embedColors.red);
							message.author.send({embed});
						}
					}
				}
			}
		}
	}

});
//client.login(require("./config.json").token);//Secure Login


