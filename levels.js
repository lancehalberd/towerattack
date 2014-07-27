function Level() {
    this.name = "";
    this.location = [0, 0];
    this.waveLimits = [4, 6, 10];
    this.rewards = [cards['single'], cards['single'], cards['single']];
    this.requirements = ['Onette'];
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
    this.$mapMarker = null;
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
function initializeCity(cityData) {
    /** @type City */
    var city = initializeStructure(cityData);
    //default base population to starting population if it isn't set
    if (!city.basePopulation) {
        city.basePopulation = city.population;
    }
    return city;
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
    state.deck = createConcreteDeck(state.currentGame.decks[0]);
    state.selectedElement = null;
    shuffleDeck();
    state.farms = level.farms.map(initializeStructure);
    state.mines = level.mines.map(initializeStructure);
    state.towers = level.towers.map(initializeTower);
    state.nests = level.nests.map(initializeStructure);
    state.cities = level.cities.map(initializeCity);
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
    selectPath(0);
    updateActionButton();
    startCardStep();
    drawLevelScene(true);
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


var levels = [createLevel({"name": "Onette",
"location": [150, 100],
"requirements": [],
"waveLimits": [2,3,5],
"rewards": [abilities['penguins'], abilities['cardinalFlock'], abilities['birdFeed']],
"startingCalories": 10,
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
"location": [300, 150],
"requirements": ["Onette"],
"waveLimits": [3,5,8],
"rewards": [abilities['twinSnakes'], cards['double'], abilities['snakeArmy']],
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
createLevel({"name": "River City",
"location": [250, 100],
"requirements": ["Dead Treeville"],
"waveLimits": [4,6,10],
"rewards": [abilities['fangs'], abilities['quickWings'], abilities['zebraPack']],
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
"cities": [{"classType":"City","tileX":9,"tileY":5,"population":40,"productivity":0.1},{"classType":"City","tileX":5,"tileY":7,"population":40,"productivity":0.1}],
"classType": "Level"
}),
createLevel({"name": "Cloverfield",
"location": [150, 200],
"requirements": ["Dead Treeville"],
"waveLimits": [6, 8, 12],
"rewards": [abilities['scales'], abilities['birdFeed'], abilities['emperorPenguin']],
"startingCalories": 10,
"caloriesPerWave": 2,
"grid": [
  "W0W0000WWW0WW0WW0",
  "W504050WWW00WWWWB",
  "00RRRRRWWWRRRRRWW",
  "04R000RWWWR0WWRWW",
  "01R401RWWWR52WRWW",
  "01R000R0W0R000R0W",
  "WWRRRRRRRRRRRRR10",
  "WWWWWWR500R0WW11W",
  "WWW00WR001RWWWWWW",
  "WWWWWWR001R0WW0WW",
  "WWRRRRRRRRRRRRR3W",
  "WWR020RWWWR500R00",
  "WWRW02RWWWR000R50",
  "WWRWW5RWWWR000R40",
  "0WRRRRRWWWRRRRR40",
  "WWWWWWWWWWWW04000",
  "WWWWWW0WWWWWW0000"
],
"paths": [[[2,14],[2,13],[2,12],[2,11],[2,10],[3,10],[4,10],[5,10],[6,10],[6,9],[6,8],[6,7],[6,6],[5,6],[4,6],[3,6],[2,6],[2,5],[2,4],[2,3],[2,2],[3,2],[4,2],[5,2],[6,2],[6,3],[6,4],[6,5],[6,6],[7,6],[8,6],[9,6],[10,6],[10,5],[10,4],[10,3],[10,2],[11,2],[12,2],[13,2],[14,2]],[[2,14],[3,14],[4,14],[5,14],[6,14],[6,13],[6,12],[6,11],[6,10],[7,10],[8,10],[9,10],[10,10],[10,11],[10,12],[10,13],[10,14],[11,14],[12,14],[13,14],[14,14],[14,13],[14,12],[14,11],[14,10],[13,10],[12,10],[11,10],[10,10],[10,9],[10,8],[10,7],[10,6],[11,6],[12,6],[13,6],[14,6],[14,5],[14,4],[14,3],[14,2]],[[2,14],[3,14],[4,14],[5,14],[6,14],[6,13],[6,12],[6,11],[6,10],[7,10],[8,10],[9,10],[10,10],[10,11],[10,12],[10,13],[10,14],[11,14],[12,14],[13,14],[14,14],[14,13],[14,12],[14,11],[14,10],[13,10],[12,10],[11,10],[10,10],[10,9],[10,8],[10,7],[10,6],[9,6],[8,6],[7,6],[6,6],[6,5],[6,4],[6,3],[6,2],[5,2],[4,2],[3,2],[2,2],[2,3],[2,4],[2,5],[2,6],[3,6],[4,6],[5,6],[6,6],[6,7],[6,8],[6,9],[6,10],[5,10],[4,10],[3,10],[2,10],[2,11],[2,12],[2,13],[2,14]]],
"towers": [{"classType":"Tower","tileX":3,"tileY":3,"typeKey":"basic"},{"classType":"Tower","tileX":13,"tileY":13,"typeKey":"lightning"},{"classType":"Tower","tileX":9,"tileY":7,"typeKey":"lightning"},{"classType":"Tower","tileX":7,"tileY":9,"typeKey":"basic"}],
"mines": [],
"farms": [{"classType":"Farm","tileX":10,"tileY":6,"calories":5},{"classType":"Farm","tileX":10,"tileY":10,"calories":5},{"classType":"Farm","tileX":6,"tileY":6,"calories":5},{"classType":"Farm","tileX":6,"tileY":10,"calories":5}],
"nests": [{"classType":"Nest","tileX":2,"tileY":14},{"classType":"Nest","tileX":14,"tileY":2}],
"cities": [{"classType":"City","tileX":2,"tileY":2,"population":50,"productivity":0.1},{"classType":"City","tileX":14,"tileY":14,"population":50,"productivity":0.1}],
"classType": "Level"
}),
createLevel({"name": "The Citygettee",
"location": [350,50],
"requirements": ["River City"],
"waveLimits": [3,7,15],
"rewards": [abilities['scales'], abilities['birdFeed'], abilities['emperorPenguin']],
"startingCalories": 12,
"caloriesPerWave": 3,
"grid": [
  "00000000000000000",
  "00111011102000000",
  "0120112001112112R",
  "0101100012RRRRRR0",
  "001002011RR000215",
  "010000110R000211R",
  "100001RRRR200100R",
  "000012R00R001000R",
  "001100R02R0011110",
  "002000R0RRRRRRR0R",
  "01RRRRRRR10102R00",
  "01R00021R10111R0W",
  "02R20011R01000R0B",
  "01R01110RRRRRRR0W",
  "00R1200011111000W",
  "00R10011110111100",
  "00000000000000000"
],
"paths": [[[2,15],[2,14],[2,13],[2,12],[2,11],[2,10],[3,10],[4,10],[5,10],[6,10],[6,9],[6,8],[6,7],[6,6],[7,6],[8,6],[9,6],[9,5],[9,4],[10,4],[10,3],[11,3],[12,3],[13,3],[14,3],[15,3]],[[2,15],[2,14],[2,13],[2,12],[2,11],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10],[8,11],[8,12],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13],[14,13],[14,12],[14,11],[14,10],[14,9],[13,9],[12,9],[11,9],[10,9],[9,9],[9,8],[9,7],[9,6],[9,5],[9,4],[10,4],[10,3],[11,3],[12,3],[13,3],[14,3],[15,3]],[[2,15],[2,14],[2,13],[2,12],[2,11],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10],[8,9],[9,9],[9,8],[9,7],[9,6],[9,5],[9,4],[10,4],[10,3],[11,3],[12,3],[13,3],[14,3],[15,3]]],
"towers": [{"classType":"Tower","tileX":7,"tileY":8,"typeKey":"basic"},{"classType":"Tower","tileX":10,"tileY":10,"typeKey":"lightning"},{"classType":"Tower","tileX":8,"tileY":5,"typeKey":"artillery"},{"classType":"Tower","tileX":13,"tileY":12,"typeKey":"lightning"},{"classType":"Tower","tileX":4,"tileY":5,"typeKey":"artillery"}],
"mines": [{"classType":"Mine","tileX":14,"tileY":13,"gold":10}],
"farms": [{"classType":"Farm","tileX":6,"tileY":6,"calories":10}],
"nests": [{"classType":"Nest","tileX":15,"tileY":3},{"classType":"Nest","tileX":2,"tileY":15}],
"cities": [{"classType":"City","tileX":8,"tileY":10,"population":100,"productivity":0.1},{"classType":"City","tileX":9,"tileY":6,"population":100,"productivity":0.1}],
"classType": "Level"
}),
createLevel({"name": "Davidston",
"location": [100,400],
"requirements": ["Onette"],
"waveLimits": [4,6,10],
"rewards": [abilities['fangs'], abilities['quickWings'], abilities['zebraPack']],
"startingCalories": 5,
"caloriesPerWave": 2,
"grid": [
  "0WWWW00WWWWWWW0W0",
  "0000RRRR000000000",
  "0000R00R0RRRRRR00",
  "W000R00R0R0000R00",
  "W000R00R0R0000R0B",
  "0000RR1R0RRR0RR0W",
  "W0000R0R000R0R00W",
  "W0000R0RRR0R0R00W",
  "W0000R000R0R0R00W",
  "W0000R000RRR0R00W",
  "00000RRR0R000R00W",
  "0000000R0RRRRR00W",
  "0000000R2R000R00W",
  "W00RRRRR2RRRRR00W",
  "W00R00002R000000W",
  "000RRRRRRR000000W",
  "0WWWWWWWWWWWW0W00"
],
"paths": [[[9,15],[8,15],[7,15],[6,15],[5,15],[4,15],[3,15],[3,14],[3,13],[4,13],[5,13],[6,13],[7,13],[7,12],[7,11],[7,10],[6,10],[5,10],[5,9],[5,8],[5,7],[5,6],[5,5],[4,5],[4,4],[4,3],[4,2],[4,1],[5,1]],[[9,15],[9,14],[9,13],[10,13],[11,13],[12,13],[13,13],[13,12],[13,11],[12,11],[11,11],[10,11],[9,11],[9,12],[9,13],[9,14],[9,15]],[[5,1],[6,1],[7,1],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7],[8,7],[9,7],[9,8],[9,9],[10,9],[11,9],[11,8],[11,7],[11,6],[11,5],[10,5],[9,5],[9,4],[9,3],[9,2],[10,2],[11,2],[12,2],[13,2],[14,2],[14,3],[14,4],[14,5],[13,5],[13,6],[13,7],[13,8],[13,9],[13,10],[13,11],[13,12],[13,13],[12,13],[11,13],[10,13],[9,13],[9,14],[9,15]]],
"towers": [{"classType":"Tower","tileX":10,"tileY":8,"typeKey":"artillery"},{"classType":"Tower","tileX":3,"tileY":8,"typeKey":"basic"},{"classType":"Tower","tileX":12,"tileY":5,"typeKey":"lightning"}],
"mines": [{"classType":"Mine","tileX":11,"tileY":11,"gold":5}],
"farms": [{"classType":"Farm","tileX":5,"tileY":7,"calories":5}],
"nests": [{"classType":"Nest","tileX":9,"tileY":15},{"classType":"Nest","tileX":5,"tileY":1}],
"cities": [{"classType":"City","tileX":9,"tileY":4,"population":30,"productivity":0.1},{"classType":"City","tileX":5,"tileY":10,"population":30,"productivity":0.1}],
"classType": "Level"
}),
createLevel({"name": "Cannon Alley",
"location": [250,300],
"requirements": ["Onette"],
"waveLimits": [4,6,10],
"rewards": [abilities['twinSnakes'], cards['double'], abilities['snakeArmy']],
"startingCalories": 10,
"caloriesPerWave": 2,
"grid": [
  "W000W00000WW00000",
  "00051515115050000",
  "00RRRRRRRRRRRRR00",
  "05R51132321005R55",
  "00R01RRRR31R00R03",
  "00R00R32R25R40R01",
  "00R00R13R11R00R00",
  "00R05R11R10R00R00",
  "00R00R01R50R00R00",
  "00R00R00R00R00R00",
  "00R50R00R00R00R40",
  "00R00R00R00R00R00",
  "05R00000R04R44R00",
  "00RRRRRRR00RRRR00",
  "00000005000400040",
  "05050000000000000",
  "00000000000000000"
],
"paths": [[[11,4],[11,5],[11,6],[11,7],[11,8],[11,9],[11,10],[11,11],[11,12],[11,13],[12,13],[13,13],[14,13],[14,12],[14,11],[14,10],[14,9],[14,8],[14,7],[14,6],[14,5],[14,4],[14,3],[14,2],[13,2],[12,2],[11,2],[10,2],[9,2],[8,2],[7,2],[6,2],[5,2],[4,2],[3,2],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[2,9],[2,10],[2,11],[2,12],[2,13],[3,13],[4,13],[5,13],[6,13],[7,13],[8,13],[8,12],[8,11],[8,10],[8,9],[8,8],[8,7],[8,6],[8,5],[8,4],[7,4],[6,4],[5,4],[5,5],[5,6],[5,7],[5,8],[5,9],[5,10],[5,11]],[[5,11],[5,10],[5,9],[5,8],[5,7],[5,6],[5,5],[5,4],[6,4],[7,4],[8,4],[8,5],[8,6],[8,7],[8,8],[8,9],[8,10],[8,11],[8,12],[8,13],[7,13],[6,13],[5,13],[4,13],[3,13],[2,13],[2,12],[2,11],[2,10],[2,9],[2,8],[2,7],[2,6],[2,5],[2,4],[2,3],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[14,2],[14,3],[14,4],[14,5],[14,6],[14,7],[14,8],[14,9],[14,10],[14,11],[14,12],[14,13],[13,13],[12,13],[11,13],[11,12],[11,11],[11,10],[11,9],[11,8],[11,7],[11,6],[11,5],[11,4]],[[5,11],[5,10],[5,9],[5,8],[5,7],[5,6],[5,5],[5,4],[6,4],[7,4],[8,4],[8,5],[8,6],[8,7],[8,8],[8,9],[8,10],[8,11],[8,12],[8,13],[7,13],[6,13],[5,13],[4,13],[3,13],[2,13],[2,12],[2,11],[2,10],[2,9],[2,8],[2,7],[2,6],[2,5],[2,4],[2,3],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[14,2],[14,3],[14,4],[14,5],[14,6],[14,7],[14,8],[14,9],[14,10],[14,11],[14,12],[14,13],[13,13],[12,13],[11,13],[11,12],[11,11],[11,10],[11,9],[11,8],[11,7],[11,6],[11,5],[11,4]]],
"towers": [{"classType":"Tower","tileX":4,"tileY":5,"typeKey":"basic"},{"classType":"Tower","tileX":15,"tileY":12,"typeKey":"basic"},{"classType":"Tower","tileX":9,"tileY":11,"typeKey":"artillery"}],
"mines": [],
"farms": [{"classType":"Farm","tileX":14,"tileY":13,"calories":10}],
"nests": [{"classType":"Nest","tileX":5,"tileY":11},{"classType":"Nest","tileX":11,"tileY":4}],
"cities": [{"classType":"City","tileX":8,"tileY":4,"population":40,"productivity":0.1}],
"classType": "Level"
})];

function getEmptyLevel() {
    return createLevel({"name": "New Level",
    "location": [250,300],
    "requirements": ["Onette"],
    "waveLimits": [4,6,10],
    "rewards": [abilities['twinSnakes'], cards['double'], abilities['snakeArmy']],
    "startingCalories": 10,
    "caloriesPerWave": 2,
    "grid": [
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000",
      "00000000000000000"
    ],
    "paths": [[],[],[]],
    "towers": [],
    "mines": [],
    "farms": [],
    "nests": [],
    "cities": [],
    "classType": "Level"
    });
}
