/**
 ©TemporalFuzz
 ©FrustratedProgrammer
 **/
var version = "0.0.5";
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

const researches = {
    names: ["Inductive Isolation Methods", "Gravitic Purification"],


    /**EVERYTHING is in arrays for each of the levels**/
    "Inductive Isolation Methods": {
        //1:00,1:30,2:00,2:30,3:00
        timesToResearch: [3600000, 5400000, 7200000, 9000000, 10800000],
        does: [
            "Gives `1%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched",
            "Gives `2%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched",
            "Gives `3%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched",
            "Gives `4%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched",
            "Gives `5%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched"
        ],
        costs: [100, 150, 200, 250, 300]
    },
    "Gravitic Purification": {
        timesToResearch: [3600000, 7200000, 14400000, 14400000, 21600000, 21600000, 600000],
        does: [
            "Unlocks:\n • 🔗 Beryllium\n • Steel Refinery\n • Mining Station 2",
            "Unlocks:\n • 🔩 Titanium\n • Steel Refinery 2\n • Mining Station 3",
            "Unlocks:\n • ⬛ Carbon\n • Steel Refinery 3\n • Mining Station 4\n • Magnetic Smelter",
            "Unlocks:\n • 🌀 Neutronium\n • Steel Refinery 4\n • Magnetic Smelter 2",
            "Unlocks:\n • Steel Refinery 5\n • Mining Station 5\n • Magnetic Smelter 3",
            "🌀 Neutronium and ⬛Carbon structures have 10% less maintenance",
            "Insurance: keep all of *Gravitic Purification's* research the next time you die"
        ],
        costs: [25, 50, 100, 200, 500, 1000, 100]
    }
};

/**VARIBLES**/
var accountData = require("./accounts.json").players;
var UpdateAccount = require("./account.js");
var listOfWaitTimes = [];
var waitTimesInterval = false;
var resources = {
    names: ["credits", "steel", "electricity", "food", "people", "beryllium", "research", "titanium", "neutronium", "carbon", "silicon"],
    "credits": "💠",
    "steel": "⛓",
    "electricity": "⚡",
    "food": "🍎",
    "people": "👦",
    "beryllium": "🔗",
    "research": "💡",
    "titanium": "🔩",
    "neutronium": "🌀",
    "carbon": "⬛",
    "silicon": "✴"
};

/**CONSTANTS**/
const stations = {
    names: ["Mining Station", "Refining Station", "Research Station"],
    "Mining Station": {
        maintenance: "low",
        description: "Gives ⛓ Steel",
        crewSize: 24,
        gives: [["steel 1"], ["steel 2"], ["steel 4"], ["steel 6"], ["steel 10"]],
        costs: [["steel 5"], ["steel 10"], ["steel 15"], ["steel 30"], ["steel 45"]],
        extra: {level: 5, upgradeTo: "Metalloid Accelerator"},
        destroyBonus: ["steel 10"]
    },
    "Refining Station": {
        maintenance: "medium",
        description: "Converts ⛓ Steel into 🔗 Beryllium",
        crewSize: 16,
        gives: [["steel -10", "beryllium 1"], ["steel -10", "beryllium 2"], ["steel -6", "beryllium 2"], ["steel -4", "beryllium 2"]],
        costs: [["steel 10"], ["steel 15", "beryllium 5"], ["steel 20", "beryllium 10"], ["steel 30", "beryllium 10"]],
        extra: {},
        destroyBonus: ["steel 10", "beryllium 2"]

    },
    "Research Station": {
        maintenance: "low",
        description: "Gives 💡 research",
        crewSize: 14,
        gives: [["research 3"], ["research 6"], ["research 10"]],
        costs: [["steel 20", "beryllium 10"], ["steel 40", "beryllium 20"], ["steel 60", "beryllium 30"]],
        extra: {},
        destroyBonus: ["research 10", "steel 10"]
    }
    /*"Blank Template":{
     maintenance:"",
     description:"",
     crewSize:0,
     gives:[[]],
     costs:[[]],
     extra:{},
     destroyBonus:[]
     },*/
};
const map = createMap(4, 25, 25);
const embedColors = require("./colors.js");
const universalPrefix = "-";

