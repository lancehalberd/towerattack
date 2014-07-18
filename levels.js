function Level() {
    this.name = "";
    this.waveLimits = [4, 6, 10];
    this.startingCalories = 0;
    this.caloriesPerWave = 2;
    this.grid = [[]];
    this.paths = [[],[],[]];
    this.towers = [];
    this.mines = [];
    this.farms = [];
    this.nests = [];
    this.cities = [];
    this.classType = 'Level';
}
/**
 * Casts an object with levelData into an instance of Level
 *
 * @param {Object} levelData  the data for the level
 * @return {Level}  the instantiated Level
 */
function createLevel(levelData) {
    return objectToInstance(levelData);
}

function initializeStructure(structureData) {
    var structure = objectToInstance(structureData);
    structure.mapX = structure.tileX * defaultTileSize;
    structure.mapY = structure.tileY * defaultTileSize;
    state.mapGrid[structure.tileY][structure.tileX] = structure;
    return structure;
}

function initializeTower(towerData) {
    /** @type Tower */
    var tower = initializeStructure(towerData);
    tower.type = towerTypes[tower.typeKey];
    tower.baseDamage = tower.type.baseDamage;
    tower.damageRange = tower.type.damageRange;
    tower.range = tower.type.range;
    tower.attacksPerSecond = tower.type.attacksPerSecond;
    return tower;
}

/**
 * @param {Level} level
 */
function startLevel(level) {
    state.currentLevel = level;
    state.humanGold = 0;
    state.waveNumber = 0;
    state.abilitiesUsedThisTurn = 0;
    state.step = 'cards';
    state.waveModifiers = {};
    state.mapGrid = arrayToGrid(level.grid);
    state.calories = level.startingCalories;
    state.gold = 0;
    $('.js-cardContainer .card').remove();
    state.dealtCards = [];
    state.discardedCards = [];
    state.deck = copy(testDeck);
    shuffleDeck();
    state.farms = level.farms.map(initializeStructure);
    state.mines = level.mines.map(initializeStructure);
    state.towers = level.towers.map(initializeTower);
    state.nests = level.nests.map(initializeStructure);
    state.cities = level.cities.map(initializeStructure);
    state.population = 0;
    for (var i = 0; i < state.cities.length; i++) {
        state.population += state.cities[i].population;
    }
    for (var i = 0; i < level.paths.length; i++) {
        state.paths[i].oldPoints = state.paths[i].points = level.paths[i];
        state.paths[i].complete = true;
    }
    //erase any animals currently in the timeline
    for (var i = 0; i < state.paths.length; i++) {
        for (var j = 0; j < state.paths[i].slots.length; j++) {
            state.paths[i].slots[j] = null;
        }
    }
    state.waveLimit = level.waveLimits[2];
    drawGrid(game.backgroundContext, state.mapGrid);
    selectPath(0);
    updatePlayButton();
    startCardStep();
}

var basicLevel = createLevel({"name": "River City",
"waveLimits": [2,3,5],
"startingCalories": 10,
"caloriesPerWave": 2,
"grid": [
  "WWWWWWWWWWWWW11",
  "WWWWWWWWWWWWWWW",
  "111WWWWWWWWWWWW",
  "111111111WWWWWW",
  "11RRRRRRRRRRR1W",
  "50R0555R1210R11",
  "30R5555R1212R11",
  "00RRRRRR1212R01",
  "05R1WW1R1212R00",
  "00RWWWWR1212R03",
  "30R2WW5R1212R50",
  "10RRRRRRRRRRR00",
  "000050000000003",
  "040000003045004",
  "000300400000400"
],
"paths": [[[7,11],[7,10],[7,9],[7,8],[7,7],[7,6],[7,5],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[12,5],[12,6],[12,7],[12,8],[12,9],[12,10],[12,11],[11,11],[10,11],[9,11],[8,11],[7,11]],[[7,11],[6,11],[5,11],[4,11],[3,11],[2,11],[2,10],[2,9],[2,8],[2,7],[2,6],[2,5],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[7,5],[7,6],[7,7],[7,8],[7,9],[7,10],[7,11]],[[7,11],[7,10],[7,9],[7,8],[7,7],[7,6],[7,5],[7,4],[6,4],[5,4],[4,4],[3,4],[2,4],[2,5],[2,6],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[7,8],[7,9],[7,10],[7,11]]],
"towers": [{"classType":"Tower","tileX":3,"tileY":5,"typeKey":"basic"},{"classType":"Tower","tileX":11,"tileY":5,"typeKey":"lightning"}],
"mines": [],
"farms": [],
"nests": [{"classType":"Nest","tileX":7,"tileY":11}],
"cities": [{"classType":"City","tileX":7,"tileY":4,"population":20,"productivity":0}],
"classType": "Level"
});
var level1 = createLevel({"name": "Onette",
"waveLimits": [4,6,10],
"startingCalories": 5,
"caloriesPerWave": 2,
"grid": [
  "10BBRRR0131RRR0",
  "31BWWWR1RRRR1R1",
  "10RWWWR2R11R1R3",
  "00R0WWB1R20R1R1",
  "00R12WBBRRRR1R0",
  "RRRRR2BWWWR22R0",
  "R010RRBWWWBW1R0",
  "R131R120WWBBBRR",
  "R010R012R1RWWWR",
  "R00RRR0110RWWWB",
  "RRRR0R1310R2BBB",
  "00R00RRRRRRRRWW",
  "0RR0131R0100RRW",
  "0R31010R13100R2",
  "0RRRRRRRRRRRRR1"
],
"paths": [[[1,14],[1,13],[1,12],[2,12],[2,11],[2,10],[3,10],[3,9],[4,9],[4,8],[4,7],[4,6],[4,5],[3,5],[2,5],[2,4],[2,3],[2,2],[2,1],[2,0],[3,0],[4,0],[5,0],[6,0],[6,1],[6,2],[6,3],[6,4],[7,4],[8,4],[9,4],[10,4],[10,5],[10,6],[10,7],[11,7],[12,7],[13,7],[14,7]],[[1,14],[2,14],[3,14],[4,14],[5,14],[6,14],[7,14],[8,14],[9,14],[10,14],[11,14],[12,14],[13,14],[13,13],[13,12],[12,12],[12,11],[12,10],[13,10],[14,10],[14,9],[14,8],[14,7]],[[14,7],[13,7],[12,7],[11,7],[10,7],[10,6],[10,5],[10,4],[9,4],[8,4],[7,4],[6,4],[6,5],[6,6],[5,6],[4,6],[4,7],[4,8],[4,9],[5,9],[5,10],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[12,10],[13,10],[14,10],[14,9],[14,8],[14,7]]],
"towers": [{"classType":"Tower","tileX":3,"tileY":3,"typeKey":"lightning"},{"classType":"Tower","tileX":10,"tileY":3,"typeKey":"artillery"},{"classType":"Tower","tileX":7,"tileY":7,"typeKey":"artillery"},{"classType":"Tower","tileX":11,"tileY":12,"typeKey":"basic"}],
"mines": [{"classType":"Mine","tileX":8,"tileY":8,"gold":10}],
"farms": [{"classType":"Farm","tileX":2,"tileY":2,"calories":10}],
"nests": [{"classType":"Nest","tileX":14,"tileY":7},{"classType":"Nest","tileX":1,"tileY":14}],
"cities": [{"classType":"City","tileX":8,"tileY":4,"population":100,"productivity":0.1},{"classType":"City","tileX":4,"tileY":6,"population":100,"productivity":0.1}],
"classType": "Level"
});