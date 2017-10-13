exports.runFunction=function (message){
	if(message.content ===".test") {
		message.channel.send("test complete");
	}
};