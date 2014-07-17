/**
 * @param {String} name
 * @param {Array} waveLimits
 * @param {Number} startingCalories
 * @param {Number} caloriesPerWave
 * @param {Array} grid
 * @param {Array} paths
 */
function Level(name, waveLimits, startingCalories, caloriesPerWave, grid, paths) {
    this.name = name;
    this.waveLimits = waveLimits;
    this.grid = grid;
    this.paths = paths;
    this.startingCalories = startingCalories;
    this.caloriesPerWave = caloriesPerWave;
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
    state.population = 0;
    //discard remainign dealt cards at start of wave
    while (state.dealtCards.length) {
        /** @type Card */
        var card = state.dealtCards.pop();
        if (card) {
            discardCard(state, card);
        }
    }
    shuffleDeck();
    state.farms = [];
    state.mines = [];
    state.towers = [];
    state.nests = [];
    state.cities = [];
    for (var i = 0; i < state.mapGrid.length; i++) {
        for (var j = 0; j < state.mapGrid[i].length; j++) {
            if (state.mapGrid[i][j].population > 0) {
                /** @type City */
                var city = state.mapGrid[i][j];
                state.population += city.population;
                city.mapX = j * defaultTileSize;
                city.mapY = i * defaultTileSize;
                state.cities.push(city);
            }
            if (state.mapGrid[i][j].brush == 'T') {
                /** @type Tower */
                var tower = state.mapGrid[i][j];
                tower.mapX = j * defaultTileSize;
                tower.mapY = i * defaultTileSize;
                state.towers.push(tower);
            }
            if (state.mapGrid[i][j].brush == 'F') {
                /** @type Farm */
                var farm = state.mapGrid[i][j];
                farm.mapX = j * defaultTileSize;
                farm.mapY = i * defaultTileSize;
                state.farms.push(farm);
            }
            if (state.mapGrid[i][j].brush == 'M') {
                /** @type Mine */
                var mine = state.mapGrid[i][j];
                mine.mapX = j * defaultTileSize;
                mine.mapY = i * defaultTileSize;
                state.mines.push(mine);
            }
            if (state.mapGrid[i][j].brush == 'N') {
                /** @type Nest */
                var nest = state.mapGrid[i][j];
                nest.mapX = j * defaultTileSize;
                nest.mapY = i * defaultTileSize;
                state.nests.push(nest);
            }
        }
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
    console.log(level.waveLimits);
    selectPath(0);
    updatePlayButton();
}

var level1 = new Level('Onette', [4, 6, 10], 5, 2,
    [
        "10BBRRR0131RRR0",
        "31BWWWR1RRRR1R1",
        "10FWWWR2R11R1R3",
        "00RTWWB1R2TR1R1",
        "00R12WBBCRRR1R0",
        "RRRRR2BWWWR22R0",
        "R010CRBWWWBW1R0",
        "R131R12TWWBBBRN",
        "R010R01221RWWWR",
        "R00RRR0110RWWWB",
        "RRRR0R1310R2BBB",
        "00R00RRRRRRRRWW",
        "0RR0131R010TRRW",
        "0R31010R13100R2",
        "0NRRRRRRRRRRRM1"
    ],[
        [[1,14],[1,13],[1,12],[2,12],[2,11],[2,10],[3,10],[3,9],[4,9],[4,8],[4,7],[4,6],[4,5],[3,5],[2,5],[2,4],[2,3],[2,2],[2,1],[2,0],[3,0],[4,0],[5,0],[6,0],[6,1],[6,2],[6,3],[6,4],[7,4],[8,4],[9,4],[10,4],[10,5],[10,6],[10,7],[11,7],[12,7],[13,7],[14,7]],
        [[1,14],[2,14],[3,14],[4,14],[5,14],[6,14],[7,14],[8,14],[9,14],[10,14],[11,14],[12,14],[13,14],[13,13],[13,12],[12,12],[12,11],[12,10],[13,10],[14,10],[14,9],[14,8],[14,7]],
        [[14,7],[13,7],[12,7],[11,7],[10,7],[10,6],[10,5],[10,4],[9,4],[8,4],[7,4],[6,4],[6,5],[6,6],[5,6],[4,6],[4,7],[4,8],[4,9],[5,9],[5,10],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[12,10],[13,10],[14,10],[14,9],[14,8],[14,7]]
    ]);