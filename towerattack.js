var state = new State();

//this triggers when page has finished loading
$(function () {
    initializeGame();
    state.mapGrid =  arrayToGrid(level1.grid);
    for (var i = 0; i < level1.paths.length; i++) {
        state.paths[i].points = level1.paths[i];
        state.paths[i].complete = true;
    }
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
            drawAnimalSprite(game.animalContext, animal.mapX, animal.mapY, 0, state.waveTime, animal.angle);
            drawAnimalHealth(game.animalContext, animal, animal.mapX, animal.mapY);
        }
    }
    drawTimeline(state);
    drawPaths(state, game.pathContext);
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
    state.waveNumber++;
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
    dealCard(state);
}

function changeSpeed() {
    state.waveSpeed*=2;
    if (state.waveSpeed > 8) {
        state.waveSpeed = 1;
    }
    $('.js-fastForward').text('x ' + state.waveSpeed);
}