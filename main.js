/**
 ©TemporalFuzz
 ©FrustratedProgrammer
 **/
var version = "0.0.5";
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

const researches = {
    names:["Inductive Isolation Methods","Gravitic Purification"],


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

/**CONSTANTS**/
const factionsNames = ["Agricultural Alliance", "Industrial Alliance", "Suppression Syndicate", "Democratic Federal Union", "Secure Standing Council", "United Domination Front", "Galactic Discovery Advocacy"];
const map = createMap(4, 25, 25);
const embedColors = require("./colors.js");
const universalPrefix = "-";

var skipWarpTime = true;

const commands = [
    {
        names: ["version"],
        description: "Gives you the current version",
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
        reqs: [],
        effect: function (message, args, playerData) {
            process.exit();
        }
    },
    {
        names: ["resetData"],
        description: "deletes all data from players.json",
        reqs: [],
        effect: function (message, args, playerData) {
            accountData = [];
            saveJsonFile("./accounts.json");
        }
    },
    {
        names: ["clear"],
        description: "Clear a channel",
        reqs: [],
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
        reqs: ["profile"],
        effect: function (message, args, playerData) {
            var embed = new Discord.RichEmbed()
                .setTitle(message.member.displayName + "'s stats")
                .setFooter(playerData.userID)
                .setColor(embedColors.blue);
            embed.addField("INFO:","Faction:"+playerData.faction+"\nPower: 000");
            if (typeof playerData.location === "object") {
                embed.addField("Location:", "Galaxy `" + (playerData.location[0] + 1) + "` Area: `" + playerData.location[1] + "x" + playerData.location[2] + "`");
            } else {
                embed.addField("Location:", playerData.location);
            }
            message.channel.send(embed);
        }
    },
    {
        names: ["research","r"],
        description: "research something",
        reqs: [],
        effect: function (message, args, playerData) {
            var embed = new Discord.RichEmbed()
                .setColor(embedColors.yellow);
            var numbs = getNumbers(args,false);
            var number = null;
            if(numbs.length) {
                number = parseInt(numbs[0], 10);
                if (number >= researches.names.length) {
                    embed.setColor(embedColors.red);
                    embed.setDescription("Invalid ID number");
                    return;
                }
            }
            else{
                for(var i =0;i<researches.names.length;i++){
                    var name = researches.names[i].split(" ");
                    var found = true;
                    var newArgs = [];
                    for(var q=0;q<args.length;q++){
                        newArgs.push(args[q]);
                    }
                    if(newArgs[0] === "info"){
                        newArgs.splice(0,1);
                        console.log(newArgs);
                    }
                    for(var j = 0;j<newArgs.length;j++){
                        if(name[j] != null){
                            if(newArgs[j] !== name[j].toLowerCase()){
                                found = false;
                            }
                        }
                    }
                    if(found){
                        number = i;
                        break;
                    }
                }
                if(number===null&&newArgs.length){
                    embed.setColor(embedColors.red);
                    embed.setDescription("Invalid research name");
                    return;
                }
                if(!newArgs.length){
                    embed.setColor(embedColors.red);
                    embed.setDescription("Invalid Usage\nNeed to include a research ID or NAME");
                    return;
                }
            }
            console.log(args);
            console.log(number);
            switch(args[0]){
                case "info":
                    if(number!==null) {
                        var item = researches[researches.names[number]];
                        var level = playerData[researches.names[number]];
                        embed.setTitle("RESEARCH INFO");
                        embed.setDescription("You have `" + playerData.research + "` 💡 research");
                        embed.addField(researches.names[number], item.does[level] + "\nCosts: " + item.costs[level] + " 💡 research\nTime: " + getTimeRemaining(item.timesToResearch[level]))
                        embed.setFooter(universalPrefix + "research " + researches.names[number]);
                    }
                break;
                case "list":
                    embed.setTitle("ID---Name--------------------------Cost");
                    var txt = "```css\n";
                    for(var i =0;i<researches.names.length;i++) {
                        var item = researches[researches.names[i]];
                        var level = playerData[researches.names[i]];
                        txt+=spacing("["+i+"] "+researches.names[i],item.costs[level]+"\n",40);

                    }
                    txt+="```";
                    embed.setDescription(txt);
                    embed.setFooter(universalPrefix+"research info [NAME]/[ID]");
                break;
                default:
                    if(number!==null) {
                        var item = researches[researches.names[number]];
                        var level = playerData[researches.names[number]];
                        if(playerData.research>=item.costs[level]){
                            //research ITEM
                        }else{
                            sendBasicEmbed({
                                content:"Not enough 💡 research.",
                                color:embedColors.red,
                                channel:message.channel
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
        description: "join the game and the faction",
        reqs: [],
        effect: function (message, args, playerData) {
            var correctFaction = false;
            var StillCorrect = false;
            var whichFaction = undefined;
            for (var i = 0; i < factionsNames.length; i++) {
                var factionName = factionsNames[i].split(" ");
                for(var j =0;j<factionName.length;j++) {

                    StillCorrect = (args[j] === factionName[j].toLowerCase());
                    if (!StillCorrect) {
                        correctFaction = false;
                    }else if(j === 0){
                        correctFaction = true;
                    }
                }
                if(correctFaction){
                    whichFaction = i;
                    break;
                }
            }
            if (correctFaction) {
                var newPlayerData = new UpdateAccount();
                newPlayerData.faction = factionsNames[whichFaction];
                newPlayerData.userID = message.author.id;
                accountData.push(newPlayerData);
                saveJsonFile("./accounts.json");
                sendBasicEmbed({
                    color: embedColors.green,
                    content: "Account Created",
                    channel: message.channel
                });
            }
            else {
                sendBasicEmbed({
                    color: embedColors.red,
                    content: "Invalid Usage\nTry using `"+universalPrefix+"factionsList`",
                    channel: message.channel
                });
            }
        }
    },
    {
        names: ["factionsList","factionList","fList"],
        description: "Gives you a list of all the factions and their perks",
        reqs: [],
        effect: function (message, args, playerData) {
            var embed = new Discord.RichEmbed()
                .setColor(embedColors.blue)
                .setDescription("------------------")
                .setTitle("FACTIONS");
            for(var i =0;i<factionsNames.length;i++){
                embed.addField(factionsNames[i],"Unimplemented perks");
            }
            message.channel.send(embed);
        }
    },
    {
        names: ["ping"],
        description: "ping the server and find how long is the response time",
        reqs:[],
        effect: function (message, args, playerData
        ) {
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
    "isntWarping": function (reqArgs, message, args, playerData) {
        return {
            val: typeof playerData.location === "object",
            msg: "You cannot use this while you're currently warping."
        };
    },
    "profile": function (reqArgs, message, args, playerData) {
        return {val: playerData, msg: "You need to create a profile. use `" + universalPrefix + "join [FACTION]`"};
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
                    ownerOfStations: "none"
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
        if(!reqCheck.val){
            if(reqCheck.msg){
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
        user = args.message.client.user;
    } else if (args.user === "user") {
        user = message.member;
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
function spacing (text, text2, max) {
    var newText = text;
    var len = max-text.length-text2.length;
    for (var i = 0; i < len; i++) {
        newText += " ";
    }
    newText+=text2;
    return newText;
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
