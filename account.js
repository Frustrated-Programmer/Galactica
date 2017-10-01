var Account = function(data) {
  data = data || {};
  
  this.userID = data.userID || "";
  
  this.steel = data.steel || 0;
  this.beryllium = data.beryllium || 0;
  this.titanium = data.titanium || 0;
  this.carbon = data.carbon || 0;
  this.neutronium = data.neutronium || 0;
  this.electricity = data.electricity || 0;
  
  this.research = data.research || 0;
  
  this.people = data.people || 0;
  this.happiness = data.happiness || 0.5;
  
  this.faction = data.faction || undefined;
};
Account.prototype.getData = function() {
  return {
    userID: this.userID,
    
    steel: this.steel,
    beryllium: this.beryllium
    titanium: this.titanium,
    carbon: this.carbon,
    neutronium: this.neutronium,
    electricity: this.electricity,
    
    research: this.research,
    
    people: this.people,
    happiness: this.happiness,
    
    faction: this.faction
  };
};
Account.prototype.getUser = function() {
  var client;
  if(client) {
    var user = client.users.get(this.userID);
    if(user) {
      return user;
    }
  }
  return false;
};
module.exports = Account;
