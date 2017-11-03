const planets = {
	names        : ["Ocean", "Colony", "Mine", "Terrestrial", "Gas", "Rocky"],
	"Ocean"      : {
		bonuses       : [["Agriculture Station", 15], ["Military Station", 10]],
		inhabitedMax  : 80,
		generatesRates: ["people 50"],
		loseRates     : []
	},
	"Haven"      : {
		bonuses       : [["Agriculture Station", "Life Station", 15], ["Military Station", 10]],
		inhabitedMax  : 150,
		generatesRates: ["credits 1 perPerson 10"],
		loseRates     : []
	},
	"Mine"       : {
		bonuses       : [["Mining Station", 25], ["Refining Station", 10]],
		inhabitedMax  : 60,
		generatesRates: ["steel 1 perPerson 20"],
		loseRates     : []
	},
	"Terrestrial": {
		bonuses       : [["Life Station", 20], ["Research Station", 15]],
		inhabitedMax  : 60,
		generatesRates: ["food 1 perPerson 20", "credits 1 perPerson 10"],
		loseRates     : []
	},
	"Gas"        : {
		bonuses       : [["Research Station", 20], ["Magnetic Smelter", 20], ["Electronic Propulsion Station", 20]],
		inhabitedMax  : 0,
		generatesRates: [],
		loseRates     : []
	},
	"Rocky"      : {
		bonuses       : [["Mining Station", 20], ["Refining Station", 20], ["Military Station", 20]],
		inhabitedMax  : 40,
		generatesRates: [],
		loseRates     : []
	}
};
const Station = {
	names                          : ["Mining Station", "Refining Station", "Research Station", "Agriculture Station", "Military Station", "Magnetic Smelter", "Electronic Propulsion Station"],
	"Mining Station"               : {
		name        : "Mining Station",
		maintenance : "low",
		description : "Gives ⛓ Steel",
		crewSize    : 24,
		gives       : [["steel 1"], ["steel 2"], ["steel 4"], ["steel 6"], ["steel 10"]],
		costs       : [["steel 5"], ["steel 10"], ["steel 15"], ["steel 30"], ["steel 45"]],
		extra       : {upgradeTo: "Metalloid Accelerator"},
		destroyBonus: ["steel 10"]
	},
	"Refining Station"             : {
		name        : "Refining Station",
		maintenance : "medium",
		description : "Converts ⛓ Steel into 🔗 Beryllium",
		crewSize    : 16,
		gives       : [["steel -10", "beryllium 1"], ["steel -10", "beryllium 2"], ["steel -6", "beryllium 2"], ["steel -4", "beryllium 2"]],
		costs       : [["steel 10"], ["steel 15", "beryllium 5"], ["steel 20", "beryllium 10"], ["steel 30", "beryllium 10"]],
		extra       : {upgradeTo: "Metalloid Accelerator"},
		destroyBonus: ["steel 10", "beryllium 2"]

	},
	"Research Station"             : {
		name        : "Research Station",
		maintenance : "low",
		description : "Gives 💡 research",
		crewSize    : 14,
		gives       : [["research 3"], ["research 6"], ["research 10"]],
		costs       : [["steel 20", "beryllium 10"], ["steel 40", "beryllium 20"], ["steel 60", "beryllium 30"]],
		extra       : {},
		destroyBonus: ["research 10", "steel 10"]
	},
	"Agriculture Station"          : {
		name        : "Agriculture Station",
		maintenance : "low",
		description : "gives 🍎 food",
		crewSize    : 20,
		gives       : [["food 3"], ["food 6"], ["food 10"], ["food 15"], ["food 20"]],
		costs       : [["steel 10"], ["steel 20", "food 10"], ["steel 50", "beryllium 10", "food 25"], ["steel 100", "beryllium 20", "food 50"]],
		extra       : {},
		destroyBonus: ["food 10"]
	},
	"Military Station"             : {
		name        : "Military Station",
		maintenance : "medium",
		description : "Watches an area and alerts you of any player’s presence and damages and debuffs nearby enemies",
		crewSize    : 20,
		gives       : [["damage 2"], ["damage 3"], ["damage 4"], ["damage 6"]],
		costs       : [["steel 20", "beryllium 5"], ["steel 50", "beryllium 10"], ["steel 100", "beryllium 20"], ["200", "beryllium 50"]],
		extra       : {},
		destroyBonus: ["beryllium 10", "steel 50"]
	},
	"Magnetic Smelter"             : {
		name        : "Magnetic Station",
		maintenance : "low",
		description : "Gives 🌀 neutronium  and ⬛ Carbon",
		crewSize    : 0,
		gives       : [["carbon 1"], ["carbon 2"], ["carbon 3", "neutronium 1"], ["carbon 4", "neutronium 2"], ["carbon 5", "neutronium 3"]],
		costs       : [["steel 200", "beryllium 100"], ["steel 400", "beryllium 200", "carbon 20"], ["steel 600", "beryllium 300", "carbon 30"], ["steel 800", "beryllium 400", "carbon 40", "neutronium 10"], ["steel 1000", "beryllium 500", "carbon 50", "neutronium 20"]],
		extra       : {},
		destroyBonus: ["steel 200", "beryllium 100", "carbon 10"]
	},
	"Electronic Propulsion Station": {
		name        : "Electronic Propulsion Station",
		maintenance : "high",
		description : "Gives ⚡ Electricity",
		crewSize    : 16,
		gives       : [["electricity 3"], ["electricity 5"], ["electricity 10"], ["electricity 15"]],
		costs       : [["beryllium 10", "carbon 50"], ["beryllium 20", "carbon 50", "neutronium 10"], ["beryllium 30", "carbon 80", "neutronium 20"], ["beryllium 40", "carbon 100", "neutronium 20"]],
		extra       : {},
		destroyBonus: ["electricity 10", "steel 50"]
	}
};
const colors = {
	purple  : 0x993499,//Moderation
	yellow  : 0xadb60c,//Research
	pink    : 0xFF21F8,//stations
	red     : 0xce001f,//Invalid, Something Bad
	blue    : 0x00C8C8,//Game Notifications
	darkblue: 0x252FF3,//Factions
	green   : 0x09c612,//Confirmed, Something Good
	darkRed : 0x640000,//Attacking
	orange  : 0xE64403//warn user

};
const resources = {
	names        : ["credits", "steel", "electricity", "food", "people", "beryllium", "research", "titanium", "neutronium", "carbon", "silicon", "power"],
	"credits"    : {
		emoji   : "💠",
		buyRate : 1,
		sellRate: 1
	},
	"steel"      : {
		emoji   : "⛓",
		buyRate : 7,
		sellRate: 5
	},
	"electricity": {
		emoji   : "⚡",
		buyRate : 4,
		sellRate: 2
	},
	"food"       : {
		emoji   : "🍎",
		buyRate : 6,
		sellRate: 5
	},
	"people"     : {
		emoji   : "👦",
		buyRate : 5,
		sellRate: 1
	},
	"beryllium"  : {
		emoji   : "🔗",
		buyRate : 15,
		sellRate: 10
	},
	"research"   : {
		emoji   : "💡",
		buyRate : 7,
		sellRate: 3
	},
	"titanium"   : {
		emoji   : "🔩",
		buyRate : 20,
		sellRate: 10
	},
	"neutronium" : {
		emoji   : "🌀",
		buyRate : 24,
		sellRate: 15
	},
	"carbon"     : {
		emoji   : "⬛",
		buyRate : 18,
		sellRate: 13
	},
	"silicon"    : {
		emoji   : "✴",
		buyRate : 30,
		sellRate: 20
	},
	"power"      : {
		emoji   : "",
		buyRate : 99999999999,
		sellRate: 0
	}
};
let ranks = {
	list          : [0, 50, 100, 250, 500, 1000, 1500, 2000, 2750, 3500, 5000],
	names         : ["Newbie", "Learner", "Recruit", "Beginner", "Toughie", "Intermediate", "Advanced", "Megatron", "Expert", "SuperBeing", "Godlike"],
	"Newbie"      : {
		min : 0,
		max : 3,
		safe: 0,
		dom : 1
	},
	"Learner"     : {
		min : 0,
		max : 5,
		safe: 0,
		dom : 2
	},
	"Recruit"     : {
		min : 1,
		max : 6,
		safe: 1,
		dom : 3
	},
	"Beginner"    : {
		min : 2,
		max : 7,
		safe: 1,
		dom : 4
	},
	"Toughie"     : {
		min : 3,
		max : 8,
		safe: 2,
		dom : 5
	},
	"Intermediate": {
		min : 4,
		max : 9,
		safe: 4,
		dom : 8
	},
	"Advanced"    : {
		min : 5,
		max : 10,
		safe: 6,
		dom : 10
	},
	"Megatron"    : {
		min : 6,
		max : 11,
		safe: 8,
		dom : 12
	},
	"Expert"      : {
		min : 7,
		max : 12,
		safe: 10,
		dom : 15
	},
	"SuperBeing"  : {
		min : 8,
		max : 13,
		safe: 15,
		dom : 20
	},
	"Godlike"     : {
		min : 10,
		max : 15,
		safe: 20,
		dom : 25
	}

};
for (let i = 0; i < ranks.names.length; i++) {
	ranks["" + ranks.names[i]] = {min: 0, max: 0};
}
console.log(ranks);
const powerIncreases = {
	colonize      : 10,
	buildStation  : 10,
	buildMiltary  : 30,
	attackMilitary: 20,
	attackStation : 30,
	attackColony  : 25,
	attackPlayer  : 40,

	stationDestroy : -5,
	colonyDestroy  : -5,
	militaryDestroy: -20
};
const researches = {
	names: ["Inductive Isolation Methods", "Gravitic Purification", "Compressed Laser Generators"],


	/**EVERYTHING is in arrays for each of the levels**/
	"Inductive Isolation Methods": {
		//1:00,1:30,2:00,2:30,3:00
		timesToResearch: [3600000, 5400000, 7200000, 9000000, 10800000],
		does           : [
			"Gives `1%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛ Carbon\n • 🌀 Neutronium\nIf researched",
			"Gives `2%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛ Carbon\n • 🌀 Neutronium\nIf researched",
			"Gives `3%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛ Carbon\n • 🌀 Neutronium\nIf researched",
			"Gives `4%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛ Carbon\n • 🌀 Neutronium\nIf researched",
			"Gives `5%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛ Carbon\n • 🌀 Neutronium\nIf researched"
		],
		costs          : [100, 150, 200, 250, 300]
	},
	"Gravitic Purification"      : {
		timesToResearch: [3600000, 7200000, 14400000, 14400000, 21600000, 21600000, 25200000, 28800000, 600000],
		does           : [
			"Unlocks:\n • Metalloid Accelerator\n • Refining Station level 2\n • Mining Station level 2",
			"Unlocks:\n • Refining Station level 3\n • Mining Station level 3\n • Agriculture Station level 2",
			"Unlocks:\n • Military Station\n • Refining Station level 4\n • Mining Station level 4\n • Research Station level 2\n • Agriculture Station level 3",
			"Unlocks:\n • Magnetic Smelter\n • Research Station level 3\n • Mining Station level 5\n • Military Station level 2\n • Agriculture Station level 4",
			"Unlocks:\n • Electronic Propulsion Station\n • Military Station level 3\n • Magnetic Smelter level 2\n • Agriculture Station level 5",
			"Unlocks:\n • Electronic Propulsion Station level 2\n • Magnetic Smelter level 3",
			"Unlocks:\n • Electronic Propulsion Station level 3\n • Magnetic Smelter level 4",
			"Unlocks:\n • Electronic Propulsion Station level 4\n • Magnetic Smelter level 5",
			"Insurance: keep all of *Gravitic Purification's* research the next time you die"
		],
		costs          : [25, 50, 100, 200, 500, 1000, 1100, 1200, 1300, 100]
	},
	"Compressed Laser Generators": {
		timesToResearch: [3600000, 7200000, 14400000, 21600000, 2800000, 36000000],
		does           : [
			"5% more damage to ships, stations & planets",
			"10% more damage to ships, stations & planets",
			"15% more damage to ships, stations & planets",
			"20% more damage to ships, stations & planets",
			"25% more damage to ships, stations & planets",
			"30% more damage to ships, stations & planets"
		],
		costs          : [50, 130, 200, 450, 700, 1000]
	}
};
const timeTakes = {
	/***
	 *    1000 =  1 second
	 *   60000 =  1 minute
	 *  600000 = 10 minutes
	 * 3600000 =  1 hour
	 */
	colonize        : 60000 * 5,
	attackColony    : 60000 * 10,
	buildStation    : 60000 * 5,
	attackStation   : 60000 * 10,
	warpPerPosition : 1000 * 5,
	factionAdvertise: ((60000 * 60) * 24) * 3,
	collectionRate  : 60000 * 10,
	collectionMax   : 60000 * 120

};
module.exports = {
	ranks     : ranks,
	power     : powerIncreases,
	times     : timeTakes,
	stations  : Station,
	colors    : colors,
	resources : resources,
	researches: researches,
	planets   : planets
};
