
const stations = {
    names: ["Mining Station", "Refining Station", "Research Station"],
    "Mining Station": {
        maintenance: "low",
        description: "Gives ⛓ Steel",
        crewSize: 24,
        gives: [["steel 1"], ["steel 2"], ["steel 4"], ["steel 6"], ["steel 10"]],
        costs: [["steel 5"], ["steel 10"], ["steel 15"], ["steel 30"], ["steel 45"]],
        extra: {level: 5, upgradeTo: "Metalloid Accelerator"},
        destroyBonus: ["steel 10"]
    },
    "Refining Station": {
        maintenance: "medium",
        description: "Converts ⛓ Steel into 🔗 Beryllium",
        crewSize: 16,
        gives: [["steel -10", "beryllium 1"], ["steel -10", "beryllium 2"], ["steel -6", "beryllium 2"], ["steel -4", "beryllium 2"]],
        costs: [["steel 10"], ["steel 15", "beryllium 5"], ["steel 20", "beryllium 10"], ["steel 30", "beryllium 10"]],
        extra: {},
        destroyBonus: ["steel 10", "beryllium 2"]

    },
    "Research Station": {
        maintenance: "low",
        description: "Gives 💡 research",
        crewSize: 14,
        gives: [["research 3"], ["research 6"], ["research 10"]],
        costs: [["steel 20", "beryllium 10"], ["steel 40", "beryllium 20"], ["steel 60", "beryllium 30"]],
        extra: {},
        destroyBonus: ["research 10", "steel 10"]
    }
    /*"Blank Template":{
     maintenance:"",
     description:"",
     crewSize:0,
     gives:[[]],
     costs:[[]],
     extra:{},
     destroyBonus:[]
     },*/
};
const colors = {
    purple: 0x993499,//Moderation
    yellow: 0xadb60c,//Research
    pink: 0xFF21F8,//stations
    red: 0xce001f,//Invalid, Something Bad
    blue: 0x00C8C8,//Game Notifications
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
