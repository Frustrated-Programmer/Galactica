/**
 * Created by Elijah on 9/9/2017.
 */
var version = "0.0.0";

var fs = require("fs");
var Discord = require("discord.js");
var client = new Discord.Client();
var JsonAccounts = require("./Accounts.json");



//varibles
var embedColors = {
    yellow: 0xadb60c,//MODERATION/RESEARCHING
    red:0xce001f,//INVALID ITEM
    lightBlue:0x00C8C8,//NORMAL GAME ITEMS
    green:0x09c612//SOMETHING GOOD
};
var defaultPrefix = "-";//this prefix will work globally! and is the prefix used in DM
var commands =[
    {
        names:["version"],
        description:"Gives you the current version",
        usage:"version",
        events:{},
        does:function(message,words){
            var embed = new Discord.RichEmbed()
                .setColor(embedColors.green)
                .setDescription("Version is `"+version+"`");
            message.channel.send(embed);
        }
    }
];

//clients
client.on("ready", function () {
    console.log("Bot is ready to take commands");
    client.user.setGame(defaultPrefix + 'help||Guilds: ' + (client.guilds.size));

});
client.on("message", function (message) {
    if (message.author.bot) {//if its a bot
        return;
    }
    var words = message.content.toLowerCase();
    words = words.split(" ");

    for (var i = 0; i < commands.length; i++) {
        for (var j = 0; j < commands[i].names.length; j++) {
            if(commands[i].names[j].toLowerCase()===defaultPrefix+words[0]){
                commands[i].does(message,words);
                return;
            }
        }
    }
});

//token
var tok = require("./config.json");
client.login(tok.token);