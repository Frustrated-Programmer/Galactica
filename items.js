
const stations = {
    names: ["Mining Station", "Refining Station", "Research Station","Agriculture Station","Military Station","Magnetic Smelter","Electronic Propulsion Station"],
    "Mining Station": {
        name:"Mining Station",
        maintenance: "low",
        description: "Gives ⛓ Steel",
        crewSize: 24,
        gives: [["steel 1"], ["steel 2"], ["steel 4"], ["steel 6"], ["steel 10"]],
        costs: [["steel 5"], ["steel 10"], ["steel 15"], ["steel 30"], ["steel 45"]],
        extra: {upgradeTo: "Metalloid Accelerator"},
        destroyBonus: ["steel 10"]
    },
    "Refining Station": {
        name:"Refining Station",
        maintenance: "medium",
        description: "Converts ⛓ Steel into 🔗 Beryllium",
        crewSize: 16,
        gives: [["steel -10", "beryllium 1"], ["steel -10", "beryllium 2"], ["steel -6", "beryllium 2"], ["steel -4", "beryllium 2"]],
        costs: [["steel 10"], ["steel 15", "beryllium 5"], ["steel 20", "beryllium 10"], ["steel 30", "beryllium 10"]],
        extra: {upgradeTo: "Metalloid Accelerator"},
        destroyBonus: ["steel 10", "beryllium 2"]

    },
    "Research Station": {
        name:"Research Station",
        maintenance: "low",
        description: "Gives 💡 research",
        crewSize: 14,
        gives: [["research 3"], ["research 6"], ["research 10"]],
        costs: [["steel 20", "beryllium 10"], ["steel 40", "beryllium 20"], ["steel 60", "beryllium 30"]],
        extra: {},
        destroyBonus: ["research 10", "steel 10"]
    },
    "Agriculture Station": {
        name:"Agriculture Station",
        maintenance: "low",
        description: "gives 🍎 food",
        crewSize: 20,
        gives: [["food 3"], ["food 6"], ["food 10"], ["food 15"], ["food 20"]],
        costs: [["steel 10"], ["steel 20", "food 10"], ["steel 50", "beryllium 10", "food 25"], ["steel 100", "beryllium 20", "food 50"]],
        extra: {},
        destroyBonus: ["food 10"]
    },
    "Military Station": {
        name:"Military Station",
        maintenance: "medium",
        description: "Watches an area and alerts you of any player’s presence and damages and debuffs nearby enemies",
        crewSize: 20,
        gives: [["damage 2"], ["damage 3"], ["damage 4"], ["damage 6"]],
        costs: [["steel 20", "beryllium 5"], ["steel 50", "beryllium 10"], ["steel 100", "beryllium 20"], ["200", "beryllium 50"]],
        extra: {},
        destroyBonus: ["beryllium 10", "steel 50"]
    },
    "Magnetic Smelter": {
        name:"Magnetic Station",
        maintenance: "low",
        description: "Gives 🌀 neutronium  and ⬛ Carbon",
        crewSize: 0,
        gives: [["carbon 1"], ["carbon 2"], ["carbon 3", "neutronium 1"], ["carbon 4", "neutronium 2"], ["carbon 5", "neutronium 3"]],
        costs: [["steel 200", "beryllium 100"], ["steel 400", "beryllium 200", "carbon 20"], ["steel 600", "beryllium 300", "carbon 30"], ["steel 800", "beryllium 400", "carbon 40", "neutronium 10"], ["steel 1000", "beryllium 500", "carbon 50", "neutronium 20"]],
        extra: {},
        destroyBonus: ["steel 200", "beryllium 100", "carbon 10"]
    },
    "Electronic Propulsion Station": {
        name:"Electronic Propulsion Station",
        maintenance: "high",
        description: "Gives ⚡ Electricity",
        crewSize: 16,
        gives: [["electricity 3"],["electricity 5"],["electricity 8"],["electricity 10"],["electricity 16"]],
        costs: [[]],
        extra: {},
        destroyBonus: []
    }
};
const colors = {
    purple: 0x993499,//Moderation
    yellow: 0xadb60c,//Research
    pink: 0xFF21F8,//stations
    red: 0xce001f,//Invalid, Something Bad
    blue: 0x00C8C8,//Game Notifications
    darkblue: 0x252FF3,//Factions
    green: 0x09c612//Confirmed, Something Good

};
const resources = {
    names: ["credits", "steel", "electricity", "food", "people", "beryllium", "research", "titanium", "neutronium", "carbon", "silicon"],
    "credits": "💠",
    "steel": "⛓",
    "electricity": "⚡",
    "food": "🍎",
    "people": "👦",
    "beryllium": "🔗",
    "research": "💡",
    "titanium": "🔩",
    "neutronium": "🌀",
    "carbon": "⬛",
    "silicon": "✴"
};
const researches = {
    names: ["Inductive Isolation Methods", "Gravitic Purification"],


    /**EVERYTHING is in arrays for each of the levels**/
    "Inductive Isolation Methods": {
        //1:00,1:30,2:00,2:30,3:00
        timesToResearch: [3600000, 5400000, 7200000, 9000000, 10800000],
        does: [
            "Gives `1%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched",
            "Gives `2%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched",
            "Gives `3%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched",
            "Gives `4%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched",
            "Gives `5%` more:\n • ⛓ Steel\n • 🔩 Titanium\n • ⬛Carbon\n • 🌀Neutronium\nIf researched"
        ],
        costs: [100, 150, 200, 250, 300]
    },
    "Gravitic Purification": {
        timesToResearch: [3600000, 7200000, 14400000, 14400000, 21600000, 21600000, 600000],
        does: [
            "Unlocks:\n • 🔗 Beryllium\n • Steel Refinery\n • Mining Station 2",
            "Unlocks:\n • 🔩 Titanium\n • Steel Refinery 2\n • Mining Station 3",
            "Unlocks:\n • ⬛ Carbon\n • Steel Refinery 3\n • Mining Station 4\n • Magnetic Smelter",
            "Unlocks:\n • 🌀 Neutronium\n • Steel Refinery 4\n • Magnetic Smelter 2",
            "Unlocks:\n • Steel Refinery 5\n • Mining Station 5\n • Magnetic Smelter 3",
            "🌀 Neutronium and ⬛Carbon structures have 10% less maintenance",
            "Insurance: keep all of *Gravitic Purification's* research the next time you die"
        ],
        costs: [25, 50, 100, 200, 500, 1000, 100]
    }
};

module.exports = {
    stations: stations,
    colors: colors,
    resources: resources,
    researches:researches
};
