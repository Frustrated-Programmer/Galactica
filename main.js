/**
 * Created by Elijah on 9/9/2017.
 */
var version = "0.0.0";

const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();



/**VARIBLES**/
var accountData = require("./accounts.json").players;
var UpdateAccount = require("./account.js");


/**CONSTANTS**/
const map = createMap(4,25,25);
const embedColors = require("./colors.js");
const universalPrefix = "-";
const commands = [
    {
        names: ["version"],
        description: "Gives you the current version",
        reqs: [],
        effect: function (message, args, playerData) {
            sendBasicEmbed({
                color:embedColors.green,
                content:"Galactica | Version | " + version,
                channel:message.channel
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
        names: ["clear"],
        description: "Clear a channel",
        reqs: ["argUnder 0 100"],
        effect: function (message, args, playerData) {
            channelClearAll(message.channel);
        }
    },
    {
        names: ["stats"],
        description: "Get your stats",
        reqs: [],
        effect: function (message, args, playerData) {
            if (playerData != null) {
                var embed = new Discord.RichEmbed()
                    .setTitle(message.member.displayName+"'s stats")
                    .setColor(embedColors.blue)
                    .addField("Location:","Galaxy `"+playerData.location[0]+"` Area: `"+playerData.location[1]+"x"+playerData.location[2]+"`");
                message.channel.send(embed);
            } else {
                var newPlayerData = new UpdateAccount();
                newPlayerData.userID=message.author.id;
                accountData.push(newPlayerData);
                saveJsonFile("./accounts.json");
                sendBasicEmbed({
                    color:embedColors.green,
                    content:"Account Created",
                    channel:message.channel
                });
            }
        }
    },
];
const reqChecks = {
    "argNum": function (reqArgs, message, args) {
        return args[reqArgs][0] !== parseInt(args[reqArgs][0], 10);
    },
    "argOver": function (reqArgs, message, args) {
        if (reqChecks.argNum(reqArgs, message, args)) return false;
        return args[reqArgs[0]] > parseInt(reqArgs[1]);
    },
    "argUnder": function (reqArgs, message, args) {
        if (reqChecks.argNum(reqArgs, message, args)) return false;
        return args[reqArgs[0]] < parseInt(reqArgs[1]);
    },
    "argNot": function (reqArgs, message, args) {
        if (reqChecks.argNum(reqArgs, message, args)) return false;
        return args[reqArgs[0]] !== parseInt(reqArgs[1]);
    },
};


/**FUNCTIONS**/
function createMap(galaxys, xSize, ySize) {
    var planets = [
        {
            name:"empty",
            chance:10
        },
        {
            name:"mine",
            chance:5
        },
        {
            name:"farm",
            chance:1
        }
    ];
    var chance=0;
    for(var p = 0;p<planets.length;p++){
        chance+=planets[p].chance;//puts together the entire "chance" of all planets
    }
    var map = [];
    for (var g = 0; g < galaxys; g++) {
        var galaxy = [];
        for (var y = 0; y < ySize; y++) {
            var yMap = [];
            for (var x = 0; x < xSize; x++) {
                var whichPlanet = Math.round(Math.random()*chance);//which planet but as a number
                var subtractChance=0;//subtract the previous chances
                var planet = undefined;//which planet
                for(var p = 0;p<planets.length;p++){
                    if(whichPlanet<=whichPlanet-subtractChance){
                        planet = p;
                    }else{
                        subtractChance+=planets[p].chance;
                    }
                }
                if(planet === undefined){
                    planet = 0;
                }
                yMap.push({
                    type:planets[planet].name,
                    ownerOfStations:"none"
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
};
function sendBasicEmbed(args) {
    var embed = new Discord.RichEmbed()
        .setColor(args.color)
        .setDescription(args.content);
    args.channel.send(embed);
}
function channelClear(channel, msgnum) {
    channel.bulkDelete(msgnum, true);
};
function channelClearAll(channel) {
    channel.bulkDelete(100, true).then(function () {
        if (channel.lastMessageID) {
            channelClearAll(channel);
        }
    });
};
function runCommand(command, message, args) {
    for (var i = 0; i < command.reqs.length; i++) {
        var typeReq = command.reqs[i].split(" ")[0];
        var reqArgs = command.reqs[i].split(" ");
        reqArgs.shift();

        if (!reqChecks[typeReq](reqArgs, message, args)) return;
    }

    command.effect(message, args, findPlayerData(message.author.id));
    return;
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
                runCommand(commands[i], message, args);
            }
        }
    }
});
client.login(require("./config.json").token);//Secure Login
