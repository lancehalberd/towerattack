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
    state.levelModifiers = {};
    state.waveModifiers = {};
    state.mapGrid = arrayToGrid(level.grid);
    state.calories = level.startingCalories;
    state.gold = 0;
    clearCardArea();
    state.dealtCards = [];
    state.discardedCards = [];
    state.deck = copy(testDeck);
    state.selectedElement = null;
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
    updateActionButton();
    startCardStep();
}

function arrayToGrid(arrayOfStrings) {
    var grid = [];
    $.each(arrayOfStrings, function (i, string) {
        var row = string.split('');
        grid.push(row);
        $.each(row, function (j, string) {
            if (string == 'C') {
                row[j] = new City();
            }
            if (string == 'F') {
                row[j] = new Farm();
            }
            if (string == 'M') {
                row[j] = new Mine();
            }
            if (string == 'N') {
                row[j] = new Nest();
            }
            if (string == 'T') {
                row[j] = getRandomTower();
            }
        });
    });
    return grid;
}


var levels = [createLevel({"name": "River City",
"waveLimits": [2,3,5],
"startingCalories": 3,
"caloriesPerWave": 2,
"grid": [
  "WWWWWWWWWWWWW0000",
  "WWWWWWWWWWWWWW110",
  "0WWWWWWWWWWWWWWW0",
  "0111WWWWWWWWWWWWW",
  "0111111111WWWWWWW",
  "011RRRRRRRRRRR1WW",
  "050R0555R1210R110",
  "030R5555R1212R110",
  "000RRRRRR1212R010",
  "005R1WW1R1212R000",
  "000RWWWWR1212R030",
  "030R2WW0R1212R500",
  "010RRRRRRRRRRR000",
  "00000500000000030",
  "00400000030450040",
  "00003004000004000",
  "00000000000000000"
],
"paths": [[[8,12],[8,11],[8,10],[8,9],[8,8],[8,7],[8,6],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],[13,6],[13,7],[13,8],[13,9],[13,10],[13,11],[13,12],[12,12],[11,12],[10,12],[9,12],[8,12]],[[8,12],[7,12],[6,12],[5,12],[4,12],[3,12],[3,11],[3,10],[3,9],[3,8],[3,7],[3,6],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[8,6],[8,7],[8,8],[8,9],[8,10],[8,11],[8,12]],[[8,12],[8,11],[8,10],[8,9],[8,8],[8,7],[8,6],[8,5],[7,5],[6,5],[5,5],[4,5],[3,5],[3,6],[3,7],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[8,9],[8,10],[8,11],[8,12]]],
"towers": [{"classType":"Tower","tileX":4,"tileY":6,"typeKey":"basic"},{"classType":"Tower","tileX":12,"tileY":6,"typeKey":"lightning"}],
"mines": [],
"farms": [],
"nests": [{"classType":"Nest","tileX":8,"tileY":12}],
"cities": [{"classType":"City","tileX":8,"tileY":5,"population":20,"productivity":0}],
"classType": "Level"
}),
createLevel({"name": "Dead Treeville",
"waveLimits": [3,5,8],
"startingCalories": 10,
"caloriesPerWave": 2,
"grid": [
  "00000000000000000",
  "00004051100100510",
  "00RRRRR1500115110",
  "04R000R0000004000",
  "05R000R000RRRRR10",
  "01R000RRRRR405R50",
  "01RRRRR000R000R00",
  "011R000000R000R00",
  "051R500000R000R00",
  "000R000000R000R00",
  "00RRRRRRRRRRRRR10",
  "03R4030R0001515WW",
  "02R3200R005WWWWWW",
  "04R5300R01WWWWWWW",
  "02RRRRRR00WWWWWWW",
  "035020400WWWWWWWW",
  "000000000WWWWWWWW"
],
"paths": [[[2,14],[2,13],[2,12],[2,11],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[10,9],[10,8],[10,7],[10,6],[10,5],[10,4],[11,4],[12,4],[13,4],[14,4],[14,5],[14,6],[14,7],[14,8],[14,9],[14,10],[13,10],[12,10],[11,10],[10,10],[9,10],[8,10],[7,10],[6,10],[5,10],[4,10],[3,10],[2,10],[2,11],[2,12],[2,13],[2,14]],[[2,14],[2,13],[2,12],[2,11],[2,10],[3,10],[3,9],[3,8],[3,7],[3,6],[2,6],[2,5],[2,4],[2,3],[2,2],[3,2],[4,2],[5,2],[6,2],[6,3],[6,4],[6,5],[6,6],[5,6],[4,6],[3,6],[3,7],[3,8],[3,9],[3,10],[2,10],[2,11],[2,12],[2,13],[2,14]],[[2,14],[2,13],[2,12],[2,11],[2,10],[3,10],[3,9],[3,8],[3,7],[3,6],[2,6],[2,5],[2,4],[2,3],[2,2],[3,2],[4,2],[5,2],[6,2],[6,3],[6,4],[6,5],[7,5],[8,5],[9,5],[10,5],[10,4],[11,4],[12,4],[13,4],[14,4],[14,5],[14,6],[14,7],[14,8],[14,9],[14,10],[13,10],[12,10],[11,10],[10,10],[9,10],[8,10],[7,10],[7,11],[7,12],[7,13],[7,14],[6,14],[5,14],[4,14],[3,14],[2,14]]],
"towers": [{"classType":"Tower","tileX":9,"tileY":6,"typeKey":"lightning"},{"classType":"Tower","tileX":3,"tileY":3,"typeKey":"lightning"},{"classType":"Tower","tileX":8,"tileY":9,"typeKey":"basic"}],
"mines": [],
"farms": [{"classType":"Farm","tileX":6,"tileY":6,"calories":10}],
"nests": [{"classType":"Nest","tileX":2,"tileY":14}],
"cities": [{"classType":"City","tileX":2,"tileY":2,"population":30,"productivity":0.2},{"classType":"City","tileX":10,"tileY":5,"population":30,"productivity":0.2}],
"classType": "Level"
}),
createLevel({"name": "Onette",
"waveLimits": [4,6,10],
"startingCalories": 5,
"caloriesPerWave": 2,
"grid": [
  "0WWW0000000000000",
  "01WBBRRR0131RRR00",
  "031BWWWR1RRRR1R10",
  "010RWWWR2R11R1R30",
  "000R0WWB1R20R1R10",
  "000R12WBBRRRR1R00",
  "0RRRRR2BWWWR22R00",
  "0R010RRBWWWBW1R00",
  "0R131R120WWBBBRR0",
  "0R010R01211RWWWR0",
  "0R00RRR0110RWWWBW",
  "0RRRR0R1310R2BBBW",
  "000R00RRRRRRRRWWW",
  "00RR0131R0100RRWW",
  "00R31010R13100R2W",
  "00RRRRRRRRRRRRR10",
  "00000000000000000"
],
"paths": [[[2,15],[2,14],[2,13],[3,13],[3,12],[3,11],[4,11],[4,10],[5,10],[5,9],[5,8],[5,7],[5,6],[4,6],[3,6],[3,5],[3,4],[3,3],[3,2],[3,1],[4,1],[5,1],[6,1],[7,1],[7,2],[7,3],[7,4],[7,5],[8,5],[9,5],[10,5],[11,5],[11,6],[11,7],[11,8],[12,8],[13,8],[14,8],[15,8]],[[2,15],[3,15],[4,15],[5,15],[6,15],[7,15],[8,15],[9,15],[10,15],[11,15],[12,15],[13,15],[14,15],[14,14],[14,13],[13,13],[13,12],[13,11],[14,11],[15,11],[15,10],[15,9],[15,8]],[[15,8],[14,8],[13,8],[12,8],[11,8],[11,7],[11,6],[11,5],[10,5],[9,5],[8,5],[7,5],[7,6],[7,7],[6,7],[5,7],[5,8],[5,9],[5,10],[6,10],[6,11],[6,12],[7,12],[8,12],[9,12],[10,12],[11,12],[12,12],[13,12],[13,11],[14,11],[15,11],[15,10],[15,9],[15,8]]],
"towers": [{"classType":"Tower","tileX":4,"tileY":4,"typeKey":"lightning"},{"classType":"Tower","tileX":11,"tileY":4,"typeKey":"artillery"},{"classType":"Tower","tileX":8,"tileY":8,"typeKey":"artillery"},{"classType":"Tower","tileX":12,"tileY":13,"typeKey":"basic"}],
"mines": [{"classType":"Mine","tileX":14,"tileY":14,"gold":10}],
"farms": [{"classType":"Farm","tileX":3,"tileY":3,"calories":10}],
"nests": [{"classType":"Nest","tileX":15,"tileY":8},{"classType":"Nest","tileX":2,"tileY":15}],
"cities": [{"classType":"City","tileX":9,"tileY":5,"population":100,"productivity":0.1},{"classType":"City","tileX":5,"tileY":7,"population":100,"productivity":0.1}],
"classType": "Level"
})];
