var Faction = function (data) {
    data = data || {};

    this.name = data.name || "";

    this.description = data.description || "";
    this.canUseDescription = data.canUseDescription || false;
    this.image = data.image || "";
    this.niceAdLevel = data.niceAdLevel || 0;
    this.canUseImage = data.canUseImage || false;
    this.color = data.color || 0x252FF3;
    this.canUseColor = data.canUseColor || false;
    this.emoji = data.emoji || "";
    this.level = data.level || 0;

    this.members = data.members || [];
    this.maxMembers = data.maxMembers || 0;
    this.mods = data.mods || [];
    this.creator = data.creator || "";
    this.maxMods = data.maxMods || 0;
    this.aboutToBecomeOwner = data.aboutToBecomeOwner || "";

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

};
module.exports = Faction;
