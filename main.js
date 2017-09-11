/**
 * Created by Elijah on 9/9/2017.
 */
var version = "0.0.0";

const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
var accountData = require("./Accounts.json");



//Constants
const embedColors = require("./colors.js");
const universalPrefix = "-";
const commands = [
    {
        names: ["version"],
        description: "Gives you the current version",
        requirements: [],
        effect: function(message, args){
            var embed = new Discord.RichEmbed()
                .setColor(embedColors.green)
                .setTitle("Galactica | Version | " + version);
            message.channel.send(embed);
        }
    },
    {
        names: ["version"],
        description: "Gives you the current version",
        requirements: [],
        effect: function(message, args){
            var embed = new Discord.RichEmbed()
                .setColor(embedColors.green)
                .setTitle("Galactica | Version | " + version);
            message.channel.send(embed);
        }
    }
];

var eventChecks = {
    "argNum": function(eventArgs, message, args) {
        return args[eventArgs][0] !== parseInt(args[eventArgs][0], 10);
    },
    "argOver": function(eventArgs, message, args) {
        if(eventChecks.argNum(eventArgs, message, args)) return false;
        return args[eventArgs[0]] > parseInt(eventArgs[1]);
    },
    "argUnder": function(eventArgs, message, args) {
        if(eventChecks.argNum(eventArgs, message, args)) return false;
        return args[eventArgs[0]] < parseInt(eventArgs[1]);
    },
    "argNot": function(eventArgs, message, args) {
        if(eventChecks.argNum(eventArgs, message, args)) return false;
        return args[eventArgs[0]] !== parseInt(eventArgs[1]);
    },
};

function runCommand(command, message, args) {
    for(var i = 0; i < command.events.length; i++) {
        var typeEvent = command.events[i].split(" ")[0];
        var eventArgs = command.events[i].split(" ");
        eventArgs.shift();
        
        if(!eventChecks[typeEvent](eventArgs, message, args)) return;
    }
    
    command.effect(message, args);
    return;
}

client.on("ready", function () {
    console.log("Galactica | Online");
    client.user.setGame(defaultPrefix + 'help | Guilds: ' + (client.guilds.size));
});

client.on("message", function (message) {
    if (message.author.bot) {
        return;
    }
    
    var command = message.content.toLowerCase.split(" ")[0];
    var args = message.content.toLowerCase().split(" ");
    args.shift();

    for (var i = 0; i < commands.length; i++) {
        for (var j = 0; j < commands[i].names.length; j++) {
            if(commands[i].names[j].toLowerCase() === universalPrefix + words[0]){
                runCommand(commands[0], message, args);
            }
        }
    }
});

client.login(require("./config.json").token);//Secure Login
