var Account = function (data) {
    data = data || {};

    this.userID = data.userID || "";
    this.rank = data.rank || "Newbie";
    this.username = data.username || "";
    this.faction = data.faction || null;
    this.location = data.location || [0, 0, 0];
    this.happiness = data.happiness || 0.5;
    this.stations = data.stations || [];
    this.colonies = data.colonies || [];
    this.didntMove = data.didntMove || false;
    this.lastCollection = data.lastCollection || Date.now();
    this.attacking = data.attacking || false;
    this.healing = data.healing || false;
    this.messagesXp = data.messagesXp || 0;
    this.isDominating = data.isDominating || false;
    this.isInSafeZone = data.isInSafeZone || false;

    //resources
    this["credits"] = data["credits"] || 0;
    this["beryllium"] = data["beryllium"] || 0;
    this["silicon"] = data["silicon"] || 0;
    this["food"] = data["food"] || 0;
    this["steel"] = data["steel"] || 0;
    this["titanium"] = data["titanium"] || 0;
    this["carbon"] = data["carbon"] || 0;
    this["neutronium"] = data["neutronium"] || 0;
    this["electricity"] = data["electricity"] || 0;
    this["research"] = data["research"] || 0;
    this["people"] = data["people"] || 0;
    this["power"] = data["power"] || 0;
    this.health = data.health||100;

    //research
    this["Inductive Isolation Methods"] = data["Inductive Isolation Methods"] || 0;
	this["Gravitic Purification"] = data["Gravitic Purification"] || 0;
	this["Compressed Laser Generators"] = data["Compressed Laser Generators"] || 0;
	this["HyperDrive Generator"] = data["HyperDrive Generator"] || 0;
	this["Scientific Labs"] = data["Scientific Labs"]||0;
	this["Super Resource Containers"] = data["Super Resource Containers"] ||0;
	this["Domination Kingdoms"] = data["Domination Kingdoms"] || 0;
	this["Super Galactic Shields"] = data["Super Galactic Shields"] || 0;
	this["Eagle Eyed"] = data["Eagle Eyed"] || 0;
};
module.exports = Account;
