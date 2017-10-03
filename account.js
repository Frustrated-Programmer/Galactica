var Account = function (data) {
    data = data || {};

    this.userID = data.userID || "";
    this.faction = data.faction || undefined;
    this.location = this.location || [0, 0, 0];

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

    this.happiness = data.happiness || 0.5;
    this.stations = data.stations || [];

    this["Inductive Isolation Methods"] = data["Inductive Isolation Methods"] || 0;
    this["Gravitic Purification"] = data["Gravitic Purification"] || 0;
};
Account.prototype.getData = function () {
    return {
        userID: this.userID,

        "steel": this["steel"],
        "titanium": this["titanium"],
        "carbon": this["carbon"],
        "neutronium": this["neutronium"],
        "electricity": this["electricity"],

        "research": this["research"],

        "people": this["people"],
        happiness: this.happiness,
        stations: this.stations,

        faction: this.faction,
        "Inductive Isolation Methods": this["Inductive Isolation Methods"],
        "Gravitic Purification": this["Gravitic Purification"]
    };
};
Account.prototype.getUser = function () {
    var client;
    if (client) {
        var user = client.users.get(this.userID);
        if (user) {
            return user;
        }
    }
    return false;
};
module.exports = Account;
