/**
 * @param {String} name
 * @param {Number} startingCalories
 * @param {Number} caloriesPerWave
 * @param {Array} grid
 * @param {Array} paths
 */
function Level(name, startingCalories, caloriesPerWave, grid, paths) {
    this.name = name;
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
    state.totalPopulation = 0;
    state.currentPopulation = 0;
    //discard remainign dealt cards at start of wave
    while (state.dealtCards.length) {
        /** @type Card */
        var card = state.dealtCards.pop();
        if (card) {
            discardCard(state, card);
        }
    }
    shuffleDeck(state);
    state.structures = [];
    for (var i = 0; i < state.mapGrid.length; i++) {
        for (var j = 0; j < state.mapGrid[i].length; j++) {
            if (state.mapGrid[i][j].population > 0) {
                state.totalPopulation += state.mapGrid[i][j].maxPopulation;
                state.currentPopulation += state.mapGrid[i][j].population;
            }
            if (state.mapGrid[i][j].brush) {
                state.structures.push(state.mapGrid[i][j]);
            }
        }
    }
    for (var i = 0; i < level.paths.length; i++) {
        state.paths[i].points = level.paths[i];
        state.paths[i].complete = true;
    }
    //erase any animals currently in the timeline
    for (var i = 0; i < state.paths.length; i++) {
        for (var j = 0; j < state.paths[i].slots.length; j++) {
            state.paths[i].slots[j] = null;
        }
    }
}

var level1 = new Level('Onette', 5, 2,
    [
        "00BBRRR0000RRR0",
        "00BWWWR0RRRR0R0",
        "00FWWWR0R00R0R0",
        "00R0WWB0R00R0R0",
        "00R00WBBCRRR0R0",
        "RRRRR0BWWWR00R0",
        "R000CRBWWWBW0R0",
        "R000R000WWBBBRN",
        "R000R00000RWWWR",
        "R00RRR0000RWWWB",
        "RRRR0R0000R0BBB",
        "00R00RRRRRRRRWW",
        "0RR0000R0000RRW",
        "0R00000R00000R0",
        "0NRRRRRRRRRRRM0"
    ],[
        [[1,14],[1,13],[1,12],[2,12],[2,11],[2,10],[1,10],[0,10],[0,9],[0,8],[0,7],[0,6],[0,5],[1,5],[2,5],[2,4],[2,3],[2,2],[2,1],[2,0],[3,0],[4,0],[5,0],[6,0],[6,1],[6,2],[6,3],[6,4],[7,4],[8,4],[8,3],[8,2],[8,1],[9,1],[10,1],[11,1],[11,0],[12,0],[13,0],[13,1],[13,2],[13,3],[13,4],[13,5],[13,6],[13,7],[14,7]],
        [[1,14],[2,14],[3,14],[4,14],[5,14],[6,14],[7,14],[8,14],[9,14],[10,14],[11,14],[12,14],[13,14],[13,13],[13,12],[12,12],[12,11],[12,10],[13,10],[14,10],[14,9],[14,8],[14,7]],
        [[14,7],[13,7],[12,7],[11,7],[10,7],[10,6],[10,5],[10,4],[9,4],[8,4],[7,4],[6,4],[6,5],[6,6],[5,6],[4,6],[4,7],[4,8],[4,9],[5,9],[5,10],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[12,10],[13,10],[14,10],[14,9],[14,8],[14,7]]
    ]);