var skipWarpTime = true;//for testing purposes


const commands = [
    {
        names: ["commands","command","coms","com"],
        description: "get a list of all the commands",
        usage:"commands [VALUE]",
        values:["List","{COMMAND_NAME}"],
        reqs: [],
        effect: function (message, args, playerData) {

            console.log(args);
            if(args[0] == "" || args[0] == null){
                args[0] = "list";
            }
            switch(args[0]){
                case "list":
                    var commandsList = "```css\n";
                    for(var i =0;i<commands.length;i++){
                        commandsList+="["+(i+1)+"] ";
                        if((i+1) < 10){
                            commandsList+=" ";
                        }
                        commandsList+=commands[i].names[0]+"\n"
                    }
                    commandsList+="```";
                    var embed = new Discord.RichEmbed()
                        .setColor(embedColors.blue)
                        .setTitle("COMMAND'S LIST")
                        .setDescription(commandsList)
                        .setFooter(universalPrefix+"command [NAME]/[ID]");
                    message.channel.send(embed);
                break;
                default:
                    var commandIs = null;

                    var numbs = getNumbers(args[0], false);

                    if(numbs.length){
                        commandIs = parseInt(numbs[0],10);
                        commandIs--;
                        console.log(commandIs);
                        if(commandIs>commands.length){
                            commandIs = null;
                        }
                    }else{
                        for (var i = 0; i < commands.length; i++) {
                            for (var j = 0; j < commands[i].names.length; j++) {
                                if (args[0] === commands[i].names[j].toLowerCase()) {
                                    commandIs = i;
                                    break;
                                }
                            }
                            if (commandIs != null) {
                                break;
                            }
                        }
                    }
                    if(commandIs == null){
                        sendBasicEmbed({
                            content:"Invalid Usage\nTry using `"+universalPrefix+"commands list`",
                            color:embedColors.red,
                            channel:message.channel,
                        })
                    }
                    else{
                        var aliases = "";
                        var command = commands[commandIs];
                        for(var i =0;i<command.names.length;i++){
                            aliases+="`"+command.names[i]+"` ";
                        }
                        var embed = new Discord.RichEmbed()
                            .setColor(embedColors.blue)
                            .setTitle("INFO ABOUT \"**`"+universalPrefix+command.names[0]+"`**\"")
                            .setDescription(command.description)
                            .addField("Aliases",aliases)
                            .addField("Usage","`"+universalPrefix+command.usage+"`",true);
                        if(command.values.length){
                            var vals = "";
                            for(var i =0;i<command.values.length;i++){
                                vals+="`"+command.values[i]+"` ";
                                if(i+1!==command.values.length){
                                    vals+="|| "
                                }
                            }
                            embed.addField("`[VALUE]` can be used as:",vals,true);
                        }
                        message.channel.send(embed);
                    }
                break;
            }
        }
    },
    {
        names: ["ping"],
        description: "ping the server and find how long is the response time",
        usage:"ping",
        values:[],
        reqs: [],
        effect: function (message, args, playerData) {
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
        names: ["version"],
        description: "Gives you the current version",
        usage:"version",
        values:[],
        reqs: [],
        effect: function (message, args, playerData) {
            sendBasicEmbed({
                color: embedColors.green,
                content: "Galactica | Version | " + version,
                channel: message.channel
            });
        }
    },
    {
        names: ["exit"],
        description: "Turns off the bot",
        usage:"exit",
        values:[],
        reqs: [],
        effect: function (message, args, playerData) {
            process.exit();
        }
    },
    {
        names: ["clear","purge","prune"],
        description: "Clear a channel",
        usage:"clear [VALUE]",
        values:["All","{NUMBER}"],
        reqs: ["userPerms MANAGE_MESSAGES"],
        effect: function (message, args, playerData) {
            var theNumbersInput = getNumbers(message.content, true);
            if (args[0] === "all") {
                channelClear(message.channel);
            } else if (theNumbersInput[0] < 100) {
                message.delete().then(function () {
                    channelClear(message.channel, theNumbersInput[0]);
                })
            } else {
                sendBasicEmbed({
                    content: "Invalid usage!",
                    color: embedColors.red,
                    channel: message.channel
                })
            }
        }
    },
    {
        names: ["stats"],
        description: "Get your stats",
        usage:"stats",
        values:[],
        reqs: ["profile"],
        effect: function (message, args, playerData) {
            var embed = new Discord.RichEmbed()
                .setTitle(message.member.displayName + "'s stats")
                .setFooter(playerData.userID)
                .setColor(embedColors.blue);
            embed.addField("INFO:", "Faction:" + playerData.faction + "\nPower: 000");
            if (typeof playerData.location === "object") {
                embed.addField("Location:", "Galaxy `" + (playerData.location[0] + 1) + "` Area: `" + playerData.location[1] + "x" + playerData.location[2] + "`");
            } else {
                embed.addField("Location:", playerData.location);
            }
            var playerResources = "```css\n";
            //TODO: make it work with 5 digits so they are all lined up
            for (var i = 0; i < resources.names.length; i++) {
                playerResources += playerData[resources.names[i]] + " | " + resources[resources.names[i]] + " " + resources.names[i];
                playerResources += "\n";
            }
            playerResources += "```";
            embed.addField("Resources", playerResources);
            message.channel.send(embed);
        }
    },
    {
        names: ["research", "r"],
        description: "research something",
        usage:"research [VALUE]",
        values:["List","Info {RESEARCH_NAME}","{RESEARCH_NAME}"],
        reqs: ["profile"],
        effect: function (message, args, playerData) {
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
                    var found = matchArray(newArgs,name);
                    var newArgs = [];
                    for (var q = 0; q < args.length; q++) {
                        newArgs.push(args[q]);
                    }
                    if (newArgs[0] === "info") {
                        newArgs.splice(0, 1);
                        console.log(newArgs);
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
                        embed.setFooter(universalPrefix + "research " + researches.names[number]);
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
                    embed.setFooter(universalPrefix + "research info [NAME]/[ID]");
                    break;
                default:
                    if (number !== null) {
                        var item = researches[researches.names[number]];
                        var level = playerData[researches.names[number]];
                        if (playerData["research"] >= item.costs[level]) {
                            //research ITEM
                        } else {
                            sendBasicEmbed({
                                content: "Not enough 💡 research.",
                                color: embedColors.red,
                                channel: message.channel
                            })
                        }
                    }
                    break;
            }

            message.channel.send(embed)
        }
    },
    {
        names: ["warp", "go"],
        description: "warp to somewhere",
        usage:"warp [VALUE]",
        values:["{GALAXY}","{X} {Y}","{GALAXY} {X} {Y}"],
        reqs: ["profile"],
        effect: function (message, args, playerData) {
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
                        player: playerData,
                        expires: Date.now() + timeUntilFinishedWarping,
                        headTo: goToPos,
                        type: "warp"
                    });
                    if (!waitTimesInterval) {
                        waitTimesInterval = setInterval(checkWaitTimes, 1000);//once every second
                    }
                    playerData.location = "Warping to Galaxy: `" + (goToPos[0] + 1) + "` Area: `" + goToPos[1] + "x" + goToPos[2] + "`";
                    sendBasicEmbed({
                        content: "Warping will take approximately: " + getTimeRemaining(timeUntilFinishedWarping),
                        color: embedColors.blue,
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
                    color: embedColors.yellow
                })

            }
        }
    },
    {
        names: ["join"],
        description: "join the game",
        usage:"join",
        values:[],
        reqs: [],
        effect: function (message, args, playerData) {
            if (playerData != null) {
                sendBasicEmbed({
                    color: embedColors.red,
                    channel: message.channel,
                    content: "You already have an account."
                });
                return;
            }

            var newPlayerData = new UpdateAccount();
            newPlayerData.userID = message.author.id;
            accountData.push(newPlayerData);
            saveJsonFile("./accounts.json");
            sendBasicEmbed({
                color: embedColors.green,
                content: "Account Created",
                channel: message.channel
            });


        }
    },
    {
        names: ["lookAround", "look"],
        description: "See where you are currently at",
        usage:"lookAround",
        values:[],
        reqs: ["profile"],
        effect: function (message, args, playerData) {
            var pos = playerData.location;
            console.log(pos);
            var loc = map[pos[0]][pos[1]][pos[2]];
            var station = "Unoccupied";
            var items = "**Boost to stations:**\n • UnImplemented";
            if (loc.ownerOfStation !== "none") {
                items = "attack `" + loc.ownerOfStation.name + "`'s staion via `" + universalPrefix + "UnImplemented`";
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
        names: ["setStation"],
        description: "sets a station where you currently are at",
        usage:"setStation [VALUE]",
        values:["{STATION_NAME}"],
        reqs: ["profile"],
        effect: function (message, args, playerData) {

            var selectedStation = false;
            for(var i =0;i<stations.names.length;i++){
                var name = stations.names[i].split(" ");
                var match = matchArray(args,name,true);
                if(match === true){
                    selectedStation = i;
                }
            }
            if(selectedStation===false){
                sendBasicEmbed({
                    content:"Invalid Usage\nTry using `"+universalPrefix+"stations list`\nto get the correct spelling",
                    color:embedColors.red,
                    channel:message.channel
                });
            }
            else{
                var station = stations[stations.names[selectedStation]];
                var hasEnough = true;
                var missingItems = [];
                for(var i =0;i<station.costs[0].length;i++){
                    var costsStuff = station.costs[0][i].split(" ");
                    console.log(playerData[costsStuff[0]]);
                    if(playerData[costsStuff[0]]<costsStuff[1]){
                        hasEnough=false;
                        missingItems.push([(costsStuff[1]-playerData[costsStuff[0]]),resources[costsStuff[0]]])
                    }
                }

                if(hasEnough){
                    playerData.stations.push({
                        location:playerData.location,
                        type:stations.names[selectedStation]
                    });
                    var lostResources = "";
                    for(var i =0;i<station.costs[0].length;i++){
                        var costStuff = station.costs[0][i].split(" ");
                        playerData[costStuff[0]]-=costStuff[1];
                        lostResources+=costStuff[0]+" "+resources[costStuff[0]]+" "+costStuff[1]+"\n";
                    }
                    var embed = new Discord.RichEmbed()
                        .setDescription("Successfully bought "+stations.names[selectedStation]+"\n")
                        .setColor(embedColors.pink)
                        .addField("Lost Resources",lostResources);
                    message.channel.send(embed);
                }
                else{
                    var missingResources = "";
                    for(var i =0;i<missingItems.length;i++){
                        missingResources+=missingItems[i][0]+" "+missingItems[i][1]+"\n"
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
    {
        names: ["stations", "station","s"],
        description: "get info on stations",
        usage:"station [VALUE]",
        values:["List","Info {STATION_NAME}"],
        reqs: [],
        effect: function (message, args, playerData) {
            var embed = new Discord.RichEmbed()
                .setColor(embedColors.pink);
            if(args[0] == ""||args[0]==null){
                args[0] = "list";
            }
            switch (args[0]) {
                case "list":
                    embed.setTitle("ID------Name");
                    var txt = "```css\n";
                    for (var i = 0; i < stations.names.length; i++) {
                        txt += "[" + (i+1) + "] " + stations.names[i] + "\n";
                    }
                    embed.setDescription(txt+"```")
                        .setFooter(universalPrefix + "station info [NAME]/[ID]");
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
                        for (var i = 0; i < researches.names.length; i++) {
                            var name = researches.names[i].split(" ");
                            var newArgs = [];
                            for (var q = 0; q < args.length; q++) {
                                newArgs.push(args[q]);
                            }
                            if (newArgs[0] === "info") {
                                newArgs.splice(0, 1);
                                console.log(newArgs);
                            }
                            var found = matchArray(newArgs,name,true);
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
                        embed.setDescription("Invalid Usage\nTry using `" + universalPrefix + "station list`");
                    }
                    else {
                        var item = stations[stations.names[number]];
                        embed.setDescription("Info about:")
                            .setTitle(stations.names[number])
                            .setDescription(item.description);
                        var levels = "```css\n";
                        console.log(item.gives.length);
                        for (var i = 0; i < item.gives.length; i++) {
                            levels += "Level " + (i + 1) + " Gives: ";
                            for(var j =0;j<item.gives[i].length;j++){
                                var givesStuff = item.gives[i][j].split(" ");
                                levels+=givesStuff[1]+" ";
                                if((givesStuff[1]<10&&givesStuff[1]>0)||(givesStuff[1]<0&&givesStuff[1]>-10)){
                                    levels+=" ";
                                }
                                levels+=resources[[givesStuff[0]]]+" ";
                            }
                            levels+="|| Costs: ";
                            for(var j =0;j<item.costs[i].length;j++){
                                var costsStuff = item.costs[i][j].split(" ");
                                levels+=costsStuff[1]+" ";
                                if(costsStuff[1]<10){
                                    levels+=" ";
                                }
                                levels+=resources[[costsStuff[0]]]+" ";
                            }
                            levels += "\n"
                        }
                        embed.addField("LEVELS", levels+"```");
                    }
                    break;
                default:
                    embed.setDescription("Invalid Usage\nTry using `" + universalPrefix + "station list`")
                        .setColor(embedColors.red);
                    break;
            }
            message.channel.send(embed);
        }
    },
];

const reqChecks = {
    "argNum": function (reqArgs, message, args, playerData) {
        return {
            val: args[reqArgs][0] !== parseInt(args[reqArgs][0], 10)
        };
    },
    "argOver": function (reqArgs, message, args, playerData) {
        if (reqChecks.argNum(reqArgs, message, args, playerData)) return {
            val: false
        };
        return {val: args[reqArgs[0]] > parseInt(reqArgs[1])};
    },
    "argUnder": function (reqArgs, message, args, playerData) {
        if (reqChecks.argNum(reqArgs, message, args, playerData)) return {
            val: false
        };
        return {val: args[reqArgs[0]] < parseInt(reqArgs[1])};
    },
    "argNot": function (reqArgs, message, args, playerData) {
        if (reqChecks.argNum(reqArgs, message, args, playerData)) return {
            val: false
        };
        return {
            val: args[reqArgs[0]] !== parseInt(reqArgs[1])
        };
    },
    "botPerms": function (reqArgs, message, args, playerData) {
        return {
            val: checkPerms({
                user: "bot",
                perms: reqArgs[0],
                message: message
            }),
            msg: "The bot currently doesnt have: `" + reqArges[0] + "`"
        };
    },
    "userPerms": function (reqArgs, message, args, playerData) {
        return {
            val: checkPerms({
                user: "user",
                perms: reqArgs[0],
                message: message
            }),
            msg: "You currently dont have: `" + reqArges[0] + "`"
        };
    },
    "isntWarping": function (reqArgs, message, args, playerData) {
        return {
            val: typeof playerData.location === "object",
            msg: "You cannot use this while you're currently warping."
        };
    },
    "profile": function (reqArgs, message, args, playerData) {
        return {val: playerData, msg: "You need to create a profile. use `" + universalPrefix + "join`"};
    }
};


/**FUNCTIONS**/
function checkWaitTimes() {
    for (var i = 0; i < listOfWaitTimes.length; i++) {
        if (listOfWaitTimes[i].expires < Date.now()) {
            switch (listOfWaitTimes[i].type) {
                case "warp":
                    listOfWaitTimes[i].player.location = listOfWaitTimes[i].headTo;
                    break;
            }
            console.log("finished");
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
            name: "empty",
            chance: 10
        },
        {
            name: "mine",
            chance: 5
        },
        {
            name: "farm",
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
                    if (whichPlanet <= whichPlanet - subtractChance) {
                        planet = p;
                    } else {
                        subtractChance += planets[p].chance;
                    }
                }
                if (planet === undefined) {
                    planet = 0;
                }
                yMap.push({
                    type: planets[planet].name,
                    ownerOfStation: "none"
                });
            }
            galaxy.push(yMap);
        }
        map.push(galaxy);
    }

    return map;
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
function sendBasicEmbed(args) {
    var embed = new Discord.RichEmbed()
        .setColor(args.color)
        .setDescription(args.content);
    args.channel.send(embed);
}
function channelClear(channel, msgnum) {
    if (msgnum) {
        channel.bulkDelete(msgnum, true);
    } else {
        channel.bulkDelete(100, true).then(function () {
            if (channel.lastMessageID) {
                channelClear(channel);
            }
        });
    }
}
function runCommand(command, message, args, playerData) {
    for (var i = 0; i < command.reqs.length; i++) {
        var typeReq = command.reqs[i].split(" ")[0];
        var reqArgs = command.reqs[i].split(" ");
        reqArgs.shift();
        var reqCheck = reqChecks[typeReq](reqArgs, message, args, playerData);
        if (!reqCheck.val) {
            if (reqCheck.msg) {
                sendBasicEmbed({
                    content: reqCheck.msg,
                    color: embedColors.red,
                    channel: message.channel
                })
                return;
            }
        }
    }

    command.effect(message, args, playerData);
    return;
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
            } else {
                timeLeftText += ", "
            }
        }
    }
    return timeLeftText;


}
function checkPerms(args) {
    var permsCheck = {
        channelPerms: false,
        serverPerms: false
    };//To check wether the channel is overriding it or not

    var user;
    if (args.user === "bot") {
        user = args.message.server.members.get(client.user.id);
    } else if (args.user === "user") {
        user = args.message.member;
    } else {
        console.log("args.user should be \"user\" or \"bot\"");
        return false;
    }
    if (args.message.channel.permissionsFor(user).has(args.perms, true)) {
        permsCheck.channelPerms = true;
    }//does it have channel perms
    if (args.message.guild.members.get(user.id).hasPermission(args.perms, [null, true, false])) {
        permsCheck.serverPerms = true;
    }//does it have server perms
    if (permsCheck.serverPerms != true) {
        return false;
    } else if (permsCheck.channelPerms != true) {
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
function matchArray(arr1, arr2,text){
    var match = true;
    text = text||false;
    if(text){
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

/**CLIENTS**/
client.on("ready", function () {
    console.log("Galactica | Online");
    client.user.setGame(universalPrefix + 'help | Guilds: ' + (client.guilds.size));
});
client.on("message", function (message) {
    if (message.author.bot) {
        return;
    }
    var command = message.content.toLowerCase().split(" ")[0];
    var args = message.content.toLowerCase().split(" ");
    args.shift();

    if (command[0] !== universalPrefix) return;

    for (var i = 0; i < commands.length; i++) {
        for (var j = 0; j < commands[i].names.length; j++) {
            if (universalPrefix + commands[i].names[j].toLowerCase() === command) {
                if (message.channel.type !== "dm") {
                    //SEND_MESSAGES
                    if (!checkPerms({user: "bot", perms: "SEND_MESSAGES", message: message})) {
                        sendBasicEmbed({
                            content: "I do not have `SEND_MESSAGES` permission",
                            color: embedColors.red,
                            channel: message.author
                        });
                        return;
                    }
                    //EMBED_LINKS
                    if (!checkPerms({user: "bot", perms: "EMBED_LINKS", message: message})) {
                        sendBasicEmbed({
                            content: "I do not have `EMBED_LINKS` permission",
                            color: embedColors.red,
                            channel: message.author
                        });
                        return;
                    }
                }
                runCommand(commands[i], message, args, findPlayerData(message.author.id));
            }
        }
    }
});
client.login(require("./config.json").token);//Secure Login
