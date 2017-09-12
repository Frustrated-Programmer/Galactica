 /**
 * Created by Elijah on 9/9/2017.
 */
var version = "0.0.0";

const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

var accountData = require("./accounts.json").players;
var stations = [
    {//example
        x:0,
        y:0,
        g:0,
        typeOfStation:"",
        ownerID:""
    }
];
function createMap(galaxys,xSize,ySize){
  var planets = ["empty","mine","farm"];
  var map = [];
  for(var g =0;g<galaxys;g++){
    var galaxy = [];
    for(var y =0;y<ySize;y++){
      var yMap = [];
      for(var x =0;x<xSize;x++){
        yMap.push(planets[Math.round(Math.random()*planets.length)]);
      }
      galaxy.push(yMap);
    }
    map.push(galaxy);
  }

  return map;
}
const map = createMap();


/**CONSTANTS**/
const embedColors = require("./colors.js");
const universalPrefix = "-";
const commands = [
  {
    names: ["version"],
    description: "Gives you the current version",
    reqs: [],
    effect: function(message, args){
      var embed = new Discord.RichEmbed()
        .setColor(embedColors.green)
        .setTitle("Galactica | Version | " + version);
      message.channel.send({ embed: embed });
    }
  },
  {
    names: ["exit"],
    description: "Turns off the bot",
    reqs: [],
    effect: function(message, args){
      process.exit();
    }
  },
  {
    names: ["clear"],
    description: "Clear a channel",
    reqs: [ "argUnder 0 100" ],
    effect: function(message, args) {
      channelClearAll(message.channel);
    }
  },
];
const reqChecks = {
  "argNum": function(reqArgs, message, args) {
    return args[reqArgs][0] !== parseInt(args[reqArgs][0], 10);
  },
  "argOver": function(reqArgs, message, args) {
    if(reqChecks.argNum(reqArgs, message, args)) return false;
    return args[reqArgs[0]] > parseInt(reqArgs[1]);
  },
  "argUnder": function(reqArgs, message, args) {
    if(reqChecks.argNum(reqArgs, message, args)) return false;
    return args[reqArgs[0]] < parseInt(reqArgs[1]);
  },
  "argNot": function(reqArgs, message, args) {
    if(reqChecks.argNum(reqArgs, message, args)) return false;
    return args[reqArgs[0]] !== parseInt(reqArgs[1]);
  },
};

/**FUNCTIONS**/
 function channelClear(channel, msgnum) {
     channel.bulkDelete(msgnum, true);
 };
 function channelClearAll(channel) {
     channel.bulkDelete(100, true).then(function() {
         if(channel.lastMessageID) {
             channelClearAll(channel);
         }
     });
 };
function runCommand(command, message, args) {
  for(var i = 0; i < command.requirements.length; i++) {
    var typeReq = command.requirements[i].split(" ")[0];
    var reqArgs = command.requirements[i].split(" ");
    reqArgs.shift();
    
    if(!reqChecks[typeReq](reqArgs, message, args)) return;
  }
  
  command.effect(message, args);
  return;
}

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
  
  if(command[0] !== universalPrefix) return;

  for(var i = 0; i < commands.length; i++) {
    for(var j = 0; j < commands[i].names.length; j++) {
      if(universalPrefix + commands[i].names[j].toLowerCase() === command){
        runCommand(commands[i], message, args);
      }
    }
  }
});

client.login(require("./config.js").token);//Secure Login
