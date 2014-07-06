var state = new State();

//this triggers when page has finished loading
$(function () {
    initializeGame();
    startLevel(level1);
    updateInformation();
    state.deck = testDeck;
    initializeCardArea(state);
    $('.js-edit').on('click', toggleEditing);
    $('.js-play').on('click', startWave);
    $('.js-fastForward').on('click', changeSpeed);
    addTimelineInteractions(state);
});

function startGame() {
    dealCard(state);
    drawGrid(game.backgroundContext, state.mapGrid);
    drawPaths(state, game.pathContext);
    setInterval(mainLoop, frameLength);
    var drawingPath = false;
    var drawingTiles = false;
    $('.js-mapContainer').on('mousedown', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var x = event.pageX - $('.js-mapContainer').offset().left;
        var y = event.pageY - $('.js-mapContainer').offset().top - 2;
        var tileX = Math.floor(x / 30);
        var tileY = Math.floor(y / 30);
        if (state.editingMap) {
            drawTile(state.mapGrid, tileX, tileY, state.brush);
            drawingTiles = true;
        } else if (state.step == 'cards') {
            drawingPath = true;
            //clicking on a nest restarts the path
            if (getGridValue(state.mapGrid, tileX, tileY) == 'N') {
                state.paths[state.selectedPath].points = [[tileX, tileY]];
                state.paths[state.selectedPath].complete = false;
            } else {
                editPath(state, tileX, tileY);
            }
        }
    });
    $(document).on('mousemove', function (event) {
        var x = event.pageX - $('.js-mapContainer').offset().left;
        var y = event.pageY - $('.js-mapContainer').offset().top - 2;
        var tileX = Math.floor(x / 30);
        var tileY = Math.floor(y / 30);
        if (drawingTiles && inGrid(state.mapGrid, tileX, tileY)) {
            drawTile(state.mapGrid, tileX, tileY, state.brush);
        }
        if (!drawingPath) {
            return;
        }
        if (tileX < 0 || tileY < 0 || tileX >= 15 || tileY >= 15) {
            return;
        }
        if (!state.editingMap) {
            editPath(state, tileX, tileY);
        }
    });
    $(document).on('mouseup', function (event) {
        drawingPath = false;
        drawingTiles= false;
    });
    $('.exportMap').on('click', function (event) {
        var exportRows = [];
        $.each(state.mapGrid, function (i, row) {
            exportRows.push('"' + row.join('') + '"');
        });
        var result = "[\n" + exportRows.join(",\n") + "];\n";
        $.each(state.paths, function (i, path) {
            result += JSON.stringify(path.points) + ";\n";
        });
        $('.output').val(result);
    });
}
function drawTile(grid, x, y, brush) {
    if (brush == 'W' && (grid[y][x] == 'R' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else if (brush == 'R' && (grid[y][x] == 'W' || grid[y][x] == 'B')) {
        grid[y][x] = 'B'
    } else {
        grid[y][x] = brush;
    }
    drawGrid(game.backgroundContext, grid);
}

function toggleEditing() {
    state.editingMap = !state.editingMap;
    $('.js-edit').text(state.editingMap ? 'Stop Editing' : 'Start Editing');
    $('.js-mapEditor').toggle(state.editingMap);
    $('.js-cardContainer').toggle(!state.editingMap);
}

var frameLength = 40;
function mainLoop() {
    //update the model for N frames
    for (var frame = 0; frame < state.waveSpeed; frame++) {
        state.gameTime += frameLength;
        if (state.step == 'wave') {
            state.waveTime += frameLength;
            var finished = true;
            for (var i = 0; i < state.animals.length; i++) {
                /** @type Animal */
                var animal = state.animals[i];
                if (animal.finished) {
                    continue;
                }
                finished = false;
                //do nothing if the animal isn't spawned yet
                if (state.waveTime < animal.spawnTime) {
                    continue;
                }
                //move the animal each frame after it spawns
                if (state.waveTime > animal.spawnTime) {
                    animal.distance += 10 * animal.speed * frameLength / 1000;
                    var tileValue = state.mapGrid[animal.tileY][animal.tileX];
                    if (tileValue != animal.lastTile) {
                        if (tileValue.brush == 'C') {
                            /** @type City */
                            var city = tileValue;
                            if (city.population < animal.damage) {
                                state.population -= city.population;
                                city.population = 0;
                            } else {
                                city.population -= animal.damage;
                                state.population -= animal.damage;
                            }
                        }
                        if (tileValue.brush == 'M') {
                            /** @type Mine */
                            var mine = tileValue;
                            if (animal.burden < animal.carry && mine.waveGold > 0) {
                                mine.waveGold--;
                                state.gold++;
                                animal.burden++;
                            }
                        }
                        if (tileValue.brush == 'F') {
                            /** @type Farm */
                            var farm = tileValue;
                            if (animal.burden < animal.carry && farm.waveCalories > 0) {
                                farm.waveCalories--;
                                state.calories++;
                                animal.burden++;
                            }
                        }
                        animal.lastTile = tileValue;
                    }
                    if (Math.random() < .02) {
                        animal.currentHealth -= 1;
                    }
                }
                if (animal.currentHealth <= 0) {
                    animal.currentHealth = 0;
                    animal.finished = true;
                    animal.dead = true;
                }
                updateAnimalPosition(animal);
            }
            if (finished) {
                endWave();
            }
        }
    }
    //draw the current state
    game.animalContext.clearRect(0, 0, 510, 510);
    if (state.step == 'wave') {
        for (var i = 0; i < state.animals.length; i++) {
            /** @type Animal */
            var animal = state.animals[i];
            if (animal.finished || state.waveTime < animal.spawnTime) {
                continue;
            }
            drawAnimalSprite(game.animalContext, animal.mapX, animal.mapY, animal.type.spriteIndex, state.waveTime, animal.angle);
            drawAnimalHealth(game.animalContext, animal, animal.mapX, animal.mapY);
        }
    }
    drawTimeline(state);
    drawPaths(state, game.pathContext);
    updateInformation();
}

function startWave() {
    if (state.step == 'wave') {
        return;
    }
    state.animals = [];
    for (var i = 0; i < state.paths.length; i++) {
        for (var j = 0; j < state.paths[i].slots.length; j++) {
            /** @type Animal */
            var animal = state.paths[i].slots[j];
            if (animal) {
                animal.spawnTime = j * 200;
                animal.path = state.paths[i];
                animal.finished = false;
                animal.distance = 0;
                animal.lastTile = null;
                animal.burden = 0;
                state.animals.push(animal);
                if (!state.paths[i].complete) {
                    state.selectedPath = i;
                    return;
                }
            }
        }
        //if this path is incomplete but also empty, just erase it at the start of the wave
        if (!state.paths[i].complete) {
            state.paths[i].points = [];
        }
    }
    state.step = 'wave';
    state.waveTime = 0;
    //discard remainign dealt cards at start of wave
    while (state.dealtCards.length) {
        /** @type Card */
        var card = state.dealtCards.pop();
        if (card) {
            discardCard(state, card);
        }
    }
}

function endWave() {
    //clear all wave modifiers at the end of the wave
    state.waveModifiers = {};
    state.waveNumber++;
    //update animals now that wave # has changed and wave modifiers are gone
    $.each(state.animals, function (i, animal) {
        updateAnimal(state, animal);
    });
    var cities = [];
    //calculate assets humans gain from structures
    $.each(state.structures, function (i, structure) {
        //humans get gold from each city based on population left
        if (structure.brush == 'C') {
            /** @type City */
            var city = structure;
            state.humanGold += Math.floor(city.productivity * city.population);
            if (city.population > 0) {
                cities.push(city);
            }
        }
        //humans get gold from mines that the animals failed to steal
        if (structure.brush == 'M') {
            /** @type Mine */
            var mine = structure;
            state.humanGold += mine.waveGold;
            mine.waveGold = mine.gold;
        }
        //humans get calories from mines that the animals failed to steal
        if (structure.brush == 'F') {
            /** @type Farm */
            var farm = structure;
            state.humanCalories += farm.waveCalories;
            farm.waveCalories = farm.calories;
        }
    });
    state.population = 0;
    $.each(cities, function (index, city) {
        city.population += .1 * state.humanCalories / cities.length;
        state.population += city.population;
    });
    state.population = state.population.toFixed(1);
    state.humanCalories = 0;
    state.step = 'cards';
    state.abilitiesUsedThisTurn = 0;
    for (var i = 0; i < state.paths.length; i++) {
        for (var j = 0; j < state.paths[i].slots.length; j++) {
            /** @type Animal */
            var animal = state.paths[i].slots[j];
            if (animal && animal.dead) {
                state.paths[i].slots[j] = null;
            }
        }
    }
    state.calories += state.currentLevel.caloriesPerWave;
    dealCard(state);
    updateInformation();
}

function changeSpeed() {
    state.waveSpeed *= 2;
    if (state.waveSpeed > 8) {
        state.waveSpeed = 1;
    }
    $('.js-fastForward').text('x ' + state.waveSpeed);
}

function updateInformation() {
    $('.js-levelName').text(state.currentLevel.name);
    $('.js-population').text('Population: ' + state.population + 'K');
    $('.js-humanGold').text('Gold: ' + state.humanGold);
    $('.js-myCalories').text('Calories: ' + state.calories);
    $('.js-myGold').text('Gold: ' + state.gold);
}